import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { VisitTracker } from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: "DeviFacture | Facturation pour entrepreneurs africains",
  description: "DeviFacture est le SaaS simple et moderne pour les entrepreneurs africains. Créez des documents professionnels en quelques clics et suivez vos devis et factures sans prise de tête.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="font-sans h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50">
        {children}
        <VisitTracker />
        <Analytics />
      </body>
    </html>
  );
}
