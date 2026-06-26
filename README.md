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

## Images

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

## User testing & feedback

10+ real users connected Freighter, joined a group, logged an expense, and completed an on-chain settlement on testnet. See [`docs/user-feedback-summary.md`](docs/user-feedback-summary.md) for the collected responses.

### Proof of 10+ Users

| User # | Wallet Address | Amount & Action | Stellar Explorer Hash |
|---|---|---|---|
| User 1 | `GBPSN5J76XHRFM6AVHJUOJOXVOWK4HU2W5FU57UYIPUZ743CT4TQAHUA` | 289 XLM (Created Group) | [`7b8d3c9f...`](https://stellar.expert/explorer/testnet/tx/7b8d3c9f53e3716e15e07589dd4e94dd1ac0952f0b643878a2a9fbae16b63864) |
| User 2 | `GCH24NLVNA5KGGS2HDEDUDAEHSQ53S3ORRVS4S7DM2DW2FVRTFIOVWBF` | 194 XLM (Created Group) | [`b88b1ed3...`](https://stellar.expert/explorer/testnet/tx/b88b1ed3b65d12933a0fe06175b20eda2db4d2341dee251de3caff9fc13cdb6c) |
| User 3 | `GCK6CIORZYHZPHIEURTCGOWXMIZG7QPZ367ZHLGXMANM7GS7VZQBRZZP` | 301 XLM (Split Bill) | [`6af22a4f...`](https://stellar.expert/explorer/testnet/tx/6af22a4fab28f983eb2778677a9b46d7bc72e2a90d7d91d96ee0fc541907fbf2) |
| User 4 | `GDTHXNSTSQUXUDD7R7DMWF6IQMWLTIBNVSMOWNL7I67YIY7ATWMFKV3Q` | 189 XLM (Paid Expense) | [`7e546b0a...`](https://stellar.expert/explorer/testnet/tx/7e546b0a0761fcbe8cea4eb368a1c3708ad7be565340e63ad36a3aefcafd9437) |
| User 5 | `GBV2IC2KIYY7I4C3PVNFH2LWLF54IK6JSGTXNRBUZ7CK337OZL3EXURN` | 211 XLM (Settled Balance) | [`8d471385...`](https://stellar.expert/explorer/testnet/tx/8d47138591ecdcde95a1b07b06430f51cbbbbda2f297aef0f91ac33ab002ed08) |
| User 6 | `GCZX5UH63WE5E65CNWXSGFZGGYVRWTNIFR2XXKTFH7MJKYQJUUPFYXX3` | 58 XLM (Paid Expense) | [`96f67f71...`](https://stellar.expert/explorer/testnet/tx/96f67f7117038d70f088e197c02a38b2f997a99ff4165f6bebbb7cd24fb351ee) |
| User 7 | `GA4LXXDHEF4EPSHKNH62V6GN4CRYNFCUQJ37PHJD7BH2MSWOONWFBLKR` | 94 XLM (Split Bill) | [`fae0f443...`](https://stellar.expert/explorer/testnet/tx/fae0f4433831ef92c762e7c1c4b762f0fd4fde9b58f104f66e90f7a067fc68c4) |
| User 8 | `GC6F5FDMQXXY5VUSSVNSID36KQVZUNCORQQ4DLRV24ECLBI6FLPMAYPB` | 180 XLM (Settled Balance) | [`2400480f...`](https://stellar.expert/explorer/testnet/tx/2400480f79d792e64b52611ec99130b34204c22fa71aef236ab706f452a2ce10) |
| User 9 | `GBYU6MJQPMGSDPJI4PK6GUVFNOQ75ROXH63JHGEHTNK2RIKUFEBOYEIB` | 47 XLM (Created Group) | [`b52f2e20...`](https://stellar.expert/explorer/testnet/tx/b52f2e20814ff590d292cea311236b9f40cd502f8640c852c7e227a2b5962828) |
| User 10 | `GDU7W3YTWZN3PKEVYVFCHHJZLUMUZOQROBYL2FLB5VD4SME7TUYA7YDO` | 410 XLM (Split Bill) | [`622b625a...`](https://stellar.expert/explorer/testnet/tx/622b625a2d881c50d3cb6de49a0f7722dd340511c11ea328dc31ab309f93cc28) |
| User 11 | `GDJ6FNRPRI2HXF7V3UL2DKNUEVHZBSSONPUBDYDQSJ3CSXPVYWM27NPD` | 398 XLM (Paid Expense) | [`d19df13e...`](https://stellar.expert/explorer/testnet/tx/d19df13ec8255e005d7a297170eef1e783db8e16d8f1560c774e9622f917a662) |
| User 12 | `GB6ADNVDKNISF4POIDSISFFGHL5KYXL6D3CXJRIL6UQMAH3QBP63WQC5` | 312 XLM (Split Bill) | [`c756a4ac...`](https://stellar.expert/explorer/testnet/tx/c756a4ace76c19dde5b5bb773fccdf232ac30f1775377e0c0585120f6049395a) |
| User 13 | `GB7LVJPXASHC4XZYSMRER7NOB46BUBSVZB3GYNJF2PZO2TSP245OVK5H` | 275 XLM (Settled Balance) | [`c9b91737...`](https://stellar.expert/explorer/testnet/tx/c9b917377dee585fd4eff0aa14e018792aecdc81396cf567ee9ed3cd30903063) |
| User 14 | `GBUE4PIT65VUNZT4SYVR3TASZOZFA7RDBEB6ZA5GX26ZPIUNYNFVQ4CN` | 57 XLM (Paid Expense) | [`8dc95c11...`](https://stellar.expert/explorer/testnet/tx/8dc95c11c5900b1921866de4824e56b4bee72ef6874cfe21858bf52bf259d35f) |
| User 15 | `GDIMJQS644ML6JLFLHHWRXLNKMOGZFX5V22NTKTHV6APFSSV437XE42U` | 237 XLM (Created Group) | [`97da1b9c...`](https://stellar.expert/explorer/testnet/tx/97da1b9c14a511966e704c36082edb3deba8fd624b791e90d93b40c97a683cb6) |

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

## Live deployment

| | |
|---|---|
| Frontend (production) | [SplitPay Live App](https://split-pay-cross-border-group-expens.vercel.app/) |
| Contract ID (testnet) | `CAUSROV2RFVUWQCCWW7GQFCPIB7MBSLPBFKISUUBED6OHVCSVGCB2RYC` |
| Demo video | [Watch Demo on Google Drive](https://drive.google.com/file/d/14GFumRM7NkBvjzj_LiD4gdWCOIdnYa3u/view?usp=sharing) |

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



