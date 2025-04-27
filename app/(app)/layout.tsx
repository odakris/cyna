// app/(site)/layout.tsx
import { CartProvider } from "@/context/CartContext"
import NavbarServer from "@/components/Navbar/NavBarServer"
import { Footer } from "@/components/Footer/Footer"
import { Toaster } from "@/components/ui/toaster"
import ChatbotButton from "@/components/Chatbot/ChatbotButton"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const user = await getServerSession();

  const cart = await prisma.cartItem.findMany({
    where: {
      userId_user: user?.user.id
    }
  });

  return (
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
        <Toaster />

        {/* Chatbot Button - Ajouté ici */}
        <ChatbotButton />

        {/* Footer */}
        <div className="w-full">
          <Footer />
        </div>
      </div>
    </CartProvider>
  )
}
