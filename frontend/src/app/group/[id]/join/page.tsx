"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useWallet } from "@/hooks/useWallet";
import { joinGroup } from "@/lib/contract";
import { track } from "@/lib/analytics";
import * as Sentry from "@sentry/nextjs";

export default function JoinGroupPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const { address, connect, connecting } = useWallet();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "joining" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    async function run() {
      setStatus("joining");
      try {
        await joinGroup(BigInt(groupId), address!);
        track("group_joined", { groupId, via: "invite_link" });
      } catch (err) {
        // Already-a-member is a soft error — just proceed to the group.
        const message = err instanceof Error ? err.message : "";
        if (!/already/i.test(message)) {
          Sentry.captureException(err);
        }
      } finally {
        if (!cancelled) router.push(`/group/${groupId}`);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [address, groupId, router]);

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="font-display text-xl mb-3">Joining group #{groupId}…</p>
        {!address ? (
          <button
            onClick={connect}
            disabled={connecting}
            className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium text-sm hover:bg-ink/85 disabled:opacity-50 focus-ring"
          >
            {connecting ? "Connecting…" : "Connect Freighter to join"}
          </button>
        ) : (
          <p className="text-sm text-ink/50 animate-pulse">
            {status === "joining" ? "Confirming in your wallet…" : "Just a moment…"}
          </p>
        )}
        {error && <p className="text-sm text-owe-600 mt-3">{error}</p>}
      </div>
    </main>
  );
}
