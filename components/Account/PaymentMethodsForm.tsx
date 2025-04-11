"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PaymentInfo } from "@prisma/client"

type PaymentMethodsFormProps = {
  initialData?: PaymentInfo
  onSubmit: (paymentMethod: any) => void
  loading?: boolean
}

export function PaymentMethodsForm({
  initialData,
  onSubmit,
  loading,
}: PaymentMethodsFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<any>(
    initialData || {
      card_name: "",
      card_number: "",
      expiration_month: "",
      expiration_year: "",
      cvv: "",
      is_default: false,
    }
  )

  useEffect(() => {
    if (initialData) {
      setPaymentMethod({
        card_name: initialData.card_name || "",
        card_number: initialData.card_number || "",
        expiration_month: initialData.expiration_month || "",
        expiration_year: initialData.expiration_year || "",
        cvv: initialData.cvv || "",
        is_default: initialData.is_default || false,
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(paymentMethod)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nom sur la carte */}
      <div>
        <label htmlFor="card_name" className="block text-sm font-medium">
          Nom sur la carte
        </label>
        <Input
          id="card_name"
          value={paymentMethod.card_name}
          onChange={e =>
            setPaymentMethod({ ...paymentMethod, card_name: e.target.value })
          }
          required
        />
      </div>

      {/* Numéro de carte */}
      <div>
        <label htmlFor="card_number" className="block text-sm font-medium">
          Numéro de carte
        </label>
        <Input
          id="card_number"
          value={paymentMethod.card_number}
          onChange={e =>
            setPaymentMethod({ ...paymentMethod, card_number: e.target.value })
          }
          required
        />
      </div>

      {/* Expiration (mois et année) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="expiration_month"
            className="block text-sm font-medium"
          >
            Mois d'expiration
          </label>
          <Input
            id="expiration_month"
            type="number"
            value={paymentMethod.expiration_month}
            onChange={e =>
              setPaymentMethod({
                ...paymentMethod,
                expiration_month: e.target.value,
              })
            }
            required
          />
        </div>
        <div>
          <label
            htmlFor="expiration_year"
            className="block text-sm font-medium"
          >
            Année d'expiration
          </label>
          <Input
            id="expiration_year"
            type="number"
            value={paymentMethod.expiration_year}
            onChange={e =>
              setPaymentMethod({
                ...paymentMethod,
                expiration_year: e.target.value,
              })
            }
            required
          />
        </div>
      </div>

      {/* CVV */}
      <div>
        <label htmlFor="cvv" className="block text-sm font-medium">
          CVV
        </label>
        <Input
          id="cvv"
          value={paymentMethod.cvv}
          onChange={e =>
            setPaymentMethod({ ...paymentMethod, cvv: e.target.value })
          }
          required
        />
      </div>

      {/* Carte par défaut */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="is_default"
          checked={paymentMethod.is_default}
          onCheckedChange={(val: boolean) =>
            setPaymentMethod({ ...paymentMethod, is_default: val })
          }
        />
        <label htmlFor="is_default">Carte par défaut</label>
      </div>

      {/* Bouton de soumission */}
      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : initialData ? "Modifier" : "Ajouter"}
      </Button>
    </form>
  )
}
