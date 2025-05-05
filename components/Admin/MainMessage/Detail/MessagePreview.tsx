import { MainMessage } from "@prisma/client"

interface MessagePreviewProps {
  message: MainMessage
}

export default function MessagePreview({ message }: MessagePreviewProps) {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-2">Aperçu</h3>
      <div
        className={`p-4 sm:p-6 rounded-md ${
          message?.has_background && message.background_color
            ? message.background_color
            : "bg-primary/5"
        }`}
      >
        <p
          className={`text-base sm:text-lg font-medium text-center ${
            message?.text_color ? message.text_color : "text-foreground"
          }`}
        >
          {message?.content}
        </p>
      </div>
    </div>
  )
}
