// app/components/Navbar/NavbarServer.tsx
import { getAllCategories } from "@/lib/services/category-service"
import NavbarClient from "./NavbarClient"
import { Category } from "@prisma/client"

export default async function NavbarServer() {
  const categories: Category[] = (await getAllCategories()).filter(
    cat => cat.active
  )

  return <NavbarClient categories={categories} />
}
