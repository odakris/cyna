import { useRef, useEffect } from "react"
import {
  Card,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Bot,
  // Send,
  Shield,
  // XCircle,
  // Loader2,
  // CheckCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
import { MessageType, ConversationStatus } from "@prisma/client"

interface Message {
  id_message: number
  content: string
  message_type: MessageType
  created_at: string | Date
}

interface ConversationMessagesProps {
  messages: Message[]
  formatMessageTime: (date: string | Date) => string
  status: ConversationStatus
  updateStatus: (status: ConversationStatus) => void
  statusUpdating: boolean
  input: string
  setInput: (value: string) => void
  handleSendMessage: () => void
  sending: boolean
}

export default function ConversationMessages({
  messages,
  formatMessageTime,
  // status,
  // updateStatus,
  // statusUpdating,
  // input,
  // setInput,
  // handleSendMessage,
  // sending,
}: ConversationMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Faire défiler vers le dernier message lorsque les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Gérer la touche Entrée pour envoyer le message
  // const handleKeyDown = (event: React.KeyboardEvent) => {
  //   if (event.key === "Enter" && !event.shiftKey) {
  //     event.preventDefault()
  //     handleSendMessage()
  //   }
  // }

  // Rendu de l'avatar en fonction du type de message
  const renderAvatar = (type: MessageType) => {
    switch (type) {
      case MessageType.USER:
        return (
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarFallback className="bg-primary/10 text-xs sm:text-sm">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>
        )
      case MessageType.BOT:
        return (
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarFallback className="text-xs sm:text-sm">
              <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>
        )
      case MessageType.ADMIN:
        return (
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarFallback className="bg-green-100 text-green-800 text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>
        )
      default:
        return (
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarFallback className="text-xs sm:text-sm">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>
        )
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="py-3 sm:py-4 px-3 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg sm:text-xl">Conversation</CardTitle>
          {/* <Badge
            variant={
              status === "ACTIVE"
                ? "default"
                : status === "PENDING_ADMIN"
                  ? "destructive"
                  : "outline"
            }
          >
            {status === "ACTIVE" && <CheckCircle className="mr-1 h-3 w-3" />}
            {status === "PENDING_ADMIN" && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            {status === "CLOSED" && <XCircle className="mr-1 h-3 w-3" />}
            {status}
          </Badge> */}
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {messages.length} message{messages.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>

      <ScrollArea className="h-[400px] sm:h-[500px] px-3 sm:px-4">
        <div className="flex flex-col gap-3 sm:gap-4 py-3 sm:py-4">
          {messages.map(message => (
            <div
              key={message.id_message}
              className={`flex gap-2 sm:gap-3 ${
                message.message_type === MessageType.USER
                  ? "justify-start"
                  : "justify-start"
              }`}
            >
              {renderAvatar(message.message_type)}

              <div className="flex flex-col max-w-[80%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-xs sm:text-sm">
                    {message.message_type === MessageType.USER
                      ? "Client"
                      : message.message_type === MessageType.BOT
                        ? "Bot"
                        : "Conseiller"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>

                <div
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                    message.message_type === MessageType.USER
                      ? "bg-muted"
                      : message.message_type === MessageType.BOT
                        ? "bg-primary/10"
                        : "bg-green-100 dark:bg-green-900/20"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-xs sm:text-sm">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* <CardFooter className="pt-4 sm:pt-6 pb-6 sm:pb-8 border-t">
        {status === "CLOSED" ? (
          <div className="w-full text-center py-3 sm:py-4 text-muted-foreground">
            <XCircle className="mx-auto h-5 w-5 sm:h-6 sm:w-6 mb-2 opacity-70" />
            <p className="text-sm sm:text-base">Cette conversation est fermée</p>
            <Button
              className="mt-2 text-xs sm:text-sm h-8 sm:h-10"
              variant="outline"
              onClick={() => updateStatus("ACTIVE")}
              disabled={statusUpdating}
            >
              Réactiver la conversation
            </Button>
          </div>
        ) : (
          <div className="flex w-full space-x-2">
            <Input
              placeholder="Tapez votre réponse..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending || status === "CLOSED"}
              className="text-sm"
            />
            <Button
              onClick={handleSendMessage}
              variant="cyna"
              disabled={sending || !input.trim() || status === "CLOSED"}
              className="text-xs sm:text-sm h-9 sm:h-10"
            >
              {sending ? (
                <Loader2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Send className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              Envoyer
            </Button>
          </div>
        )}
      </CardFooter> */}
    </Card>
  )
}
