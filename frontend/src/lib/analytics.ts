"use client";

import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

export type AnalyticsEvent =
  | "wallet_connected"
  | "wallet_connect_failed"
  | "group_created"
  | "group_joined"
  | "expense_logged"
  | "settle_initiated"
  | "settle_transfer_signed"
  | "settle_confirmed"
  | "settle_failed"
  | "feedback_submitted";

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyWallet(publicKey: string) {
  if (!initialized) return;
  posthog.identify(publicKey);
}
