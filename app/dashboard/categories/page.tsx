import { getAllCategories } from "@/lib/services/categoryService"
import { CategoryType } from "@/types/Types"

export default async function AdminCategoryHome() {
  const categories: CategoryType[] = await getAllCategories()

  return <div>CATEGORIES</div>
}
