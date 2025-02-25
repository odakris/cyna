import { getCategories } from "../actions/categoryActions"
import SearchForm from "../../components/SearchForm"

export default async function Home() {
  const categories = await getCategories()

  return (
    <main className="p-6">
      <SearchForm categories={categories} />
    </main>
  )
}
