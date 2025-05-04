import { getCategories } from "../actions/categoryActions"
import AdvancedSearch from "@/components/AdvancedSearch/AdvancedSearch"

export default async function SearchPage() {
  const categories = await getCategories()

  return (
    <>
      <AdvancedSearch categories={categories} />
    </>
  )
}
