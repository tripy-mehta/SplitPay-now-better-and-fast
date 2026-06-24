/**
 * Contract & network configuration.
 *
 * Fill in NEXT_PUBLIC_CONTRACT_ID and NEXT_PUBLIC_NATIVE_TOKEN_ID in
 * .env.local after deploying the contract (see DEPLOY.md).
 */

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? "";

// Well-known native asset (XLM) Stellar Asset Contract address on testnet.
// This is deterministic per network and does not need to be deployed.
export const NATIVE_TOKEN_ID = process.env.NEXT_PUBLIC_NATIVE_TOKEN_ID ?? "";

export const FRIENDBOT_URL = "https://friendbot.stellar.org";

export function isConfigured(): boolean {
  return Boolean(CONTRACT_ID && NATIVE_TOKEN_ID);
}
