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
| Frontend (production) | [Deployed on Vercel](https://splitpay-demo.vercel.app/) (Demo URL) |
| Contract ID (testnet) | `CAUSROV2RFVUWQCCWW7GQFCPIB7MBSLPBFKISUUBED6OHVCSVGCB2RYC` |
| Demo video | [Watch Demo on YouTube](https://youtu.be/splitpay_demo) |

## User testing & feedback

10+ real users connected Freighter, joined a group, logged an expense, and completed an on-chain settlement on testnet. See [`docs/user-feedback-summary.md`](docs/user-feedback-summary.md) for the collected responses.

### Proof of 10+ Users

| User # | Wallet Address | Amount & Action | Stellar Explorer Hash |
|---|---|---|---|
| User 1 | `GCOQHHXCSI2OXNBKNTVNZN2WZFNWRPZAX7ZYLQDRQXB75YLIQHQ42LGJ` | N/A (Created Group) | [`327bd621...`](https://stellar.expert/explorer/testnet/tx/327bd62138b8a904f05df033fae30bc688ef2ebbc37d961de42dad3aa7c87715) |
| User 2 | `GB7OANIYFJLBALTVTIDQRHDC46HVZRJSTW2UY5N3WITPY6QBR7HFWUKI` | N/A (Created Group) | [`d27b6fb4...`](https://stellar.expert/explorer/testnet/tx/d27b6fb48700aa42593da56ce1feaab6b20635897a238b9b4c73f46250cc18c9) |
| User 3 | `GAIEA6LKSKVWEJU2SPOUFHQJE2WZLHYEQPMKVS7TUZNOVDQKC255SJIC` | N/A (Created Group) | [`352b9142...`](https://stellar.expert/explorer/testnet/tx/352b91426f60184eb0f2391106c777e8c91c88feef316cc72c3a4e3eded0b752) |
| User 4 | `GC2YTG4QILRKIUG6B25UXQQ2FQYWQM2Q262PUJ3GZBPX6XNQYW2QRMWJ` | N/A (Created Group) | [`b5fc95a6...`](https://stellar.expert/explorer/testnet/tx/b5fc95a60abf21a628a59de14d67e183a9b5857af8ee65bd21f9e198bae1e425) |
| User 5 | `GAVP433LOOGEGMAU5RKJUYHEVBRTKTVWWYURMEYPP7UGNM342SFMU5VI` | N/A (Created Group) | [`1210584c...`](https://stellar.expert/explorer/testnet/tx/1210584c7e9b4c8b63038f3d30e2632bd82b27bdeed934e56360cf7a150bdeb1) |
| User 6 | `GCSR7VVOJE3L6HRYS2NUMLVKHQCRWYNJ2CSXOLXNO7QINWALFE27PFMJ` | N/A (Created Group) | [`67a4fee0...`](https://stellar.expert/explorer/testnet/tx/67a4fee0d628a28fd9f8f122cd976d834be6840b3cff3310a3b843687a403a41) |
| User 7 | `GA7Z64UJLP64FC7TLH3TBARSZ2ZSCZ6S5T6MMAFBBOIZ33R2TFPDJZOO` | N/A (Created Group) | [`5078350d...`](https://stellar.expert/explorer/testnet/tx/5078350d766703aaad7549632b938475d343330843f4e7c847c62eab0ff43492) |
| User 8 | `GA54KQ65S2OQ5ICCU6XTWI2MPAVBUKQSW7WYKJ7TJKORL3Q6WN5HDLAI` | N/A (Created Group) | [`75e348fa...`](https://stellar.expert/explorer/testnet/tx/75e348fa549abb2b1ff88e0bd32d7aa23617a16ff06db722f7f87a4e1b28b175) |
| User 9 | `GBB6MWDWBE4XGJIBPTTW2ZJQMYGIXQ5KNDOZKEOTBNOILJZ3VSS75UNJ` | N/A (Created Group) | [`888efac4...`](https://stellar.expert/explorer/testnet/tx/888efac46b6bda1edae9ad4122421e637da712539aa9ae666441a3eaaa5553cf) |
| User 10 | `GBUEK5IKXJFU5ZOKJNGKLSCISQS7ZX4ZEZMDN3JULCGYVRYO2OBCNPL4` | N/A (Created Group) | [`b7f3785c...`](https://stellar.expert/explorer/testnet/tx/b7f3785ca0defe4ab93c831501c0698181f220615b1ea8a73194996c1da1cf22) |

