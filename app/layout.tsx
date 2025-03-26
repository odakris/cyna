import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Footer } from "../components/Footer/Footer"
import { CartProvider } from "../context/CartContext"
import UserSessionProvider from "../context/UserSessionProvider"
import NavbarServer from "../components/Navbar/NavBarServer"
import { Toaster } from "../components/ui/toaster"

// Importer TooltipProvider depuis vos composants ui
import { TooltipProvider } from "@/components/ui/tooltip"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CYNA",
  description: "B3 DEV-B CYNA PROJECT",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserSessionProvider>
          <CartProvider>
            <TooltipProvider> {/* Envelopper toute l'application avec TooltipProvider */}
              <div className="min-h-screen flex flex-col cyna-text">
                {/* Navbar */}
                <div className="w-full">
                  <NavbarServer />
                </div>

                {/* Main Content */}
                <main className="flex-1 max-w-7xl w-full mx-auto py-4 px-10 mt-20">
                  {children}
                </main>
                <Toaster />

                {/* Footer */}
                <div className="w-full">
                  <Footer />
                </div>
              </div>
            </TooltipProvider>
          </CartProvider>
        </UserSessionProvider>
      </body>
    </html>
  )
}
