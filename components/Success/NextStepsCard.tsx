import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Package, Phone, ArrowLeft, ShoppingBag } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface NextStepsCardProps {
  email?: string // Rendons l'email optionnel
}

export function NextStepsCard({ email }: NextStepsCardProps) {
  return (
    <Card className="border-2 border-gray-100 shadow-md mb-6">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg font-semibold text-[#302082]">
          Et maintenant ?
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 pb-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#302082]/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-[#302082]" />
            </div>
            <div>
              <p className="font-medium">Consultez votre email</p>
              <p className="text-sm text-gray-600">
                {email ? (
                  <>
                    Nous avons envoyé un email de confirmation à {email} avec
                    tous les détails de votre commande.
                  </>
                ) : (
                  <>
                    Nous avons envoyé un email de confirmation avec tous les
                    détails de votre commande.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#302082]/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-[#302082]" />
            </div>
            <div>
              <p className="font-medium">Accédez à vos produits</p>
              <p className="text-sm text-gray-600">
                Pour les produits numériques, vous recevrez par email les
                instructions d&apos;accès et les licences.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#302082]/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-4 w-4 text-[#302082]" />
            </div>
            <div>
              <p className="font-medium">Besoin d&apos;aide ?</p>
              <p className="text-sm text-gray-600">
                Notre équipe de support est disponible 24/7 pour vous aider avec
                votre commande.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6 flex flex-col xs:flex-row gap-4">
        <Button
          asChild
          variant="outline"
          className="w-full xs:w-auto border-[#302082] text-[#302082] hover:bg-[#302082]/5"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </Button>

        <Button
          asChild
          className="w-full xs:w-auto bg-[#FF6B00] hover:bg-[#FF6B00]/90"
        >
          <Link href="/produit">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continuer vos achats
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
