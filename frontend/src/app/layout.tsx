import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/hooks/useWallet";
import { AnalyticsInit } from "@/components/AnalyticsInit";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SplitPay — Settle group expenses, anywhere",
  description:
    "Log shared group expenses and settle them instantly in XLM, across any border, with the minimum number of transfers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body bg-paper text-ink min-h-screen">
        <AnalyticsInit />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
