import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css"; // Import CSS here
import { WalletProviders } from "./WalletProviders";
import { Toaster } from "@/components/ui/toaster";
import '@solana/wallet-adapter-react-ui/styles.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BullsEye - Accountability as a Service",
  description:
    "Lock SOL, set goals, get verified by the community, and claim rewards. Web3-powered accountability platform on Solana.",
  keywords: ["Solana", "Web3", "Accountability", "Goals", "Blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <WalletProviders>
          {children}
          <Toaster />
        </WalletProviders>
      </body>
    </html>
  );
}