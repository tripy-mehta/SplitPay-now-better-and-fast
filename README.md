# SplitPay

A premium, production-ready decentralized cross-border group expense settlement dashboard powered by the Stellar Network and Soroban Smart Contracts. SplitPay features real-time logging, a debt-simplification algorithm, and native XLM settlements.

---

## 1. Project Information

### Project Name
**SplitPay** (Cross-border Group Expense Settlement)

### Project Overview
SplitPay lets a group log shared expenses and settle every balance with the minimum number of transfers — instantly, in native XLM, regardless of which country anyone in the group is in. 

### Problem Statement
Traditional cross-border group settlement systems are:
- **Fragmented**: Splitwise-style apps solve the bookkeeping (who paid, who owes what) but settlement happens off-platform.
- **Slow & Expensive**: International bank transfers and remittances take days and cost too much for small casual P2P transactions.
- **Friction-heavy**: International student groups, remote teams, and travelers have no unified way to close out shared debt.

### Solution Overview
SplitPay solves these problems using:
- **Instant Finality & Low Fees**: Leveraging the Stellar network to settle payments in seconds for fractions of a cent.
- **On-chain Debt Simplification**: A Soroban smart contract computes the absolute minimum transfers needed to zero out the group.
- **Native XLM Settlement**: Settle across borders instantly using Freighter.
- **Frictionless Onboarding**: Generate 1-Click invite links to bring members into your smart contract group.

### Key Features
- **Wallet Connection**: Dynamic authentication via Stellar Wallets Kit and Freighter.
- **Group Ledgers**: Transparent expense logging directly on the Stellar testnet.
- **Debt Optimization**: Algorithmically minimizes the number of required transfers to settle group debt.
- **Analytics & Telemetry**: Built-in monitoring using PostHog and Sentry.
- **Export to CSV**: Download group transaction history for accounting and bookkeeping.

<div align="center">
  <img src="https://raw.githubusercontent.com/tripy-mehta/SplitPay-now-better-and-fast/main/images/landing%20page.png" alt="Landing Page" width="400"/>
  <img src="https://raw.githubusercontent.com/tripy-mehta/SplitPay-now-better-and-fast/main/images/creating%20group.png" alt="Sign Up / Create Group" width="400"/>
  <br/>
  <img src="https://raw.githubusercontent.com/tripy-mehta/SplitPay-now-better-and-fast/main/images/responsive_ui.png" alt="Responsive UI" width="400"/>
  <img src="https://raw.githubusercontent.com/tripy-mehta/SplitPay-now-better-and-fast/main/images/analytics.png" alt="Analytics" width="400"/>
</div>

---

## 2. Technology Stack

| Component | Technologies & Tools |
| :--- | :--- |
| **Frontend** | Next.js 14, TailwindCSS, React |
| **Smart Contracts** | Soroban Rust SDK, WebAssembly (Wasm) target |
| **Web3 Libraries** | `@stellar/stellar-sdk` (v15.0.0), `@creit.tech/stellar-wallets-kit` |
| **Telemetry & Quality** | PostHog (Analytics), Sentry (Monitoring) |

---

## 3. Architecture

### System Architecture Diagram
```
┌─────────────────────┐         ┌──────────────────────────┐
│   Next.js Frontend   │         │   Soroban Contract        │
│                      │  RPC    │   (Rust, contracts/splitpay)│
│  Freighter (wallet)  │◄───────►│                            │
│  Tailwind UI         │         │  • Groups & membership     │
│  PostHog analytics   │         │  • Expense log             │
│  Sentry monitoring   │         │  • Balance calculation      │
│  CSV Export Feature  │         │  • Settlement              │
└─────────────────────┘         └──────────────────────────┘
```

### Folder Project Structure
```
SplitPay/
├── contracts/                   # Soroban Rust Smart Contracts
│   └── splitpay/
│       ├── src/                 # Smart contract logic
│       └── Cargo.toml
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React UI components
│   │   ├── lib/                 # Contract integration & formatting
│   │   └── hooks/               # Wallet connection hooks
│   └── package.json
├── docs/                        # Presentation & Verification documents
└── README.md
```

---

## 4. Setup and Installation

### Prerequisites
- Node.js 20+
- Rust with `wasm32-unknown-unknown` target
- Stellar CLI (`stellar`)

### Environment Variables
For local frontend development, copy `.env.example` to `.env.local` and add:
```
NEXT_PUBLIC_CONTRACT_ID=CAUSROV2RFVUWQCCWW7GQFCPIB7MBSLPBFKISUUBED6OHVCSVGCB2RYC
NEXT_PUBLIC_NATIVE_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Run Locally Instructions
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser. Install the **Freighter Wallet** extension and switch it to **Testnet**.

---

## 5. Deployment Details

- **Contract ID (Testnet)**: `CAUSROV2RFVUWQCCWW7GQFCPIB7MBSLPBFKISUUBED6OHVCSVGCB2RYC`
- **Stellar Network**: Testnet
- **Live App Deployment**: [SplitPay Live App](https://split-pay-now-with-ease.vercel.app/)
- **Demo Video**: [Watch Demo on Google Drive](https://drive.google.com/file/d/14GFumRM7NkBvjzj_LiD4gdWCOIdnYa3u/view?usp=sharing)
- **Pitch Deck**: [Download SplitPay.pptx](SplitPay.pptx)

---

## 6. Level 5 Submission Checklist

- ✅ **Public GitHub repository:** You're looking at it!
- ✅ **Minimum 20+ meaningful commits:** History is available in the repository.
- ✅ **Live deployed application:** See the "Deployment Details" above.
- ✅ **PPT/Pitch deck link:** Linked above.
- ✅ **Demo video link:** Linked above.
- ✅ **Proof of 50+ users:** [View User Feedback Responses (Google Sheet)](https://docs.google.com/spreadsheets/d/1atDQKWoioGIpgH9nq1LM1jPObQxs1L8aISxIC7t-91o/edit?usp=sharing)
- ✅ **Screenshots of analytics or transaction activity:** Embedded in Section 1.
- ✅ **Updated README and documentation:** This file is actively structured for Level 5 requirements.
- ✅ **User feedback iteration summary:** Detailed in Section 7, with commit hashes.

---

## 7. User Growth & Feedback Iteration

Users provided feedback through our Google Form. We successfully onboarded **55+ users** on the Stellar Testnet. Their feedback directly influenced our most recent feature additions.

**[Google Form (Feedback Survey)](https://docs.google.com/forms/d/e/1FAIpQLSdPXwp3m6S5sdG6vk3DQxljOp3ets36KnwmQ03jqYDA3LfNWQ/viewform?usp=publish-editor)**

### Proof of 50+ Users
To satisfy the Level 5 requirement, a complete log of **55 real users** with their names, wallet addresses, ratings, and detailed feedback is publicly available in our exported Google Form response sheet:

📊 **[View User Feedback Responses (Google Sheet)](https://docs.google.com/spreadsheets/d/1atDQKWoioGIpgH9nq1LM1jPObQxs1L8aISxIC7t-91o/edit?usp=sharing)**

### Feedback Implementation & Improvement Summary

We actively listened to our users and improved the product based on their feedback. Below are the improvements shipped during our iterations:

| User Feedback | Improvement Made | Git Commit |
|---|---|---|
| "My friends and I wanted a way to look back at our past transactions to verify who paid for what. It would be great to see a full history ledger directly in the app." | Added Expense History UI | [`274f5dc`](https://github.com/tripy-mehta/SplitPay-now-better-and-fast/commit/274f5dc) |
| "Sometimes when I enter an invalid group ID, the app just hangs instead of telling me what went wrong. The app lacks error handling on bad inputs and edge cases." | Added Global Error Boundaries and UI alerts | [`2ec9e4c`](https://github.com/tripy-mehta/SplitPay-now-better-and-fast/commit/2ec9e4c) |
| "I found it really hard to invite my non-crypto friends because they don't understand how to copy the exact Group ID. A simple shareable link would solve this." | Added 1-Click Copy Invite Links | [`eefec8e`](https://github.com/tripy-mehta/SplitPay-now-better-and-fast/commit/eefec8e) |
| "We use this for our startup's shared subscriptions, but I really need a way to export our group expenses to CSV for our monthly accounting records." | **[NEW]** Added CSV Export for Group Ledgers | [`6f70a90`](https://github.com/tripy-mehta/SplitPay-now-better-and-fast/commit/6f70a90) |

---

## 8. Monitoring and Analytics
- **PostHog**: Integrated for user event telemetry and feature tracking.
- **Sentry**: Active monitoring for UI crashes and unhandled Web3 exceptions.
