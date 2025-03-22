import { getAllCategories } from "@/lib/services/category-service"
import { CategoryType } from "@/types/Types"

export default async function AdminCategoryHome() {
  const categories: CategoryType[] = await getAllCategories()

  return <div>CATEGORIES</div>
}
