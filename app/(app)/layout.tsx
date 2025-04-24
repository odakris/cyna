// app/(site)/layout.tsx
import { CartProvider } from "@/context/CartContext"
import NavbarServer from "@/components/Navbar/NavBarServer"
import { Footer } from "@/components/Footer/Footer"
import { Toaster } from "@/components/ui/toaster"
import ChatbotButton from "@/components/Chatbot/ChatbotButton"

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col cyna-text">
        {/* Navbar */}
        <div className="w-full">
          <NavbarServer />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full mx-auto py-4 px-4 sm:px-6 md:px-8 lg:px-10 mt-16 sm:mt-18 lg:mt-20 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
          {children}
        </main>
        <Toaster />

        {/* Chatbot Button */}
        <ChatbotButton />

        {/* Footer */}
        <div className="w-full">
          <Footer />
        </div>
      </div>
    </CartProvider>
  )
}
