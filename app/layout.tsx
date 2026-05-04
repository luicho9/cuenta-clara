import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cuenta-clara-agent-chat-sdk.vercel.app"),
  title: "Cuenta Clara · Your books on WhatsApp",
  description:
    "Send a voice note or text. Cuenta Clara logs the sale, tracks the expense, and texts you the daily P&L. Built for LATAM micro-businesses.",
  openGraph: {
    title: "Cuenta Clara · Your books on WhatsApp",
    description:
      "Send a voice note or text. Cuenta Clara logs the sale, tracks the expense, and texts you the daily P&L. Built for LATAM micro-businesses.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuenta Clara · Your books on WhatsApp",
    description:
      "Send a voice note or text. Cuenta Clara logs the sale, tracks the expense, and texts you the daily P&L. Built for LATAM micro-businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
