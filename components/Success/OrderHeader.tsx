import { CheckCircle2 } from "lucide-react"

interface OrderHeaderProps {
  orderId: number
  email?: string
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
      <p className="text-gray-600 max-w-lg mx-auto">
        Votre commande #{orderId} a été traitée avec succès.
        {email && <> Un email de confirmation a été envoyé à {email}.</>}
      </p>
    </div>
  )
}
