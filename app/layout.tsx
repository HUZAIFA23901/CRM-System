import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Property Dealer CRM",
  description: "Production-ready CRM for property dealers"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProviderWrapper session={session}>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
