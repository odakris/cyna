// app/(site)/layout.tsx
import { CartProvider } from "@/context/CartContext"
import NavbarServer from "@/components/Navbar/NavBarServer"
import { Footer } from "@/components/Footer/Footer"
import { Toaster } from "@/components/ui/toaster"

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
        <main className="flex-1 max-w-7xl w-full mx-auto py-4 px-10 mt-20">
          {children}
        </main>
        <Toaster />

        {/* Footer */}
        <div className="w-full">
          <Footer />
        </div>
      </div>
    </CartProvider>
  )
}
