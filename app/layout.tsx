import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Footer } from "../components/Footer/Footer"
import { CartProvider } from "../context/CartContext"
import UserSessionProvider from "../context/UserSessionProvider"
import NavbarServer from "../components/Navbar/NavBarServer"

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
            <div className="min-h-screen flex flex-col cyna-text">
              {/* Navbar */}
              <div className="w-full">
                <NavbarServer />
              </div>

              {/* Main Content */}
              <main className="flex-1 max-w-7xl w-full mx-auto py-4 px-10 mt-20">
                {children}
              </main>

              {/* Footer */}
              <div className="w-full">
                <Footer />
              </div>
            </div>
          </CartProvider>
        </UserSessionProvider>
      </body>
    </html>
  )
}
