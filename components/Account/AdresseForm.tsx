"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  addressSchema,
  AddressFormValues,
} from "@/lib/validations/address-schema"
import { AlertCircle, Home, Save } from "lucide-react"

type AddressFormProps = {
  initialData?: Partial<AddressFormValues>
  onSubmit: (address: AddressFormValues) => void
  loading?: boolean
}

export function AddressForm({
  initialData,
  onSubmit,
  loading,
}: AddressFormProps) {
  const [address, setAddress] = useState<AddressFormValues>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    address1: initialData?.address1 || "",
    address2: initialData?.address2 || "",
    postal_code: initialData?.postal_code || "",
    city: initialData?.city || "",
    country: initialData?.country || "",
    region: initialData?.region || "",
    mobile_phone: initialData?.mobile_phone || "",
    is_default_billing: initialData?.is_default_billing ? 1 : 0,
    is_default_shipping: initialData?.is_default_shipping ? 1 : 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setAddress({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        address1: initialData.address1 || "",
        address2: initialData.address2 || "",
        postal_code: initialData.postal_code || "",
        city: initialData.city || "",
        country: initialData.country || "",
        region: initialData.region || "",
        mobile_phone: initialData.mobile_phone || "",
        is_default_billing: initialData.is_default_billing ? 1 : 0,
        is_default_shipping: initialData.is_default_shipping ? 1 : 0,
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = addressSchema.safeParse(address)

    if (!result.success) {
      const formattedErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) formattedErrors[err.path[0] as string] = err.message
      })
      setErrors(formattedErrors)
      return
    }

    setErrors({})
    onSubmit(result.data)
  }

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b">
        <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
          <Home className="h-5 w-5" />
          {initialData?.id_address
            ? "Modifier l'adresse"
            : "Ajouter une adresse"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prénom + Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className="text-sm font-medium">
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={address.first_name}
                onChange={e =>
                  setAddress({ ...address, first_name: e.target.value })
                }
                className={`${errors.first_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Votre prénom"
              />
              {errors.first_name && (
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.first_name}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name" className="text-sm font-medium">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={address.last_name}
                onChange={e =>
                  setAddress({ ...address, last_name: e.target.value })
                }
                className={`${errors.last_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Votre nom"
              />
              {errors.last_name && (
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.last_name}
                </div>
              )}
            </div>
          </div>

          {/* Adresse 1 + 2 */}
          <div className="space-y-1.5">
            <Label htmlFor="address1" className="text-sm font-medium">
              Adresse 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address1"
              value={address.address1}
              onChange={e =>
                setAddress({ ...address, address1: e.target.value })
              }
              className={`${errors.address1 ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder="Numéro et nom de rue"
            />
            {errors.address1 && (
              <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.address1}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address2" className="text-sm font-medium">
              Adresse 2
            </Label>
            <Input
              id="address2"
              value={address.address2}
              onChange={e =>
                setAddress({ ...address, address2: e.target.value })
              }
              className={`${errors.address2 ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder="Complément d'adresse (facultatif)"
            />
            {errors.address2 && (
              <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.address2}
              </div>
            )}
          </div>

          {/* CP, Ville, Pays, Région */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postal_code" className="text-sm font-medium">
                Code postal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="postal_code"
                value={address.postal_code}
                onChange={e =>
                  setAddress({ ...address, postal_code: e.target.value })
                }
                className={`${errors.postal_code ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Code postal"
              />
              {errors.postal_code && (
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.postal_code}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm font-medium">
                Ville <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={address.city}
                onChange={e => setAddress({ ...address, city: e.target.value })}
                className={`${errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Ville"
              />
              {errors.city && (
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.city}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-sm font-medium">
                Pays <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                value={address.country}
                onChange={e =>
                  setAddress({ ...address, country: e.target.value })
                }
                className={`${errors.country ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Pays"
              />
              {errors.country && (
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.country}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="region" className="text-sm font-medium">
                Région
              </Label>
              <Input
                id="region"
                value={address.region}
                onChange={e =>
                  setAddress({ ...address, region: e.target.value })
                }
                className={`${errors.region ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Région (facultatif)"
              />
              {errors.region && (
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.region}
                </div>
              )}
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-1.5">
            <Label htmlFor="mobile_phone" className="text-sm font-medium">
              Téléphone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobile_phone"
              value={address.mobile_phone}
              onChange={e =>
                setAddress({ ...address, mobile_phone: e.target.value })
              }
              className={`${errors.mobile_phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder="Numéro de téléphone"
            />
            {errors.mobile_phone && (
              <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.mobile_phone}
              </div>
            )}
          </div>

          {/* Type d'adresse */}
          <div className="pt-2 space-y-2">
            <Label className="block text-sm font-medium mb-1">
              Type d'adresse :
            </Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="billing"
                  checked={!!address.is_default_billing}
                  onCheckedChange={(val: boolean) =>
                    setAddress({ ...address, is_default_billing: val ? 1 : 0 })
                  }
                />
                <Label htmlFor="billing" className="text-sm font-normal">
                  Adresse de facturation
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="shipping"
                  checked={!!address.is_default_shipping}
                  onCheckedChange={(val: boolean) =>
                    setAddress({ ...address, is_default_shipping: val ? 1 : 0 })
                  }
                />
                <Label htmlFor="shipping" className="text-sm font-normal">
                  Adresse de livraison
                </Label>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t bg-gray-50/50 flex justify-end">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#302082] hover:bg-[#302082]/90 text-white"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
