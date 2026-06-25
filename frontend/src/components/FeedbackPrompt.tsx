"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

const RATINGS = [
  { value: "confusing", label: "Confusing" },
  { value: "ok", label: "It was OK" },
  { value: "clear", label: "Very clear" },
] as const;

export function FeedbackPrompt({ onDismiss }: { onDismiss: () => void }) {
  const [rating, setRating] = useState<string | null>(null);
  const [wouldUseReal, setWouldUseReal] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    track("feedback_submitted", {
      clarity: rating,
      wouldUseRealMoney: wouldUseReal,
      comment: comment.slice(0, 500),
    });
    setSubmitted(true);
    setTimeout(onDismiss, 1400);
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-paper rounded-lg max-w-sm w-full p-6 animate-rise-in shadow-xl">
        {submitted ? (
          <p className="text-center font-display text-lg py-6">Thanks — that helps a lot.</p>
        ) : (
          <>
            <h3 className="font-display text-lg mb-1">Quick question</h3>
            <p className="text-sm text-ink/55 mb-4">
              You just settled a group balance on-chain. Mind a 20-second check-in?
            </p>

            <p className="text-sm font-medium mb-2">How clear was that settlement flow?</p>
            <div className="flex gap-2 mb-4">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRating(r.value)}
                  className={`text-xs rounded-full px-3 py-1.5 border focus-ring ${
                    rating === r.value
                      ? "bg-ink text-paper border-ink"
                      : "border-line text-ink/60 hover:border-ink/30"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <p className="text-sm font-medium mb-2">Would you use this with real money?</p>
            <div className="flex gap-2 mb-4">
              {[
                { v: true, l: "Yes" },
                { v: false, l: "Not yet" },
              ].map((opt) => (
                <button
                  key={String(opt.v)}
                  onClick={() => setWouldUseReal(opt.v)}
                  className={`text-xs rounded-full px-3 py-1.5 border focus-ring ${
                    wouldUseReal === opt.v
                      ? "bg-ink text-paper border-ink"
                      : "border-line text-ink/60 hover:border-ink/30"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Anything confusing or missing? (optional)"
              rows={2}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus-ring bg-ink/5 mb-4 resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!rating || wouldUseReal === null}
                className="flex-1 bg-ink text-paper rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40 focus-ring"
              >
                Send feedback
              </button>
              <button
                onClick={onDismiss}
                className="text-sm text-ink/50 px-3 hover:text-ink focus-ring rounded-sm"
              >
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
