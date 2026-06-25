"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { connectWallet, WalletNotInstalledError, WalletRejectedError } from "@/lib/wallet";
import { track, identifyWallet } from "@/lib/analytics";
import { FRIENDBOT_URL, HORIZON_URL } from "@/lib/config";

type WalletState = {
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  fundWithFriendbot: () => Promise<void>;
  funding: boolean;
  balance: string | null;
  refreshBalance: () => Promise<void>;
};

const WalletContext = createContext<WalletState | null>(null);

const STORAGE_KEY = "splitpay:lastAddress";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }
    try {
      const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (res.ok) {
        const data = await res.json();
        const native = data.balances.find((b: any) => b.asset_type === "native");
        if (native) {
          setBalance(parseFloat(native.balance).toFixed(2));
        } else {
          setBalance("0.00");
        }
      } else if (res.status === 404) {
        setBalance("0.00 (Unfunded)");
      } else {
        setBalance("—");
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance("—");
    }
  }, [address]);

  // Restore last session's address for convenience (read-only UI hint;
  // every state-changing action still requires a fresh wallet signature).
  useEffect(() => {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved) setAddress(saved);
  }, []);

  // Fetch balance automatically when address changes
  useEffect(() => {
    refreshBalance();
  }, [address, refreshBalance]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const pubKey = await connectWallet();
      setAddress(pubKey);
      window.sessionStorage.setItem(STORAGE_KEY, pubKey);
      identifyWallet(pubKey);
      track("wallet_connected");
    } catch (err) {
      let message = "Couldn't connect to the wallet. Please try again.";
      if (err instanceof WalletNotInstalledError) {
        message = "Freighter isn't installed. Install it from the Chrome Web Store, then refresh this page.";
      } else if (err instanceof WalletRejectedError) {
        message = "Connection was cancelled in the wallet.";
      }
      setError(message);
      track("wallet_connect_failed", { reason: err instanceof Error ? err.name : "unknown" });
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const fundWithFriendbot = useCallback(async () => {
    if (!address) return;
    setFunding(true);
    setError(null);
    try {
      const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`);
      if (!res.ok && res.status !== 400) {
        // 400 usually means "already funded" — not a real failure for our purposes.
        throw new Error("Friendbot request failed.");
      }
      // Wait a moment for testnet ledger to apply before refreshing balance
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await refreshBalance();
    } catch {
      setError("Couldn't reach Friendbot. You may already have testnet XLM, or try again shortly.");
    } finally {
      setFunding(false);
    }
  }, [address, refreshBalance]);

  const value = useMemo(
    () => ({
      address,
      connecting,
      error,
      connect,
      disconnect,
      fundWithFriendbot,
      funding,
      balance,
      refreshBalance,
    }),
    [address, connecting, error, connect, disconnect, fundWithFriendbot, funding, balance, refreshBalance]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
