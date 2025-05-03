"use client"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

const EmailVerificationSuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 relative overflow-hidden">
      <Card className="max-w-md w-full border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#302082] to-[#FF6B00]" />

        <CardHeader className="text-center pb-4 relative">
          {/* Container centré pour l'icône */}
          <div className="flex justify-center mb-6 mt-2">
            <div className="p-4 bg-green-50 rounded-full">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-green-600">
            Email vérifié avec succès!
          </CardTitle>

          <p className="text-gray-600 mt-4 leading-relaxed">
            Votre adresse email a été vérifiée avec succès. Vous pouvez
            maintenant vous connecter à votre compte et profiter de tous les
            services CYNA.
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 shadow-md"
            >
              <Link href="/auth">
                <span className="px-2">Se connecter maintenant</span>
              </Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500 pt-2">
          <span className="flex items-center gap-1">
            <span className="font-bold text-[#302082]">CYNA</span> -{" "}
            {new Date().getFullYear()}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

export default EmailVerificationSuccessPage
