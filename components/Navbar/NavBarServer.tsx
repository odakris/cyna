// app/components/Navbar/NavbarServer.tsx
import { getAllCategories } from "@/lib/services/categoryService"
import NavbarClient from "./NavbarClient"
import { CategoryType } from "@/types/Types"

export default async function NavbarServer() {
  const categories: CategoryType[] = await getAllCategories()

  return <NavbarClient categories={categories} />
}
