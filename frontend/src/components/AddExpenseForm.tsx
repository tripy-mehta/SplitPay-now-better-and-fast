"use client";

import { useState } from "react";
import { addExpense } from "@/lib/contract";
import { xlmToStroops } from "@/lib/format";
import { track } from "@/lib/analytics";
import * as Sentry from "@sentry/nextjs";

type Member = { address: string; label: string };

export function AddExpenseForm({
  groupId,
  payerAddress,
  members,
  onAdded,
}: {
  groupId: bigint;
  payerAddress: string;
  members: Member[];
  onAdded: () => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState<Set<string>>(
    new Set(members.map((m) => m.address))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleParticipant(addr: string) {
    setParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr);
      else next.add(addr);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!description.trim()) {
      setError("Add a short description for this expense.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (participants.size === 0) {
      setError("Select at least one person to split this with.");
      return;
    }

    setSubmitting(true);
    try {
      await addExpense(
        groupId,
        payerAddress,
        description.trim(),
        xlmToStroops(parsedAmount),
        Array.from(participants)
      );
      track("expense_logged", { groupId: groupId.toString(), amountXlm: parsedAmount });
      setDescription("");
      setAmount("");
      onAdded();
    } catch (err) {
      setError("Couldn't log that expense. Check your wallet and try again.");
      Sentry.captureException(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="desc" className="block text-sm font-medium mb-1">
          What was it for?
        </label>
        <input
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner at the izakaya"
          maxLength={80}
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus-ring bg-white"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Amount (XLM)
        </label>
        <input
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          inputMode="decimal"
          className="w-full border border-line rounded-md px-3 py-2 text-sm ledger-amount focus-ring bg-white"
        />
      </div>

      <div>
        <p className="block text-sm font-medium mb-2">Split between</p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              type="button"
              key={m.address}
              onClick={() => toggleParticipant(m.address)}
              className={`text-xs rounded-full px-3 py-1.5 border focus-ring transition-colors ${
                participants.has(m.address)
                  ? "bg-ledger-600 text-white border-ledger-600"
                  : "border-line text-ink/60 hover:border-ink/30"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-owe-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto bg-ink text-paper rounded-md px-5 py-2.5 font-medium text-sm hover:bg-ink/85 disabled:opacity-50 focus-ring"
      >
        {submitting ? "Logging…" : "Log expense"}
      </button>
    </form>
  );
}
