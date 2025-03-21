export type CategoryType = {
  id_category: number
  name: string
  description?: string
  image: string
  created_at: string
  updated_at: string
}

export type ProductType = {
  id_product: number
  name: string
  description: string
  technical_specs: string
  unit_price: number
  stock: number
  id_category: number
  image: string
  priority_order: number
  available: boolean
  created_at: string
  updated_at: string
}

export enum Role {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
}
