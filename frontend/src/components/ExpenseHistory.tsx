"use client";

import { ExpenseDto } from "@/lib/contract";
import { formatXlm, truncateAddress } from "@/lib/format";

export function ExpenseHistory({
  expenses,
  labels,
}: {
  expenses: ExpenseDto[];
  labels: Record<string, string>;
}) {
  if (expenses.length === 0) {
    return (
      <p className="text-sm text-ink/50 py-6 text-center border border-dashed border-line rounded-lg">
        No expenses yet. Log the first one below.
      </p>
    );
  }

  const sorted = [...expenses].sort((a, b) => Number(b.createdAt - a.createdAt));

  function downloadCSV() {
    const header = "Date,Description,Payer,Amount (XLM),Participants,Settled\n";
    const rows = sorted.map(e => {
      const date = new Date(Number(e.createdAt) * 1000).toLocaleString();
      const payerLabel = labels[e.payer] ?? e.payer;
      const amountStr = formatXlm(e.amount);
      return `"${date}","${e.description}","${payerLabel}",${amountStr},${e.participants.length},${e.settled}`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'group_expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button onClick={downloadCSV} className="text-xs text-ink/60 border border-line rounded px-2 py-1 hover:bg-ink/5 focus-ring">
          Export to CSV
        </button>
      </div>
      <div className="divide-y divide-line border-y border-line">
        {sorted.map((e) => (
          <div key={e.id.toString()} className="flex items-center justify-between py-3 gap-3">
            <div className="min-w-0">
              <p className="text-sm truncate">{e.description}</p>
              <p className="text-xs text-ink/45">
                {labels[e.payer] ?? truncateAddress(e.payer)} paid · split {e.participants.length}{" "}
                way{e.participants.length === 1 ? "" : "s"}
                {e.settled && <span className="text-ledger-600"> · settled</span>}
              </p>
            </div>
            <span className="ledger-amount text-sm shrink-0">{formatXlm(e.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
