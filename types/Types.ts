import { Product } from "@prisma/client"

export interface ProductWithImages extends Product {
  product_caroussel_images: { url: string; alt: string }[] // Add the related field
}

export type CategoryType = {
  id_category: number
  priority_order: number
  name: string
  description: string
  image: string
  created_at: string
  updated_at: string
}

export type ProductType = {
  last_updated: string | number | Date
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

export type PasswordResetTokenType = {
  id: number
  token: string
  id_user: number
  expiresAt: Date
  createdAt: Date
}
