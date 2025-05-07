import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, ArrowLeft, ArrowRight, Home } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export interface Address {
  id_address: string
  first_name: string
  last_name: string
  address1: string
  address2?: string | null
  postal_code: string
  region?: string | null
  city: string
  country: string
  mobile_phone: string
}

interface CheckoutAddressProps {
  addresses: Address[]
  selectedAddress: string | null
  setSelectedAddress: (id: string) => void
  newAddress: {
    first_name: string
    last_name: string
    address1: string
    address2: string
    postal_code: string
    region: string
    city: string
    country: string
    mobile_phone: string
  }
  setNewAddress: (address: any) => void
  handleSaveNewAddress: () => Promise<void>
  onBack: () => void
  onNext: () => void
  loading?: boolean
  error?: string | null
}

export function CheckoutAddress({
  addresses,
  selectedAddress,
  setSelectedAddress,
  newAddress,
  setNewAddress,
  handleSaveNewAddress,
  onBack,
  onNext,
  loading = false,
  error = null,
}: CheckoutAddressProps) {
  return (
    <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gray-50 border-b pb-4">
        <CardTitle className="text-lg font-semibold text-[#302082] flex items-center gap-2">
          <Home className="h-5 w-5" />
          Adresse de facturation
        </CardTitle>
        <CardDescription>
          Sélectionnez une adresse existante ou ajoutez-en une nouvelle
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {addresses.length === 0 ? (
          <p className="text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Aucune adresse enregistrée. Veuillez en ajouter une ci-dessous.
          </p>
        ) : (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Vos adresses enregistrées :
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map(address => (
                <div
                  key={address.id_address}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedAddress === address.id_address.toString()
                      ? "border-[#302082] bg-[#302082]/5 shadow-md"
                      : "border-gray-200 hover:border-[#302082]/50 hover:shadow-sm"
                  }`}
                  onClick={() =>
                    setSelectedAddress(address.id_address.toString())
                  }
                >
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">
                      {address.first_name} {address.last_name}
                    </div>
                    <div className="flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          selectedAddress === address.id_address.toString()
                            ? "border-[#302082] bg-[#302082]"
                            : "border-gray-300"
                        } flex items-center justify-center`}
                      >
                        {selectedAddress === address.id_address.toString() && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>
                      {address.postal_code} {address.city}, {address.country}
                    </p>
                    <p>{address.mobile_phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        <div>
          <h3 className="text-base font-semibold mb-4 text-[#302082]">
            Ajouter une nouvelle adresse
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Prénom *
              </label>
              <Input
                placeholder="Prénom"
                value={newAddress.first_name}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    first_name: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nom *</label>
              <Input
                placeholder="Nom"
                value={newAddress.last_name}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    last_name: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Adresse ligne 1 *
              </label>
              <Input
                placeholder="Numéro et nom de la rue"
                value={newAddress.address1}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    address1: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Adresse ligne 2
              </label>
              <Input
                placeholder="Appartement, bâtiment, etc. (optionnel)"
                value={newAddress.address2}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    address2: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Code postal *
              </label>
              <Input
                placeholder="Code postal"
                value={newAddress.postal_code}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    postal_code: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ville *
              </label>
              <Input
                placeholder="Ville"
                value={newAddress.city}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    city: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Région
              </label>
              <Input
                placeholder="Région (optionnel)"
                value={newAddress.region}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    region: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Pays *
              </label>
              <Input
                placeholder="Pays"
                value={newAddress.country}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    country: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <Input
                placeholder="Numéro de téléphone"
                value={newAddress.mobile_phone}
                onChange={e =>
                  setNewAddress({
                    ...newAddress,
                    mobile_phone: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-4 flex flex-col md:flex-row flex-wrap gap-3 justify-between">
        <p className="text-xs text-gray-500 flex items-center">
          <span className="text-red-500">*</span> Champs obligatoires
        </p>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Button
            className="w-full md:w-auto px-3 text-sm"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <Button
            className="w-full md:w-auto px-3 text-sm bg-[#302082] hover:bg-[#302082]/90"
            onClick={handleSaveNewAddress}
            disabled={loading}
          >
            Ajouter l&apos;adresse
          </Button>

          {selectedAddress && (
            <Button
              className="w-full md:w-auto px-3 text-sm bg-[#FF6B00] hover:bg-[#FF6B00]/90"
              onClick={onNext}
              disabled={loading}
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
