"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type AddressFormProps = {
  initialData?: any
  onSubmit: (address: any) => void
  loading?: boolean
}

export function AddressForm({
  initialData,
  onSubmit,
  loading,
}: AddressFormProps) {
  const [address, setAddress] = useState<any>(initialData || {})

  useEffect(() => {
    if (initialData) setAddress(initialData)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(address)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prénom + Nom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium">
            Prénom
          </label>
          <Input
            id="first_name"
            value={address.first_name || ""}
            onChange={e =>
              setAddress({ ...address, first_name: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium">
            Nom
          </label>
          <Input
            id="last_name"
            value={address.last_name || ""}
            onChange={e =>
              setAddress({ ...address, last_name: e.target.value })
            }
          />
        </div>
      </div>

      {/* Adresse 1 + 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="address1" className="block text-sm font-medium">
            Adresse 1
          </label>
          <Input
            id="address1"
            value={address.address1 || ""}
            onChange={e => setAddress({ ...address, address1: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="address2" className="block text-sm font-medium">
            Adresse 2
          </label>
          <Input
            id="address2"
            value={address.address2 || ""}
            onChange={e => setAddress({ ...address, address2: e.target.value })}
          />
        </div>
      </div>

      {/* CP, Ville, Pays, Région */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium">
            Code postal
          </label>
          <Input
            id="postal_code"
            value={address.postal_code || ""}
            onChange={e =>
              setAddress({ ...address, postal_code: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium">
            Ville
          </label>
          <Input
            id="city"
            value={address.city || ""}
            onChange={e => setAddress({ ...address, city: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium">
            Pays
          </label>
          <Input
            id="country"
            value={address.country || ""}
            onChange={e => setAddress({ ...address, country: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="region" className="block text-sm font-medium">
            Région
          </label>
          <Input
            id="region"
            value={address.region || ""}
            onChange={e => setAddress({ ...address, region: e.target.value })}
          />
        </div>
      </div>

      {/* Téléphone + Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="mobile_phone" className="block text-sm font-medium">
            Téléphone
          </label>
          <Input
            id="mobile_phone"
            value={address.mobile_phone || ""}
            onChange={e =>
              setAddress({ ...address, mobile_phone: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Type d&apos;adresse :
          </label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="billing"
                checked={address.is_default_billing === 1}
                onCheckedChange={(val: boolean) =>
                  setAddress({ ...address, is_default_billing: val ? 1 : 0 })
                }
              />
              <label htmlFor="billing">Facturation</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="shipping"
                checked={address.is_default_shipping === 1}
                onCheckedChange={(val: boolean) =>
                  setAddress({ ...address, is_default_shipping: val ? 1 : 0 })
                }
              />
              <label htmlFor="shipping">Expédition</label>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton */}
      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  )
}
