import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { VisitTracker } from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: "DeviFacture | Créez vos devis et factures en quelques clics",
  description: "Découvrez DeviFacture, l'outil simple, rapide et intuitif pour concevoir vos devis et factures professionnels. Suivez votre activité et gérez vos clients en toute simplicité.",
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
