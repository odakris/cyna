export type ProductType = {
  id_product?: number
  name: string
  description?: string
  technical_specs?: string
  unit_price: number
  available: boolean
  priority_order: number
  last_updated: Date | string
  id_category: number
  image: string
  stock: number
}
