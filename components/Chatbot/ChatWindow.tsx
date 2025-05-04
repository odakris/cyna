"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, User, Loader2, Shield } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatbot } from "@/hooks/chatbot/use-chatbot"
import { MessageType } from "@prisma/client"

export default function ChatWindow() {
  const { messages, isLoading, sendMessage, requestHumanSupport } = useChatbot()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = () => {
    if (input.trim() === "") return
    sendMessage(input)
    setInput("")
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-focus input when chat is opened and after sending a message
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages.length]) // Re-focus after messages change (including after sending)

  // Ensure focus is maintained when clicking elsewhere in the chat
  const handleChatboxClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // SVG ChatBot avatar
  const ChatbotAvatar = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <rect width="24" height="24" rx="12" fill="#302082" />
      <path
        d="M18 10.2C18 13.27 15.5 15.9 12 17C8.5 15.9 6 13.27 6 10.2C6 7.13 8.5 4.5 12 4.5C15.5 4.5 18 7.13 18 10.2Z"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17V19.5"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 19.5H9"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1" fill="#FF6B00" />
      <circle cx="14" cy="10" r="1" fill="#FF6B00" />
      <path
        d="M10 13C10.5 13.5 11.5 14 12 14C12.5 14 13.5 13.5 14 13"
        stroke="#FF6B00"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )

  return (
    <Card
      className="w-80 sm:w-96 h-[500px] shadow-lg"
      onClick={handleChatboxClick}
    >
      <CardHeader className="bg-[#302082] text-white py-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 bg-[#302082]">
              <AvatarFallback className="bg-[#302082]">
                <ChatbotAvatar />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">CYNA Assistant</span>
          </div>
        </CardTitle>
      </CardHeader>

      <ScrollArea className="h-[350px] px-3 pt-3 bg-[#F2F2F2]">
        <div className="flex flex-col gap-3 pb-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === MessageType.USER ? "justify-end" : "justify-start"} gap-2`}
            >
              {message.type !== MessageType.USER && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={
                      message.type === MessageType.ADMIN
                        ? "bg-green-100"
                        : "bg-[#302082]"
                    }
                  >
                    {message.type === MessageType.ADMIN ? (
                      <Shield className="h-4 w-4 text-green-700" />
                    ) : (
                      <ChatbotAvatar />
                    )}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] ${
                  message.type === MessageType.USER
                    ? "bg-[#FF6B00] text-white rounded-tr-none"
                    : message.type === MessageType.ADMIN
                      ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-100 rounded-tl-none"
                      : "bg-[#302082] text-white rounded-tl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.type === MessageType.USER && (
                <Avatar className="h-8 w-8 bg-[#FF6B00]/90">
                  <AvatarFallback className="bg-[#FF6B00]/90 text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#302082]">
                  <ChatbotAvatar />
                </AvatarFallback>
              </Avatar>
              <div className="px-3 py-2 rounded-lg bg-[#302082] rounded-tl-none">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <CardFooter className="pt-3 pb-4 flex flex-col gap-2 bg-[#F2F2F2] border-t border-gray-200">
        <div className="flex w-full items-center space-x-2">
          <Input
            ref={inputRef}
            placeholder="Tapez votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-gray-300 focus:ring-[#302082] focus:border-[#302082]"
            disabled={isLoading}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ""}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-[#302082] text-[#302082] hover:bg-[#302082] hover:text-white"
          onClick={requestHumanSupport}
          disabled={isLoading}
        >
          Parler à un conseiller
        </Button>
      </CardFooter>
    </Card>
  )
}
