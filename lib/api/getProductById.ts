import { ProductType } from "@/types/Types"

export async function getProducById(id: string): Promise<ProductType | null> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/products/${id}`
    )
    if (!response.ok) {
      const errorDetails = await response.text()
      throw new Error(
        `Error while fetching product: ${errorDetails || "Unknown error"}`
      )
    }
    return response.json()
  } catch (error) {
    console.error("Error while fetching product :", error)
    return null
  }
}
