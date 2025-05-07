import { Input } from "@/components/ui/input"
import { Mail, User } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthTabs from "@/components/Auth/AuthTabs"

interface GuestEmailFormProps {
  guestEmail: string
  setGuestEmail: (email: string) => void
}

export function GuestEmailForm({
  guestEmail,
  setGuestEmail,
}: GuestEmailFormProps) {
  return (
    <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gray-50 border-b pb-4">
        <CardTitle className="text-lg font-semibold text-[#302082] flex items-center gap-2">
          <User className="h-5 w-5" />
          Identification
        </CardTitle>
        <CardDescription>
          Connectez-vous ou continuez en tant qu&apos;invité
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="guest" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-lg mb-4 bg-gray-100 p-1">
            <TabsTrigger
              value="guest"
              className="rounded-md data-[state=active]:bg-[#302082] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Invité
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="rounded-md data-[state=active]:bg-[#302082] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              Connexion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guest" className="mt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  Adresse email
                </label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  className="bg-white focus:ring-[#302082] focus:border-[#302082]"
                />
                <p className="text-xs text-gray-500">
                  Nous utiliserons cet email pour vous envoyer les informations
                  de votre commande
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="login" className="mt-2">
            <AuthTabs />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
