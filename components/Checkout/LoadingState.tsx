import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin mb-4">
        <Loader2 className="h-8 w-8 text-[#302082]" />
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

// components/Success/OrderHeader.tsx
import { CheckCircle2 } from "lucide-react"

interface OrderHeaderProps {
  orderId: number
  email: string
}

export function OrderHeader({ orderId, email }: OrderHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-2">
        Commande confirmée !
      </h1>
      {/* <p className="text-gray-600 max-w-lg mx-auto">
        Votre commande #{orderId} a été traitée avec succès. Un email de
        confirmation a été envoyé à {email}.
      </p> */}
    </div>
  )
}
