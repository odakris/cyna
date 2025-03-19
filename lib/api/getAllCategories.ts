import { CategoryType } from "@/types/Types"

export async function getAllCategories(): Promise<CategoryType[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/categories`, {
      next: { revalidate: 3600 }, // Cache response for 1 hour - Improve performance
    })
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des catégories")
    }
    return response.json()
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error)
    return []
  }
}
