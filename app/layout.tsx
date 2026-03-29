import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils/cn";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "MoneyMate",
  description:
    "A trustworthy personal finance workspace for document ingestion, review, and portfolio visibility."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={cn(
          sans.variable,
          mono.variable,
          "font-[family-name:var(--font-sans)] antialiased"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

