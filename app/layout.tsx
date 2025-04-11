// app/layout.tsx (Root Layout)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import UserSessionProvider from "@/context/UserSessionProvider";
import { CartProvider } from "@/context/CartContext"; // Ajout de l'importation

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CYNA",
  description: "B3 DEV-B CYNA PROJECT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserSessionProvider>
          <CartProvider> {/* Ajout du CartProvider */}
            <TooltipProvider>{children}</TooltipProvider>
          </CartProvider>
        </UserSessionProvider>
      </body>
    </html>
  );
}