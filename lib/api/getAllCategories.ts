import { CategoryType } from "@/types/Types"

export async function getAllCategories(): Promise<CategoryType[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
    )
    if (!response.ok) {
      const errorDetails = await response.text()
      throw new Error(
        `Error while fetching categories: ${errorDetails || "Unknown error"}`
      )
    }
    return response.json()
  } catch (error) {
    console.error("Error while fetching categories :", error)
    return []
  }
}
