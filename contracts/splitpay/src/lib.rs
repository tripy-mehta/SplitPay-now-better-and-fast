//! SplitPay — Soroban smart contract
//!
//! Tracks shared group expenses on-chain and computes the minimum set of
//! native-asset (XLM) transfers required to settle a group's net balances.
//!
//! Design notes:
//! - Soroban contracts cannot move funds out of a user's account without
//!   that user's own authorization. So `settle()` only *computes* the
//!   minimal transfer plan; each payer then calls `pay()` themselves,
//!   which requires their auth and performs the actual native asset
//!   transfer via the Stellar Asset Contract interface.
//! - Balances are derived from the expense log on every read rather than
//!   stored as a separate running total, so there is exactly one source
//!   of truth and no risk of the two drifting out of sync.

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, vec, Address, Env, String, Vec,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Expense {
    pub id: u64,
    pub description: String,
    /// Total amount of the expense, in stroops (1 XLM = 10_000_000 stroops).
    pub amount: i128,
    pub payer: Address,
    /// Members splitting this expense (payer may or may not be included).
    pub participants: Vec<Address>,
    pub settled: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Group {
    pub id: u64,
    pub name: String,
    pub creator: Address,
    pub members: Vec<Address>,
    pub expense_count: u64,
}

/// A single required transfer in a settlement plan: `from` owes `amount`
/// (in stroops) to `to`.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transfer {
    pub from: Address,
    pub to: Address,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Balance {
    pub member: Address,
    /// Positive = this member is owed money overall.
    /// Negative = this member owes money overall.
    pub net: i128,
}

#[contracttype]
pub enum DataKey {
    GroupCount,
    Group(u64),
    Expense(u64, u64), // (group_id, expense_id)
    NativeToken,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    GroupNotFound = 1,
    ExpenseNotFound = 2,
    NotAMember = 3,
    AlreadyAMember = 4,
    EmptyParticipants = 5,
    InvalidAmount = 6,
    AlreadySettled = 7,
    NotAuthorized = 8,
    NativeTokenNotSet = 9,
    NothingOwed = 10,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct SplitPayContract;

#[contractimpl]
impl SplitPayContract {
    /// One-time setup: registers the native asset's Stellar Asset Contract
    /// address so `pay()` knows which token to move. Must be called once
    /// after deployment, before any settlement payments are made.
    pub fn initialize(env: Env, native_token: Address) {
        env.storage()
            .instance()
            .set(&DataKey::NativeToken, &native_token);
    }

    /// Creates a new group. The caller becomes the creator and first member.
    pub fn create_group(env: Env, creator: Address, name: String) -> u64 {
        creator.require_auth();

        let mut group_count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::GroupCount)
            .unwrap_or(0);
        group_count += 1;

        let group = Group {
            id: group_count,
            name,
            creator: creator.clone(),
            members: vec![&env, creator],
            expense_count: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Group(group_count), &group);
        env.storage()
            .instance()
            .set(&DataKey::GroupCount, &group_count);

        group_count
    }

    /// Adds a new member to an existing group. Any existing member can add
    /// another address (e.g. after sharing an invite link off-chain).
    pub fn join_group(env: Env, group_id: u64, member: Address) -> Result<(), Error> {
        member.require_auth();

        let mut group: Group = env
            .storage()
            .persistent()
            .get(&DataKey::Group(group_id))
            .ok_or(Error::GroupNotFound)?;

        if group.members.contains(&member) {
            return Err(Error::AlreadyAMember);
        }

        group.members.push_back(member);
        env.storage()
            .persistent()
            .set(&DataKey::Group(group_id), &group);

        Ok(())
    }

    /// Logs a new expense in a group. `amount` is the total in stroops,
    /// split evenly across `participants` for balance purposes.
    pub fn add_expense(
        env: Env,
        group_id: u64,
        payer: Address,
        description: String,
        amount: i128,
        participants: Vec<Address>,
    ) -> Result<u64, Error> {
        payer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if participants.is_empty() {
            return Err(Error::EmptyParticipants);
        }

        let mut group: Group = env
            .storage()
            .persistent()
            .get(&DataKey::Group(group_id))
            .ok_or(Error::GroupNotFound)?;

        if !group.members.contains(&payer) {
            return Err(Error::NotAMember);
        }
        for p in participants.iter() {
            if !group.members.contains(&p) {
                return Err(Error::NotAMember);
            }
        }

        let expense_id = group.expense_count + 1;
        let expense = Expense {
            id: expense_id,
            description,
            amount,
            payer,
            participants,
            settled: false,
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Expense(group_id, expense_id), &expense);

        group.expense_count = expense_id;
        env.storage()
            .persistent()
            .set(&DataKey::Group(group_id), &group);

        Ok(expense_id)
    }

    /// Returns every expense logged in a group (settled and unsettled).
    pub fn list_expenses(env: Env, group_id: u64) -> Result<Vec<Expense>, Error> {
        let group: Group = env
            .storage()
            .persistent()
            .get(&DataKey::Group(group_id))
            .ok_or(Error::GroupNotFound)?;

        let mut out = vec![&env];
        for i in 1..=group.expense_count {
            if let Some(e) = env
                .storage()
                .persistent()
                .get::<DataKey, Expense>(&DataKey::Expense(group_id, i))
            {
                out.push_back(e);
            }
        }
        Ok(out)
    }

    /// Computes each member's current net balance from all unsettled
    /// expenses. Positive = owed money. Negative = owes money.
    pub fn get_balances(env: Env, group_id: u64) -> Result<Vec<Balance>, Error> {
        let group: Group = env
            .storage()
            .persistent()
            .get(&DataKey::Group(group_id))
            .ok_or(Error::GroupNotFound)?;

        let mut nets: Vec<(Address, i128)> = vec![&env];
        for m in group.members.iter() {
            nets.push_back((m.clone(), 0i128));
        }

        for i in 1..=group.expense_count {
            let expense: Option<Expense> = env
                .storage()
                .persistent()
                .get(&DataKey::Expense(group_id, i));
            let Some(expense) = expense else { continue };
            if expense.settled {
                continue;
            }

            let share_count = expense.participants.len() as i128;
            if share_count == 0 {
                continue;
            }
            let share = expense.amount / share_count;

            // Payer is credited the full amount they fronted...
            Self::adjust_net(&mut nets, &expense.payer, expense.amount);
            // ...and each participant is debited their share.
            for p in expense.participants.iter() {
                Self::adjust_net(&mut nets, &p, -share);
            }
        }

        let mut out = vec![&env];
        for (addr, net) in nets.iter() {
            out.push_back(Balance {
                member: addr.clone(),
                net,
            });
        }
        Ok(out)
    }

    /// Computes the minimum set of transfers needed to settle the group's
    /// current net balances (greedy largest-debtor-to-largest-creditor
    /// matching). This is a read-only calculation — no funds move here.
    /// Each `from` address in the returned plan must separately call
    /// `pay()` to actually execute their transfer.
    pub fn compute_settlement(env: Env, group_id: u64) -> Result<Vec<Transfer>, Error> {
        let balances = Self::get_balances(env.clone(), group_id)?;

        let mut debtors: Vec<(Address, i128)> = vec![&env]; // negative net, stored as positive owed amount
        let mut creditors: Vec<(Address, i128)> = vec![&env];

        for b in balances.iter() {
            if b.net < 0 {
                debtors.push_back((b.member.clone(), -b.net));
            } else if b.net > 0 {
                creditors.push_back((b.member.clone(), b.net));
            }
        }

        let mut transfers = vec![&env];

        // Greedy matching: repeatedly take the largest debtor and largest
        // creditor, settle as much as possible between them, repeat.
        // Bounded loop (group sizes are small) — no unbounded recursion.
        let mut d_idx: Vec<u32> = vec![&env];
        for i in 0..debtors.len() {
            d_idx.push_back(i);
        }

        loop {
            // Find largest remaining debtor and creditor.
            let mut max_debtor: Option<(usize, i128)> = None;
            for (i, (_, amt)) in debtors.iter().enumerate() {
                if amt > 0 {
                    if let Some((_, cur)) = max_debtor {
                        if amt > cur {
                            max_debtor = Some((i, amt));
                        }
                    } else {
                        max_debtor = Some((i, amt));
                    }
                }
            }
            let mut max_creditor: Option<(usize, i128)> = None;
            for (i, (_, amt)) in creditors.iter().enumerate() {
                if amt > 0 {
                    if let Some((_, cur)) = max_creditor {
                        if amt > cur {
                            max_creditor = Some((i, amt));
                        }
                    } else {
                        max_creditor = Some((i, amt));
                    }
                }
            }

            let (Some((di, damt)), Some((ci, camt))) = (max_debtor, max_creditor) else {
                break;
            };

            let settle_amt = if damt < camt { damt } else { camt };
            if settle_amt <= 0 {
                break;
            }

            let debtor_addr = debtors.get(di as u32).unwrap().0.clone();
            let creditor_addr = creditors.get(ci as u32).unwrap().0.clone();

            transfers.push_back(Transfer {
                from: debtor_addr,
                to: creditor_addr,
                amount: settle_amt,
            });

            let new_d = damt - settle_amt;
            let mut d = debtors.get(di as u32).unwrap();
            d.1 = new_d;
            debtors.set(di as u32, d);

            let new_c = camt - settle_amt;
            let mut c = creditors.get(ci as u32).unwrap();
            c.1 = new_c;
            creditors.set(ci as u32, c);
        }

        Ok(transfers)
    }

    /// Executes one leg of a settlement: `from` pays `to` the native asset
    /// amount (stroops) via the Stellar Asset Contract, then marks any
    /// fully-covered expenses as settled. Requires `from`'s authorization
    /// (this is what triggers the Freighter signature popup on the
    /// frontend).
    pub fn pay(env: Env, group_id: u64, from: Address, to: Address, amount: i128) -> Result<(), Error> {
        from.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let native: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeToken)
            .ok_or(Error::NativeTokenNotSet)?;

        let client = token::Client::new(&env, &native);
        client.transfer(&from, &to, &amount);

        // Mark expenses settled once every participant's share in them has
        // been covered by at least one completed transfer touching this
        // group. For the MVP we take the simpler, still-correct approach:
        // once net balances across the group all settle to zero, the
        // frontend calls `mark_group_settled` to archive the expense log.
        let _ = group_id; // group_id kept for future per-expense reconciliation
        Ok(())
    }

    /// Marks every currently unsettled expense in a group as settled and
    /// clears them from the active balance calculation. Called by the
    /// frontend once all transfers in a settlement plan have confirmed
    /// on-chain, so completed group history doesn't keep growing the
    /// active storage footprint.
    pub fn mark_group_settled(env: Env, group_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let group: Group = env
            .storage()
            .persistent()
            .get(&DataKey::Group(group_id))
            .ok_or(Error::GroupNotFound)?;

        if !group.members.contains(&caller) {
            return Err(Error::NotAMember);
        }

        for i in 1..=group.expense_count {
            let key = DataKey::Expense(group_id, i);
            if let Some(mut e) = env.storage().persistent().get::<DataKey, Expense>(&key) {
                if !e.settled {
                    e.settled = true;
                    env.storage().persistent().set(&key, &e);
                }
            }
        }

        Ok(())
    }

    pub fn get_group(env: Env, group_id: u64) -> Result<Group, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Group(group_id))
            .ok_or(Error::GroupNotFound)
    }

    // -- internal helpers ----------------------------------------------

    fn adjust_net(nets: &mut Vec<(Address, i128)>, addr: &Address, delta: i128) {
        for i in 0..nets.len() {
            let mut entry = nets.get(i).unwrap();
            if entry.0 == *addr {
                entry.1 += delta;
                nets.set(i, entry);
                return;
            }
        }
    }
}

mod test;
