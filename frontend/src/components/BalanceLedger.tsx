"use client";

import { useState } from "react";
import { formatXlm, truncateAddress } from "@/lib/format";
import { computeSettlement, pay, markGroupSettled, BalanceDto, TransferDto } from "@/lib/contract";
import { track } from "@/lib/analytics";
import * as Sentry from "@sentry/nextjs";

type Labeled<T> = T & { label?: string };

function labelFor(address: string, labels: Record<string, string>) {
  return labels[address] ?? truncateAddress(address);
}

export function BalanceLedger({
  groupId,
  balances,
  labels,
  currentAddress,
  onSettled,
}: {
  groupId: bigint;
  balances: BalanceDto[];
  labels: Record<string, string>;
  currentAddress: string;
  onSettled: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "planning" | "review" | "paying" | "done">(
    "idle"
  );
  const [plan, setPlan] = useState<TransferDto[]>([]);
  const [paidIdx, setPaidIdx] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const allSettled = balances.every((b) => b.net === 0n);

  async function handlePlanSettlement() {
    setError(null);
    setPhase("planning");
    try {
      const transfers = await computeSettlement(groupId, currentAddress);
      setPlan(transfers);
      track("settle_initiated", { groupId: groupId.toString(), transferCount: transfers.length });
      setPhase("review");
    } catch (err) {
      setError("Couldn't compute the settlement plan. Try again in a moment.");
      Sentry.captureException(err);
      setPhase("idle");
    }
  }

  async function handlePayTransfer(idx: number, t: TransferDto) {
    setError(null);
    setPhase("paying");
    try {
      await pay(groupId, t.from, t.to, t.amount);
      track("settle_transfer_signed", { groupId: groupId.toString() });

      // Compute the updated set synchronously so the "all done" check below
      // doesn't read stale state from before this transfer was recorded.
      const updatedPaid = new Set(paidIdx).add(idx);
      setPaidIdx(updatedPaid);

      const allDone = plan.every((_, i) => updatedPaid.has(i));
      if (allDone) {
        await markGroupSettled(groupId, currentAddress);
        track("settle_confirmed", { groupId: groupId.toString() });
        setPhase("done");
        setTimeout(() => {
          onSettled();
          setPhase("idle");
          setPlan([]);
          setPaidIdx(new Set());
        }, 900);
      } else {
        setPhase("review");
      }
    } catch (err) {
      setError("That transfer didn't go through. You can retry it below.");
      track("settle_failed", { groupId: groupId.toString() });
      Sentry.captureException(err);
      setPhase("review");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg">Balances</h2>
        {!allSettled && phase === "idle" && (
          <button
            onClick={handlePlanSettlement}
            className="bg-brass text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 focus-ring"
          >
            Settle up
          </button>
        )}
      </div>

      {error && <p className="text-sm text-owe-600 mb-3">{error}</p>}

      {allSettled ? (
        <p className="text-sm text-ink/50 py-6 text-center border border-dashed border-line rounded-lg">
          Everyone's settled up. Log a new expense to start a fresh balance.
        </p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {balances
            .filter((b) => b.net !== 0n)
            .map((b) => (
              <div key={b.member} className="flex items-center justify-between py-3">
                <span className="text-sm">{labelFor(b.member, labels)}</span>
                <span
                  className={`ledger-amount text-sm font-medium ${
                    b.net > 0n ? "text-ledger-600" : "text-owe-600"
                  }`}
                >
                  {b.net > 0n ? "is owed " : "owes "}
                  {formatXlm(b.net < 0n ? -b.net : b.net)}
                </span>
              </div>
            ))}
        </div>
      )}

      {phase === "planning" && (
        <p className="mt-4 text-sm text-ink/50 animate-pulse">
          Calculating the minimum number of transfers…
        </p>
      )}

      {(phase === "review" || phase === "paying" || phase === "done") && plan.length > 0 && (
        <div className="mt-6 animate-rise-in">
          <p className="text-xs uppercase tracking-widest text-ink/40 font-medium mb-2">
            Settlement plan — {plan.length} transfer{plan.length === 1 ? "" : "s"}
          </p>
          <div className="border border-line rounded-lg overflow-hidden">
            {plan.map((t, idx) => {
              const isPaid = paidIdx.has(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-4 py-3 ledger-row last:border-b-0 ${
                    isPaid ? "animate-collapse" : ""
                  }`}
                >
                  <span className="text-sm">
                    {labelFor(t.from, labels)} → {labelFor(t.to, labels)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="ledger-amount text-sm">{formatXlm(t.amount)}</span>
                    {t.from === currentAddress && !isPaid && (
                      <button
                        onClick={() => handlePayTransfer(idx, t)}
                        disabled={phase === "paying"}
                        className="text-xs bg-ledger-600 text-white rounded-sm px-3 py-1.5 hover:bg-ledger-900 disabled:opacity-50 focus-ring"
                      >
                        {phase === "paying" ? "Confirming…" : "Pay"}
                      </button>
                    )}
                    {t.from !== currentAddress && !isPaid && (
                      <span className="text-xs text-ink/40">Waiting on payer</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {phase === "done" && (
            <p className="text-sm text-ledger-600 font-medium mt-3">
              All settled. Group balance reset to zero.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
