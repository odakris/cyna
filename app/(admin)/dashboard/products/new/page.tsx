import { Metadata } from "next"
import { CreateProductPage } from "@/components/Admin/Products/Create/CreateProductPage"

export const metadata: Metadata = {
  title: "Créer un Produit | CYNA Backoffice",
  description: "Création d'un nouveau produit dans le catalogue CYNA",
}

export default function NewProductPage() {
  return <CreateProductPage />
}
