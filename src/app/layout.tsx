import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { BankAccountProvider } from "@/lib/bank-accounts";
import { FinancesProvider } from "@/lib/finances";

export const metadata: Metadata = {
  title: "ChatBank | Next-Gen AI Fintech",
  description: "AI-powered banking experience for the modern era.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <BankAccountProvider>
            <FinancesProvider>
              {children}
            </FinancesProvider>
          </BankAccountProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
