import { ProductType } from "@/types/Types"

export async function getAllProducts(): Promise<ProductType[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/products`)
    if (!response.ok) {
      const errorDetails = await response.text()
      throw new Error(
        `Error while fetching products: ${errorDetails || "Unknown error"}`
      )
    }
    return response.json()
  } catch (error) {
    console.error("Error while fetching products :", error)
    return []
  }
}
