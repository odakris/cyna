"use client"
import { useSession } from "next-auth/react"
import PersonalInfoForm from "@/components/Account/PersonalInfoForm"
import AddressForm from "@/components/Account/AdresseForm"
import PaymentMethodsForm from "@/components/Account/PaymentMethodsForm"
import SubscriptionForm from "@/components/Account/SubscriptionForm"

export default function AccountSettingsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session?.user) {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    return <div>Accès refusé. Veuillez vous connecter.</div>
  }

  return (
    <div>
      <h1>Mes paramètres</h1>
      <PersonalInfoForm user={session.user} />
      <AddressForm user={session.user} />
      <PaymentMethodsForm user={session.user} />
      <SubscriptionForm user={session.user} />
    </div>
  )
}
