import { CategoryType } from "@/types/Types"

export async function getCategoryById(
  id: string
): Promise<CategoryType | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`
    )
    if (!response.ok) {
      const errorDetails = await response.text()
      throw new Error(
        `Error while fetching category: ${errorDetails || "Unknown error"}`
      )
    }
    return response.json()
  } catch (error) {
    console.error("Error while fetching category :", error)
    return null
  }
}
