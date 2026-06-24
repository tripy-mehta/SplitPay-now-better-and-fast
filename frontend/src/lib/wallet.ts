"use client";

import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { NETWORK_PASSPHRASE } from "./config";

let kitInstance: StellarWalletsKit | null = null;

export function getWalletKit(): StellarWalletsKit {
  if (!kitInstance) {
    kitInstance = new StellarWalletsKit({
      network: NETWORK_PASSPHRASE.includes("Test")
        ? WalletNetwork.TESTNET
        : WalletNetwork.PUBLIC,
      selectedWalletId: FREIGHTER_ID,
      modules: [new FreighterModule()],
    });
  }
  return kitInstance;
}

export class WalletNotInstalledError extends Error {
  constructor() {
    super("Freighter is not installed in this browser.");
    this.name = "WalletNotInstalledError";
  }
}

export class WalletRejectedError extends Error {
  constructor() {
    super("The signature request was rejected in the wallet.");
    this.name = "WalletRejectedError";
  }
}

/** Opens the wallet selection modal and returns the connected public key. */
export async function connectWallet(): Promise<string> {
  const kit = getWalletKit();

  return new Promise((resolve, reject) => {
    kit
      .openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            resolve(address);
          } catch (err) {
            reject(normalizeWalletError(err));
          }
        },
        onClosed: (err?: Error) => {
          if (err) reject(normalizeWalletError(err));
        },
      })
      .catch((err) => reject(normalizeWalletError(err)));
  });
}

export async function signTransactionXdr(xdr: string, address: string): Promise<string> {
  const kit = getWalletKit();
  try {
    const { signedTxXdr } = await kit.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
      address,
    });
    return signedTxXdr;
  } catch (err) {
    throw normalizeWalletError(err);
  }
}

function normalizeWalletError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  if (/not installed|not detected|no wallet/i.test(message)) {
    return new WalletNotInstalledError();
  }
  if (/rejected|declined|user cancel/i.test(message)) {
    return new WalletRejectedError();
  }
  return err instanceof Error ? err : new Error(message);
}
