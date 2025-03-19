// app/components/Navbar/NavbarServer.tsx
import { getCategories } from "@/lib/api/getCategories"
import NavbarClient from "./NavbarClient"
import { CategoryType } from "@/types/Types"

export default async function NavbarServer() {
  const categories: CategoryType[] = await getCategories()

  return <NavbarClient categories={categories} />
}
