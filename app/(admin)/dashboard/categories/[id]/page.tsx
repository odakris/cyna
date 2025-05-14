import { Metadata } from "next"
import { CategoryDetailsPage } from "@/components/Admin/Categories/Details/CategoryDetailsPage"
import { validateId } from "@/lib/utils/utils"

export const metadata: Metadata = {
  title: "Détails de la Catégorie | CYNA Backoffice",
  description: "Détails et gestion d'une catégorie CYNA spécifique",
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid category ID")
  }
  return <CategoryDetailsPage id={id.toString()} />
}
