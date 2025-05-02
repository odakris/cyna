import { Metadata } from "next"
import { CreateCategoryPage } from "@/components/Admin/Categories/Create/CreateCategoryPage"

export const metadata: Metadata = {
  title: "Créer une Catégorie | CYNA Backoffice",
  description: "Création d'une nouvelle catégorie dans le catalogue CYNA",
}

export default function NewCategoryPage() {
  return <CreateCategoryPage />
}
