# SplitPay Pitch Deck

This script and slide outline is designed for your Level 5 submission. You can copy-paste this into Canva or PowerPoint to generate your slides, and use the speaker notes to record your Demo Walkthrough.

---

## Slide 1: Title Slide
**Visuals**: SplitPay logo, big bold text, aesthetic background.
**Header**: SplitPay
**Sub-header**: Cross-Border Group Expense Settlement on Stellar
**Speaker Notes**: "Hi everyone, I'm excited to present SplitPay — a decentralized app built on Stellar that solves the headache of international group expenses."

---

## Slide 2: The Problem
**Visuals**: Bullet points with icons (e.g., globe, cross mark, wallet).
**Text**:
- **Fragmented Bookkeeping**: Splitwise solves math, but you still have to settle manually.
- **Cross-Border Friction**: Bank transfers and Venmo don't work internationally. Friends traveling together have no P2P way to close out shared debt.
- **High Fees & Delays**: Traditional remittance takes days and costs too much for small casual transactions.
**Speaker Notes**: "We all use apps like Splitwise to track who owes what. But when it's time to actually pay your friends back—especially if they live in different countries—the system breaks. You face high wire fees, different currencies, and delayed settlements."

---

## Slide 3: The Solution
**Visuals**: SplitPay dashboard screenshot, Stellar logo.
**Text**:
- **On-Chain Logging**: Shared expenses are logged transparently.
- **Debt-Simplification Algorithm**: Soroban smart contract computes the absolute minimum transfers needed to zero out the group.
- **Native XLM Settlement**: Settle across borders instantly using Freighter.
**Speaker Notes**: "Enter SplitPay. We put the entire group ledger on the Stellar testnet. Not only do we track the expenses, but our Soroban smart contract runs a debt-simplification algorithm to reduce a tangled web of 'who owes who' into just one or two clean transactions. And because it runs on Stellar, payments settle globally in seconds."

---

## Slide 4: Market Opportunity
**Visuals**: Growth charts, target audience icons.
**Text**:
- **Target Audience**: International students, digital nomads, remote teams, travelers.
- **Market Gap**: A $800B+ remittance market focused on business, but lacking casual P2P group settlement features.
**Speaker Notes**: "Our initial target market consists of international students and remote teams. This is a massive market gap where traditional remittance focuses on large transfers, completely ignoring the casual, day-to-day group expenses."

---

## Slide 5: Architecture
**Visuals**: Diagram showing User -> Next.js Frontend -> Freighter Wallet -> Soroban Smart Contract -> Stellar Network.
**Text**:
- **Frontend**: Next.js 14, Tailwind CSS, Vercel
- **Smart Contract**: Rust, Soroban SDK
- **Integration**: `@stellar/stellar-sdk`, Freighter Wallet
**Speaker Notes**: "Our stack is modern and robust. We use a Next.js frontend deployed on Vercel, which interacts with the Freighter wallet. The heavy lifting—calculating the optimized settlement paths—happens in our Rust-based Soroban smart contract deployed on the Stellar testnet."

---

## Slide 6: Growth & User Feedback Iteration
**Visuals**: Screenshots of the CSV Export and Invite Link features. Quote bubble from a user.
**Text**:
- **50+ Users Onboarded**: Trackable on the Stellar explorer.
- **Feedback-Driven Iteration**:
  - *Feedback*: "Hard to invite non-crypto friends." -> *Solution*: **1-Click Invite Links**
  - *Feedback*: "Need records for accounting." -> *Solution*: **CSV Export Feature**
**Speaker Notes**: "For our Level 5 growth phase, we successfully onboarded over 50 users. We actively listened to their feedback. Users wanted an easier way to invite friends, so we built 1-Click invite links. They also wanted to keep records, so we shipped a CSV Export feature. Both are live today."

---

## Slide 7: Future Roadmap
**Visuals**: A timeline graphic (Q1, Q2, Q3).
**Text**:
- **Phase 1**: Fiat on/off ramps via Stellar anchors.
- **Phase 2**: Mobile app release (React Native).
- **Phase 3**: Support for USDC and other stablecoins on Stellar.
**Speaker Notes**: "Looking ahead, we plan to integrate Stellar anchors for seamless Fiat on/off ramps, launch a native mobile app, and add support for USDC so users can settle without worrying about crypto volatility. Thank you!"

---

# Demo Video Walkthrough Script

**0:00 - Introduction**
*Screen: The SplitPay landing page.*
"Hi, this is a demo of SplitPay. Let me show you how a group of international friends can split a dinner bill."

**0:15 - Wallet Connection & Group Creation**
*Screen: Click 'Connect Freighter', then click 'Create Group'.*
"First, I connect my Freighter wallet on the Stellar testnet. I'll create a new group called 'Bali Trip'."

**0:30 - New Feature: Onboarding**
*Screen: Click the 'Copy Invite Link' button.*
"Based on user feedback, we added this 'Copy Invite Link' feature. I can just drop this in WhatsApp, and my friends can join the smart contract instantly."

**0:45 - Adding an Expense**
*Screen: Add a 200 XLM expense.*
"I'll log a 200 XLM expense for dinner. The Soroban smart contract calculates that everyone in the group now owes me their fair share."

**1:05 - Settlement & New Feature: CSV Export**
*Screen: Show the Balance Ledger.*
"When it's time to settle, the contract simplifies the debt so we don't have to send 10 different transactions. And finally, using our new feature requested by our 50 beta users, I can click 'Export to CSV' to download the group's entire ledger history."

**1:30 - Outro**
"SplitPay makes cross-border group expenses fast, cheap, and entirely on-chain. Thanks for watching."
