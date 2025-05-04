import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm"

export const metadata = {
  title: "Mot de passe oublié | CYNA",
  description: "Réinitialisez votre mot de passe CYNA",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <ForgotPasswordForm />
    </div>
  )
}
