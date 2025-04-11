import { Product, Order, OrderItem, Address } from "@prisma/client"
import { PrismaClient } from "@prisma/client"

export interface ProductWithImages extends Product {
  product_caroussel_images: { url: string; alt: string }[] // Add the related field
}

export interface OrderWithItems extends Order {
  user: {
    id_user: number
    first_name: string
    last_name: string
    email: string
  }
  order_items: (OrderItem & { product: ProductWithImages })[]
  address: Address
}

// Type pour le client de transaction
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

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
