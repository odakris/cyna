// components/Admin/MessageNotificationProvider.tsx
"use client"

import { useUnreadMessagesNotification } from "@/hooks/contact-messages/use-unread-messages-notification"
import { createContext, useContext, ReactNode } from "react"

interface MessageNotificationContextType {
  unreadCount: number
  hasNewMessages: boolean
  checkUnreadMessages: () => Promise<void>
}

const MessageNotificationContext = createContext<
  MessageNotificationContextType | undefined
>(undefined)

export function useMessageNotification() {
  const context = useContext(MessageNotificationContext)
  if (context === undefined) {
    throw new Error(
      "useMessageNotification must be used within a MessageNotificationProvider"
    )
  }
  return context
}

export default function MessageNotificationProvider({
  children,
}: {
  children: ReactNode
}) {
  const notificationState = useUnreadMessagesNotification()

  return (
    <MessageNotificationContext.Provider value={notificationState}>
      {children}
    </MessageNotificationContext.Provider>
  )
}
