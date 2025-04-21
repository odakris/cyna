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

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col items-end">
          <ChatWindow onClose={() => setIsOpen(false)} />
          <Button
            onClick={toggleChat}
            variant="default"
            size="icon"
            className="bg-red-500 hover:bg-red-600 rounded-full h-12 w-12 shadow-lg mt-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={toggleChat}
          variant="default"
          size="icon"
          className="bg-primary hover:bg-primary/90 rounded-full h-14 w-14 shadow-lg"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}
    </div>
  )
}
