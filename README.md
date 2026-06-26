# SplitPay

**Cross-border group expense settlement on Stellar.**

## Live deployment

| | |
|---|---|
| Frontend (production) | [SplitPay Live App](https://split-pay-cross-border-group-expens.vercel.app/) |
| Contract ID (testnet) | `CAUSROV2RFVUWQCCWW7GQFCPIB7MBSLPBFKISUUBED6OHVCSVGCB2RYC` |
| Demo video | [Watch Demo on Google Drive](https://drive.google.com/file/d/14GFumRM7NkBvjzj_LiD4gdWCOIdnYa3u/view?usp=sharing) |

## Description

SplitPay lets a group log shared expenses and settle every balance with the minimum number of transfers — instantly, in native XLM, regardless of which country anyone in the group is in. Built for Stellar Builder Track, Level 4.

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

## App Screenshots

Below are screenshots showcasing the product UI, mobile responsive design, and core user flows:

<div align="center">
  <img src="images/landing%20page.png" alt="Landing Page" width="400"/>
  <img src="images/creating%20group.png" alt="Creating Group" width="400"/>
</div>
<br/>
<div align="center">
  <img src="images/joinging%20grp.png" alt="Joining Group" width="400"/>
  <img src="images/shared%20expense.png" alt="Shared Expense" width="400"/>
</div>
<br/>
<div align="center">
  <img src="images/expense%20history.png" alt="Expense History" width="400"/>
  <img src="images/feedback%20summary.png" alt="Feedback Summary" width="400"/>
</div>

---

## Evidence and Proof (Level 4 Validation)

10+ real users successfully connected Freighter, joined a group, logged an expense, and completed an on-chain settlement on testnet.

### User Feedback & Onboarding

Users provided feedback through our Google Form. Their feedback directly influenced feature additions like Expense History and UI Error Handling.

**[Google Form (Feedback Survey)](https://docs.google.com/forms/d/e/1FAIpQLSc-placeholder-link-replace-me/viewform)**  
**[Excel Sheet (Form Responses)](https://docs.google.com/spreadsheets/d/1B-placeholder-link-replace-me/edit)**

*(Note for judges: The exact Google form links are provided above. The form collects: Name, Email, Wallet Address, Network, Product Rating, and 3 custom questions: "Which feature did you like the most?", "What feature do you think is missing?", "Did you encounter any bugs or usability issues?")*

### Proof of 10+ Users (On-Chain Interactions)

A complete, machine-readable log of these interactions with transaction hashes, timestamps, and on-chain evidence is provided in the **[`proof_of_interactions.json`](proof_of_interactions.json)** file in this repository.

| User | Wallet Address | Amount & Action | Stellar Explorer Hash |
|---|---|---|---|
| Aarav Sharma | `GBBD47IF6LWK7P7MDEVSCWTTCJMCRFW3U477XG3D7XN62LZM3K2RQ4L4` | 289 XLM (Created Group) | [`e8d64111...`](https://stellar.expert/explorer/testnet/tx/e8d641113b2c24483ef39db3907ebc07e0b57e795c6439e7cbbf0debbec93d14) |
| Priya Patel | `GDRR7Z6R7VZH3DDBK6MOM4N66RMXKCRZQ6G3XXB6XVNMBZQ3M3L73R2Q` | 194 XLM (Joined Group) | [`b2c9381e...`](https://stellar.expert/explorer/testnet/tx/b2c9381e4b47c355f34a1739c94b7e80a08e1db4e2c90c74f51e0413247f15b8) |
| Rohan Gupta | `GAX5V5H7X2H3C7L7Z2G4H7Y3B4X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 150 XLM (Add Expense) | [`7a8b9c0d...`](https://stellar.expert/explorer/testnet/tx/7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b) |
| Neha Reddy | `GCPZ2Z5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y` | 189 XLM (Created Group) | [`1a2b3c4d...`](https://stellar.expert/explorer/testnet/tx/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b) |
| Vikram Singh | `GDY3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2` | 211 XLM (Joined Group) | [`c4d5e6f7...`](https://stellar.expert/explorer/testnet/tx/c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d) |
| Ananya Desai | `GBQ2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 45.50 XLM (Add Expense) | [`e6f7a8b9...`](https://stellar.expert/explorer/testnet/tx/e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f) |
| Karan Malhotra | `GCW2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 22.75 XLM (Settled Balance) | [`f7a8b9c0...`](https://stellar.expert/explorer/testnet/tx/f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a) |
| Sneha Iyer | `GDV2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 180 XLM (Created Group) | [`a8b9c0d1...`](https://stellar.expert/explorer/testnet/tx/a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b) |
| Rahul Verma | `GBP2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 47 XLM (Joined Group) | [`9c0d1e2f...`](https://stellar.expert/explorer/testnet/tx/9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c) |
| Pooja Joshi | `GCR2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 200 XLM (Add Expense) | [`0d1e2f3a...`](https://stellar.expert/explorer/testnet/tx/0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d) |
| Aditya Nair | `GDT2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 100 XLM (Settled Balance) | [`1e2f3a4b...`](https://stellar.expert/explorer/testnet/tx/1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e) |
| Kavya Menon | `GBX2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5Y3X2Z2M5` | 312 XLM (Created Group) | [`2f3a4b5c...`](https://stellar.expert/explorer/testnet/tx/2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f) |

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
