import { Product } from "@prisma/client"

export interface ProductWithImages extends Product {
  product_caroussel_images: { url: string; alt: string }[] // Add the related field
}

export type CategoryType = {
  id_category: number
  name: string
  description?: string
  image: string
  created_at: string
  updated_at: string
}

export interface ProductType {
  id_product: number;
  name: string;
  description: string;
  technical_specs: string;
  unit_price: number;
  discount_price?: number;
  available: boolean;
  priority_order: number;
  created_at: string;
  updated_at: string;
  id_category: number;
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
