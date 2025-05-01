"use client"

import UserForm from "@/components/Forms/UserForm"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { useParams } from "next/navigation"

export default function EditUserPage() {
  const { id } = useParams() as { id: string }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de modifier les utilisateurs." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <UserForm userId={id} />
      </div>
    </RoleGuard>
  )
}
