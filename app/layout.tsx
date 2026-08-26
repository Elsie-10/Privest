import type { Metadata } from "next";
import "./globals.css";
import { PortfolioProvider } from "./providers";

export const metadata: Metadata = {
  title: "Privest AI — Privacy-First Investment Analyst",
  description:
    "Confidential portfolio intelligence for retail investors. Understand your investments without exposing your financial life.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-bg text-navy">
        <PortfolioProvider>{children}</PortfolioProvider>
      </body>
    </html>
  );
}
