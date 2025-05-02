import { Metadata } from "next"
import { ProductDetailsPage } from "@/components/Admin/Products/Details/ProductDetailsPage"
import { validateId } from "@/lib/utils/utils"

export const metadata: Metadata = {
  title: "Détails du Produit | CYNA Backoffice",
  description: "Détails et gestion d'un produit CYNA spécifique",
}

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid product ID")
  }
  return <ProductDetailsPage id={id.toString()} />
}
