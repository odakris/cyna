import { Metadata } from "next"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import ProductsPage from "@/components/Admin/Products/ProductPage"

export const metadata: Metadata = {
  title: "Gestion des Produits | CYNA Backoffice",
  description: "Interface de gestion des produits CYNA",
}

export default function ProductsHomePage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <ProductsPage />
    </RoleGuard>
  )
}
