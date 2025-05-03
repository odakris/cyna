import { CartProvider } from "@/context/CartContext"
import NavbarServer from "@/components/Navbar/NavBarServer"
import { Footer } from "@/components/Footer/Footer"
import { Toaster } from "@/components/ui/toaster"
import ChatbotButton from "@/components/Chatbot/ChatbotButton"
import { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://cyna-it.fr"),
  title: "CYNA | Pure player en cybersécurité pour les PME et MSP",
  description:
    "CYNA protège les entreprises contre les cyberattaques : SOC 24/7, Audit, Pentest, CERT. Solutions de cybersécurité adaptées pour les PME et MSP.",
  keywords: [
    "cybersécurité",
    "SOC 24/7",
    "CERT",
    "pentest",
    "audit sécurité",
    "PME",
    "MSP",
    "protection cyberattaques",
  ],

  // Configuration des icônes modifiée pour utiliser l'image PNG spécifique
  icons: {
    icon: [
      // Utilisation directe de l'icône PNG comme favicon principal
      { url: "/assets/icon/cyna-icon-purple-gradient.png" },
      // Garder aussi le favicon.ico pour compatibilité avec les anciens navigateurs
      { url: "/favicon.ico" },
    ],
    // Utiliser la même icône pour Apple Touch Icon
    apple: [
      { url: "/assets/icon/cyna-icon-purple-gradient.png", sizes: "180x180" },
    ],
    // Autres icônes au besoin
    shortcut: [{ url: "/assets/icon/cyna-icon-purple-gradient.png" }],
  },

  openGraph: {
    title: "CYNA | Pure player en cybersécurité pour les PME et MSP",
    description:
      "Solutions de cybersécurité adaptées pour protéger votre entreprise contre les cyberattaques avec SOC 24/7, Audit, Pentest et CERT.",
    url: "https://cyna-it.fr",
    siteName: "CYNA",
    images: [
      {
        url: "/assets/icon/cyna-icon-purple-gradient.png", // Utiliser aussi l'icône pour OG image
        width: 512,
        height: 512,
        alt: "CYNA - Solutions de cybersécurité",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CYNA | Pure player en cybersécurité",
    description:
      "Protégez votre entreprise avec nos solutions de cybersécurité adaptées",
    images: ["/assets/icon/cyna-icon-purple-gradient.png"], // Utilisé également ici
    creator: "@CynaIT",
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: "verification_token",
  },

  alternates: {
    canonical: "https://cyna-it.fr",
  },
}

// Déplacé themeColor et viewport dans l'exportation de viewport
export const viewport: Viewport = {
  themeColor: "#302082",
  width: "device-width",
  initialScale: 1,
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col cyna-text mt-16">
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
