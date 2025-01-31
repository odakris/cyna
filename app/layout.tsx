import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/Navbar/Navbar"
import { Footer } from "../components/Footer/Footer"

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
        <div className="min-h-screen flex flex-col cyna-text">
          {/* Navbar */}
          <div className="w-full">
            <Navbar />
          </div>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-4 mt-20">
            {children}
          </main>

          {/* Footer */}
          {/* <footer className="w-full"> */}
          <div className="w-full">
            <Footer />
          </div>
          {/* </footer> */}
        </div>
      </body>
    </html>
  )
}
