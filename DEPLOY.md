# Deploying SplitPay

This guide takes you from a clean machine to a deployed contract and a
running frontend pointed at it. Do this in order.

## 1. Install prerequisites

### Rust + the wasm target
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32-unknown-unknown
```

### Stellar CLI
```bash
cargo install --locked stellar-cli --features opt
```
Verify it installed:
```bash
stellar --version
```

### Node.js 20+
Use [nvm](https://github.com/nvm-sh/nvm) or your platform's installer. Verify:
```bash
node --version   # should print v20.x or later
```

## 2. Build and test the contract locally

```bash
cd contracts/splitpay
cargo test
```
All tests in `src/test.rs` should pass — this covers group creation, joining,
equal-split balance math, the debt-simplification settlement algorithm, and
settlement clearing. If any test fails, stop and fix it before deploying;
don't deploy code you haven't verified.

## 3. Deploy to testnet

From the repo root:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This script will:
1. Build the contract to a `.wasm` file
2. Create (and Friendbot-fund) a deployer identity called `splitpay-deployer`
3. Deploy the contract to Stellar testnet
4. Look up the native XLM Stellar Asset Contract address for testnet
5. Call `initialize()` on your deployed contract with that address
6. Print the two values you need next

Copy the `NEXT_PUBLIC_CONTRACT_ID` and `NEXT_PUBLIC_NATIVE_TOKEN_ID` values it
prints — you'll need them in the next step.

If you'd rather run the steps manually (useful for understanding what's
happening, or if the script fails partway), see `scripts/deploy.sh` — every
command in it is a plain `stellar` CLI call you can copy-paste individually.

## 4. Configure and run the frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` and fill in:
```
NEXT_PUBLIC_CONTRACT_ID=<paste from deploy output>
NEXT_PUBLIC_NATIVE_TOKEN_ID=<paste from deploy output>
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

Optional but recommended for the Level 4 analytics/monitoring requirement:
```
NEXT_PUBLIC_POSTHOG_KEY=<from posthog.com, free tier>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_SENTRY_DSN=<from sentry.io, free tier>
```

Then install and run:
```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Install the
[Freighter browser extension](https://www.freighter.app/) if you haven't,
switch it to **Testnet** in its settings, and connect.

## 5. Get testnet XLM

Once connected, the app shows a "Need testnet XLM?" link in the header that
calls Friendbot for you. Or manually:
```bash
curl "https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>"
```

## 6. Deploy the frontend to production

This repo is set up for [Vercel](https://vercel.com):
```bash
npm install -g vercel
cd frontend
vercel --prod
```
Add the same environment variables from `.env.local` in the Vercel project
settings before the production build runs.

## Troubleshooting

- **"Account not found" when deploying**: your deployer identity isn't
  funded yet. Re-run `stellar keys generate splitpay-deployer --network
  testnet --fund` or fund it manually via Friendbot.
- **Freighter popup never appears**: confirm the extension is installed,
  unlocked, and set to Testnet — Mainnet-configured Freighter will silently
  fail simulated calls against a testnet contract.
- **Simulation errors mentioning storage**: testnet occasionally resets
  state. Re-deploy and re-initialize if your contract ID stops responding.
