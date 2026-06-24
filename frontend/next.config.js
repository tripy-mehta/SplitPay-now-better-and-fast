const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
};

// withSentryConfig is safe to apply even when NEXT_PUBLIC_SENTRY_DSN is
// unset — Sentry.init() in sentry.client.config.ts checks for the DSN and
// stays disabled, so local dev without Sentry configured still works.
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
});

