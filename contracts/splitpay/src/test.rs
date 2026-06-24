#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env, String};

fn setup(env: &Env) -> (SplitPayContractClient, Address) {
    let contract_id = env.register(SplitPayContract, ());
    let client = SplitPayContractClient::new(env, &contract_id);
    let native = Address::generate(env);
    client.initialize(&native);
    (client, native)
}

#[test]
fn create_group_adds_creator_as_member() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let group_id = client.create_group(&alice, &String::from_str(&env, "Tokyo Trip"));

    let group = client.get_group(&group_id);
    assert_eq!(group.members.len(), 1);
    assert_eq!(group.members.get(0).unwrap(), alice);
    assert_eq!(group.name, String::from_str(&env, "Tokyo Trip"));
}

#[test]
fn join_group_adds_new_member() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let group_id = client.create_group(&alice, &String::from_str(&env, "Roommates"));

    client.join_group(&group_id, &bob);

    let group = client.get_group(&group_id);
    assert_eq!(group.members.len(), 2);
}

#[test]
fn join_group_rejects_duplicate_member() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let group_id = client.create_group(&alice, &String::from_str(&env, "Solo"));

    let result = client.try_join_group(&group_id, &alice);
    assert!(result.is_err());
}

#[test]
fn add_expense_and_read_balances_equal_split() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let carol = Address::generate(&env);

    let group_id = client.create_group(&alice, &String::from_str(&env, "Dinner"));
    client.join_group(&group_id, &bob);
    client.join_group(&group_id, &carol);

    // Alice pays 300 XLM (in stroops), split evenly across all 3.
    let amount: i128 = 300 * 10_000_000;
    let participants = vec![&env, alice.clone(), bob.clone(), carol.clone()];
    client.add_expense(
        &group_id,
        &alice,
        &String::from_str(&env, "Dinner at izakaya"),
        &amount,
        &participants,
    );

    let balances = client.get_balances(&group_id);

    let mut by_addr = std::collections::HashMap::new();
    for b in balances.iter() {
        by_addr.insert(b.member.clone(), b.net);
    }

    // Alice fronted 300, owes a 100 share herself -> net +200
    assert_eq!(*by_addr.get(&alice).unwrap(), 200 * 10_000_000);
    // Bob and Carol each owe their 100 share -> net -100
    assert_eq!(*by_addr.get(&bob).unwrap(), -100 * 10_000_000);
    assert_eq!(*by_addr.get(&carol).unwrap(), -100 * 10_000_000);
}

#[test]
fn add_expense_rejects_non_member_participant() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let outsider = Address::generate(&env);
    let group_id = client.create_group(&alice, &String::from_str(&env, "Trip"));

    let amount: i128 = 100 * 10_000_000;
    let participants = vec![&env, alice.clone(), outsider.clone()];

    let result = client.try_add_expense(
        &group_id,
        &alice,
        &String::from_str(&env, "Taxi"),
        &amount,
        &participants,
    );
    assert!(result.is_err());
}

#[test]
fn compute_settlement_minimizes_transfers_for_three_party_cycle() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let carol = Address::generate(&env);

    let group_id = client.create_group(&alice, &String::from_str(&env, "Trip"));
    client.join_group(&group_id, &bob);
    client.join_group(&group_id, &carol);

    let all = vec![&env, alice.clone(), bob.clone(), carol.clone()];

    // Alice pays 300 for everyone -> Bob -100, Carol -100, Alice +200
    client.add_expense(
        &group_id,
        &alice,
        &String::from_str(&env, "Hotel"),
        &(300 * 10_000_000i128),
        &all,
    );

    let transfers = client.compute_settlement(&group_id);

    // Expect exactly 2 transfers (Bob->Alice, Carol->Alice), not 3+.
    assert_eq!(transfers.len(), 2);

    let total_moved: i128 = transfers.iter().map(|t| t.amount).sum();
    assert_eq!(total_moved, 200 * 10_000_000);

    for t in transfers.iter() {
        assert_eq!(t.to, alice);
        assert_eq!(t.amount, 100 * 10_000_000);
    }
}

#[test]
fn compute_settlement_on_balanced_group_returns_no_transfers() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let group_id = client.create_group(&alice, &String::from_str(&env, "Even"));
    client.join_group(&group_id, &bob);

    let pair = vec![&env, alice.clone(), bob.clone()];

    // Alice pays 100, Bob pays 100, same participants -> nets to zero.
    client.add_expense(
        &group_id,
        &alice,
        &String::from_str(&env, "Lunch"),
        &(100 * 10_000_000i128),
        &pair,
    );
    client.add_expense(
        &group_id,
        &bob,
        &String::from_str(&env, "Coffee"),
        &(100 * 10_000_000i128),
        &pair,
    );

    let transfers = client.compute_settlement(&group_id);
    assert_eq!(transfers.len(), 0);
}

#[test]
fn mark_group_settled_clears_balances() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let group_id = client.create_group(&alice, &String::from_str(&env, "Trip"));
    client.join_group(&group_id, &bob);

    let pair = vec![&env, alice.clone(), bob.clone()];
    client.add_expense(
        &group_id,
        &alice,
        &String::from_str(&env, "Snacks"),
        &(50 * 10_000_000i128),
        &pair,
    );

    client.mark_group_settled(&group_id, &alice);

    let balances = client.get_balances(&group_id);
    for b in balances.iter() {
        assert_eq!(b.net, 0);
    }
}

#[test]
fn add_expense_rejects_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _native) = setup(&env);

    let alice = Address::generate(&env);
    let group_id = client.create_group(&alice, &String::from_str(&env, "Solo"));
    let participants = vec![&env, alice.clone()];

    let result = client.try_add_expense(
        &group_id,
        &alice,
        &String::from_str(&env, "Nothing"),
        &0i128,
        &participants,
    );
    assert!(result.is_err());
}
