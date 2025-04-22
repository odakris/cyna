"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import ChatWindow from "./ChatWindow"
import { usePathname } from "next/navigation"

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const pathname = usePathname()

  // Masquer le chatbot dans les pages du dashboard/admin
  useEffect(() => {
    setIsVisible(!pathname.includes("/dashboard"))
  }, [pathname])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  // Animation pour l'apparition du chatbot (sans effet clignotant)
  const buttonAnimationClass = isOpen
    ? ""
    : "transition-transform hover:scale-105"

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col items-end animate-in fade-in slide-in-from-right duration-300">
          <ChatWindow />
          <Button
            onClick={toggleChat}
            variant="default"
            size="icon"
            className="bg-[#FF6B00] hover:bg-white hover:text-[#FF6B00] hover:border-[#FF6B00] border-2 border-transparent rounded-full h-12 w-12 shadow-lg mt-2 transition-all duration-300"
            aria-label="Fermer le chat"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={toggleChat}
          variant="default"
          size="icon"
          className={`bg-[#302082] hover:bg-[#302082]/90 text-white rounded-full h-14 w-14 shadow-lg ${buttonAnimationClass}`}
          aria-label="Ouvrir le chat avec l'assistant CYNA"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute top-0 right-0 flex h-3 w-3">
            {/* Indicateur sans animation de clignotement */}
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B00]"></span>
          </span>
        </Button>
      )}
    </div>
  )
}
