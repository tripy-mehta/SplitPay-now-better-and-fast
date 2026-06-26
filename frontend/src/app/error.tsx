"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center max-w-sm">
        <p className="font-display text-2xl mb-2">Something went off the ledger.</p>
        <p className="text-sm text-ink/55 mb-6">
          That wasn&apos;t supposed to happen. You can try again, or refresh the page.
        </p>
        <button
          onClick={reset}
          className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium text-sm hover:bg-ink/85 focus-ring"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
