"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, User, Bot, Loader2, Shield } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatbot } from "@/hooks/use-chatbot"
import { MessageType } from "@prisma/client"

interface ChatWindowProps {
  onClose: () => void
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const { messages, isLoading, sendMessage, requestHumanSupport } = useChatbot()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  return (
    <Card className="w-80 sm:w-96 h-[500px] shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground py-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            CYNA Assistant
          </div>
        </CardTitle>
      </CardHeader>

      <ScrollArea className="h-[350px] px-3 pt-3">
        <div className="flex flex-col gap-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === MessageType.USER ? "justify-end" : "justify-start"} gap-2`}
            >
              {message.type !== MessageType.USER && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.type === MessageType.ADMIN ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] ${
                  message.type === MessageType.USER
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : message.type === MessageType.ADMIN
                      ? "bg-green-100 dark:bg-green-900/20 rounded-tl-none"
                      : "bg-muted rounded-tl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.type === MessageType.USER && (
                <Avatar className="h-8 w-8 bg-primary/20">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="px-3 py-2 rounded-lg bg-muted rounded-tl-none">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <CardFooter className="pt-3 pb-4 flex flex-col gap-2">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Tapez votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ""}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={requestHumanSupport}
          disabled={isLoading}
        >
          Parler à un conseiller
        </Button>
      </CardFooter>
    </Card>
  )
}
