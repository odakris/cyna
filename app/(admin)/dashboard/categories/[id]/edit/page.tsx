import { Metadata } from "next"
import { EditCategoryPage } from "@/components/Admin/Categories/Edit/EditCategoryPage"
import { validateId } from "@/lib/utils/utils"

export const metadata: Metadata = {
  title: "Modifier la Catégorie | CYNA Backoffice",
  description: "Édition des informations d'une catégorie CYNA",
}

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid category ID")
  }
  return <EditCategoryPage id={id.toString()} />
}
