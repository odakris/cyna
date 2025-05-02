import { Metadata } from "next"
import { EditProductPage } from "@/components/Admin/Products/Edit/EditProductPage"
import { validateId } from "../../../../../../lib/utils/utils"

export const metadata: Metadata = {
  title: "Modifier le Produit | CYNA Backoffice",
  description: "Édition des informations d'un produit CYNA",
}

export default async function EditPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid product ID")
  }
  return <EditProductPage id={id.toString()} />
}
