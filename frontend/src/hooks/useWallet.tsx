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
import { FRIENDBOT_URL } from "@/lib/config";

type WalletState = {
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  fundWithFriendbot: () => Promise<void>;
  funding: boolean;
};

const WalletContext = createContext<WalletState | null>(null);

const STORAGE_KEY = "splitpay:lastAddress";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore last session's address for convenience (read-only UI hint;
  // every state-changing action still requires a fresh wallet signature).
  useEffect(() => {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved) setAddress(saved);
  }, []);

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
    } catch {
      setError("Couldn't reach Friendbot. You may already have testnet XLM, or try again shortly.");
    } finally {
      setFunding(false);
    }
  }, [address]);

  const value = useMemo(
    () => ({ address, connecting, error, connect, disconnect, fundWithFriendbot, funding }),
    [address, connecting, error, connect, disconnect, fundWithFriendbot, funding]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
