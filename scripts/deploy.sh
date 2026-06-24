#!/usr/bin/env bash
# Builds, deploys, and initializes the SplitPay contract on Stellar testnet.
#
# Prerequisites (see DEPLOY.md for install steps):
#   - rustup with the wasm32-unknown-unknown target
#   - stellar-cli (the `stellar` command)
#   - A funded testnet identity (this script creates one named "splitpay-deployer"
#     and funds it via Friendbot if it doesn't already exist)
#
# Usage:
#   ./scripts/deploy.sh

set -euo pipefail

CONTRACT_DIR="contracts/splitpay"
IDENTITY="splitpay-deployer"
NETWORK="testnet"

echo "==> Adding wasm32 target (no-op if already installed)"
rustup target add wasm32-unknown-unknown

echo "==> Building contract"
(cd "$CONTRACT_DIR" && cargo build --target wasm32-unknown-unknown --release)

WASM_PATH="target/wasm32-unknown-unknown/release/splitpay.wasm"

if [ ! -f "$WASM_PATH" ]; then
  echo "Build artifact not found at $WASM_PATH" >&2
  exit 1
fi

echo "==> Ensuring deployer identity exists"
if ! stellar keys address "$IDENTITY" >/dev/null 2>&1; then
  stellar keys generate "$IDENTITY" --network "$NETWORK" --fund
else
  echo "Identity '$IDENTITY' already exists, reusing it."
fi

DEPLOYER_ADDRESS=$(stellar keys address "$IDENTITY")
echo "Deployer address: $DEPLOYER_ADDRESS"

echo "==> Deploying contract to $NETWORK"
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source "$IDENTITY" \
  --network "$NETWORK")

echo "Contract deployed: $CONTRACT_ID"

echo "==> Looking up native (XLM) Stellar Asset Contract address on $NETWORK"
NATIVE_TOKEN_ID=$(stellar contract id asset \
  --asset native \
  --network "$NETWORK")

echo "Native token contract: $NATIVE_TOKEN_ID"

echo "==> Initializing contract with native token address"
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$IDENTITY" \
  --network "$NETWORK" \
  -- \
  initialize \
  --native_token "$NATIVE_TOKEN_ID"

echo ""
echo "================================================================"
echo "Deployment complete. Add these to frontend/.env.local:"
echo ""
echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
echo "NEXT_PUBLIC_NATIVE_TOKEN_ID=$NATIVE_TOKEN_ID"
echo "================================================================"
