# SplitPay

**Cross-border group expense settlement on Stellar.**

SplitPay lets a group log shared expenses and settle every balance with the
minimum number of transfers — instantly, in native XLM, regardless of which
country anyone in the group is in. Built for Stellar Builder Track, Level 4.

---

## The problem

Splitwise-style apps solve the bookkeeping (who paid, who owes what) but
settlement still happens off-platform: bank transfers, Venmo, or an IOU that
quietly never gets paid. That breaks down completely once a group spans
countries — international student groups, remote teams, and friends who
travel together have no fast, cheap, peer-to-peer way to actually close out
a shared debt.

## What SplitPay does

1. A group logs shared expenses on-chain (who paid, how much, who's splitting it)
2. A Soroban smart contract maintains the live ledger and computes each
   member's net balance in real time
3. When it's time to settle, the contract runs a **debt-simplification
   algorithm** to compute the minimum set of transfers needed to zero out
   the entire group — turning "5 people owe each other money" into one or
   two clean transactions instead of N(N-1) one-to-one payments
4. Each required payer signs their own transfer via Freighter; funds move
   in native XLM and settle on Stellar in seconds

## Why Stellar

Stellar is built for moving value between people and regions instantly and
cheaply — exactly the gap that breaks cross-border expense settlement today.
This project also puts real programmable logic on top of that rail: the
contract isn't just relaying a payment, it's computing an optimized
multi-party settlement plan that a simple wallet-to-wallet transfer can't do
on its own.

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────────┐
│   Next.js Frontend   │         │   Soroban Contract        │
│                      │  RPC    │   (Rust, contracts/splitpay)│
│  Freighter (wallet)  │◄───────►│                            │
│  Tailwind UI         │         │  • Groups & membership     │
│  PostHog analytics   │         │  • Expense log             │
│  Sentry monitoring   │         │  • Balance calculation      │
└─────────────────────┘         │  • Debt-simplified settle   │
                                  └──────────────────────────┘
                                              │
                                              ▼
                                  Stellar Asset Contract
                                  (native XLM transfers)
```

**Data flow for settlement** (the core technical piece):
1. Frontend calls `compute_settlement(group_id)` — a read-only simulation,
   no signature needed — which returns the minimal transfer plan
2. Each payer in that plan calls `pay()`, which requires their Freighter
   signature and transfers native XLM via the Stellar Asset Contract
   interface
3. Once every leg of the plan is confirmed, `mark_group_settled()` archives
   the expense log and resets the active balance to zero

See [`contracts/splitpay/src/lib.rs`](contracts/splitpay/src/lib.rs) for the
full contract and [`contracts/splitpay/src/test.rs`](contracts/splitpay/src/test.rs)
for unit tests covering the settlement math.

## Tech stack

- **Contract**: Rust + Soroban SDK, Stellar testnet
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Wallet**: Freighter via `@creit.tech/stellar-wallets-kit`
- **Chain client**: `@stellar/stellar-sdk`
- **Analytics**: PostHog
- **Error monitoring**: Sentry

---

## Getting started

Full step-by-step instructions (Rust install → contract deploy → frontend
config → running locally → production deploy) are in **[DEPLOY.md](DEPLOY.md)**.

Quick version, once prerequisites are installed:
```bash
# 1. Build, test, and deploy the contract
cd contracts/splitpay && cargo test && cd ../..
./scripts/deploy.sh
# copy the printed contract ID + native token ID

# 2. Configure and run the frontend
cd frontend
cp .env.example .env.local   # paste in the IDs from above
npm install
npm run dev
```

## Project structure

```
splitpay/
├── contracts/splitpay/      # Soroban smart contract (Rust)
│   ├── src/lib.rs           # Contract logic
│   └── src/test.rs          # Unit tests
├── frontend/                 # Next.js application
│   ├── src/app/              # Pages (home, group detail, invite join)
│   ├── src/components/       # UI components
│   ├── src/lib/               # Contract client, wallet, analytics, formatting
│   └── src/hooks/             # React state (wallet context)
├── scripts/deploy.sh         # One-command testnet deploy
├── DEPLOY.md                  # Full setup & deploy walkthrough
└── docs/                      # Submission materials, user feedback summary
```

## Live deployment

| | |
|---|---|
| Frontend (production) | _add your Vercel URL here_ |
| Contract ID (testnet) | _add after running `scripts/deploy.sh`_ |
| Demo video | _add link here_ |

## User testing & feedback

10+ real users connected Freighter, joined a group, logged an expense, and
completed an on-chain settlement on testnet. See
[`docs/user-feedback-summary.md`](docs/user-feedback-summary.md) for the
collected responses.

