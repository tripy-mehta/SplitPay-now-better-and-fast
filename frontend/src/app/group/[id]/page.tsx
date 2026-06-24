"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { LoadingRows, InlineError, EmptyState } from "@/components/States";
import { BalanceLedger } from "@/components/BalanceLedger";
import { ExpenseHistory } from "@/components/ExpenseHistory";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { useWallet } from "@/hooks/useWallet";
import { getBalances, listExpenses, BalanceDto, ExpenseDto } from "@/lib/contract";
import { truncateAddress } from "@/lib/format";
import * as Sentry from "@sentry/nextjs";

export default function GroupPage() {
  const params = useParams<{ id: string }>();
  const groupId = BigInt(params.id);
  const { address, connect } = useWallet();

  const [balances, setBalances] = useState<BalanceDto[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [b, e] = await Promise.all([
        getBalances(groupId, address),
        listExpenses(groupId, address),
      ]);
      setBalances(b);
      setExpenses(e);
    } catch (err) {
      setError("Couldn't load this group. It may not exist, or the network is having trouble.");
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  }, [address, groupId]);

  useEffect(() => {
    load();
  }, [load]);

  function copyInviteLink() {
    const url = `${window.location.origin}/group/${groupId}/join`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  // Build a label map so the UI shows "You" instead of raw addresses where possible.
  const labels: Record<string, string> = {};
  if (address) labels[address] = "You";

  if (!address) {
    return (
      <main>
        <Header />
        <div className="mx-auto max-w-3xl px-5 py-12">
          <EmptyState
            title="Connect your wallet"
            description="You'll need to connect Freighter to view this group's balances."
            action={
              <button
                onClick={connect}
                className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium text-sm hover:bg-ink/85 focus-ring"
              >
                Connect Freighter
              </button>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Group #{groupId.toString()}</p>
            <h1 className="font-display text-2xl">Shared expenses</h1>
          </div>
          <button
            onClick={copyInviteLink}
            className="text-sm border border-line rounded-md px-3 py-2 hover:border-ink/30 focus-ring"
          >
            {copied ? "Link copied" : "Copy invite link"}
          </button>
        </div>

        {error && <InlineError message={error} onRetry={load} />}

        {loading ? (
          <LoadingRows count={3} />
        ) : (
          <>
            <section>
              <BalanceLedger
                groupId={groupId}
                balances={balances}
                labels={labels}
                currentAddress={address}
                onSettled={() => {
                  load();
                  setShowFeedback(true);
                }}
              />
            </section>

            <section>
              <h2 className="font-display text-lg mb-3">Expense history</h2>
              <ExpenseHistory expenses={expenses} labels={labels} />
            </section>

            <section>
              <h2 className="font-display text-lg mb-4">Log a new expense</h2>
              <AddExpenseForm
                groupId={groupId}
                payerAddress={address}
                members={[
                  { address, label: "You" },
                  ...Array.from(new Set(expenses.flatMap((e) => e.participants)))
                    .filter((a) => a !== address)
                    .map((a) => ({ address: a, label: truncateAddress(a) })),
                ]}
                onAdded={load}
              />
            </section>
          </>
        )}
      </div>

      {showFeedback && <FeedbackPrompt onDismiss={() => setShowFeedback(false)} />}
    </main>
  );
}
