"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/States";
import { useWallet } from "@/hooks/useWallet";
import { createGroup, joinGroup } from "@/lib/contract";
import { track } from "@/lib/analytics";
import * as Sentry from "@sentry/nextjs";

export default function HomePage() {
  const { address, connect } = useWallet();
  const router = useRouter();

  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [groupName, setGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const groupId = await createGroup(address, groupName.trim() || "Untitled group");
      track("group_created", { groupId: groupId.toString() });
      router.push(`/group/${groupId}`);
    } catch (err: any) {
      setFormError(err?.message || "Couldn't create the group. Check your connection and try again.");
      Sentry.captureException(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    const id = joinGroupId.trim();
    if (!/^\d+$/.test(id)) {
      setFormError("Enter the numeric group ID your group shared with you.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await joinGroup(BigInt(id), address);
      track("group_joined", { groupId: id });
      router.push(`/group/${id}`);
    } catch (err: any) {
      setFormError(err?.message || "Couldn't join that group. Double check the ID, or you may already be a member.");
      Sentry.captureException(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <section className="mb-12">
          <p className="text-xs uppercase tracking-widest text-brass font-medium mb-3">
            Cross-border group expenses
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
            Split the bill.
            <br />
            Settle in seconds, not bank days.
          </h1>
          <p className="text-ink/60 max-w-md leading-relaxed">
            Log shared expenses with your group and settle every balance with the
            fewest possible transfers — instantly, in XLM, no matter what country
            anyone&apos;s in.
          </p>
        </section>

        {!address ? (
          <EmptyState
            title="Connect a wallet to get started"
            description="SplitPay uses Freighter on Stellar testnet. Connect to create or join a group."
            action={
              <button
                onClick={connect}
                className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium text-sm hover:bg-ink/85 focus-ring"
              >
                Connect Freighter
              </button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode("create")}
              className={`text-left border rounded-lg p-5 transition-colors focus-ring ${
                mode === "create" ? "border-ink bg-ink/[0.03]" : "border-line hover:border-ink/30"
              }`}
            >
              <p className="font-display text-lg mb-1">Start a new group</p>
              <p className="text-sm text-ink/55">Trip, rent, dinner — anything shared.</p>
            </button>
            <button
              onClick={() => setMode("join")}
              className={`text-left border rounded-lg p-5 transition-colors focus-ring ${
                mode === "join" ? "border-ink bg-ink/[0.03]" : "border-line hover:border-ink/30"
              }`}
            >
              <p className="font-display text-lg mb-1">Join an existing group</p>
              <p className="text-sm text-ink/55">Enter the group ID someone shared with you.</p>
            </button>
          </div>
        )}

        {mode === "create" && address && (
          <form onSubmit={handleCreate} className="mt-6 animate-rise-in space-y-3 max-w-sm">
            <label className="block text-sm font-medium" htmlFor="group-name">
              Group name
            </label>
            <input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Osaka Trip"
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus-ring bg-white"
              maxLength={64}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-brass text-ink rounded-md px-4 py-2 font-medium text-sm hover:opacity-90 disabled:opacity-50 focus-ring"
            >
              {submitting ? "Creating…" : "Create group"}
            </button>
          </form>
        )}

        {mode === "join" && address && (
          <form onSubmit={handleJoin} className="mt-6 animate-rise-in space-y-3 max-w-sm">
            <label className="block text-sm font-medium" htmlFor="group-id">
              Group ID
            </label>
            <input
              id="group-id"
              value={joinGroupId}
              onChange={(e) => setJoinGroupId(e.target.value)}
              placeholder="e.g. 4"
              inputMode="numeric"
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus-ring bg-white"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-brass text-ink rounded-md px-4 py-2 font-medium text-sm hover:opacity-90 disabled:opacity-50 focus-ring"
            >
              {submitting ? "Joining…" : "Join group"}
            </button>
          </form>
        )}

        {formError && (
          <p className="mt-4 text-sm text-owe-600 max-w-sm">{formError}</p>
        )}
      </div>
    </main>
  );
}
