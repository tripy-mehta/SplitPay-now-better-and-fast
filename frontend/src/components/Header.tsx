"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/format";

export function Header() {
  const { address, connecting, error, connect, disconnect, fundWithFriendbot, funding } =
    useWallet();
  const [showFriendbotHint, setShowFriendbotHint] = useState(false);

  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight">SplitPay</span>
          <span className="hidden sm:inline text-xs uppercase tracking-widest text-ink/40">
            Testnet
          </span>
        </a>

        {address ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFriendbotHint((s) => !s)}
              className="hidden sm:inline text-xs text-ink/50 underline underline-offset-2 hover:text-brass focus-ring rounded-sm"
            >
              Need testnet XLM?
            </button>
            <span className="ledger-amount text-sm bg-ink/5 rounded-md px-3 py-1.5">
              {truncateAddress(address)}
            </span>
            <button
              onClick={disconnect}
              className="text-sm text-ink/50 hover:text-owe-600 focus-ring rounded-sm px-1"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={connecting}
            className="font-medium text-sm bg-ink text-paper rounded-md px-4 py-2 hover:bg-ink/85 disabled:opacity-50 focus-ring transition-colors"
          >
            {connecting ? "Connecting…" : "Connect Freighter"}
          </button>
        )}
      </div>

      {showFriendbotHint && address && (
        <div className="mx-auto max-w-3xl px-5 pb-4 animate-rise-in">
          <div className="bg-ledger-50 border border-ledger-100 rounded-md p-3 text-sm flex items-center justify-between gap-3">
            <span>Fund this address with 10,000 testnet XLM via Friendbot.</span>
            <button
              onClick={fundWithFriendbot}
              disabled={funding}
              className="shrink-0 bg-ledger-600 text-white text-xs font-medium rounded-sm px-3 py-1.5 hover:bg-ledger-900 disabled:opacity-50 focus-ring"
            >
              {funding ? "Funding…" : "Fund via Friendbot"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-3xl px-5 pb-4">
          <div className="bg-owe-100 border border-owe-400/30 text-owe-600 rounded-md p-3 text-sm">
            {error}
          </div>
        </div>
      )}
    </header>
  );
}
