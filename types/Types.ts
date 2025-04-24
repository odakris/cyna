import { Product, Order, OrderItem, Address, Category } from "@prisma/client"
import { PrismaClient } from "@prisma/client"

export interface ProductWithImages extends Product {
  product_caroussel_images: { url: string; alt: string }[] // Add the related field
}

export interface CategoryWithProduct extends Category {
  products?: { id: number; name: string }[]
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
  id_product: number
  name: string
  description: string
  technical_specs: string
  unit_price: number
  discount_price?: number
  available: boolean
  priority_order: number
  created_at: string
  updated_at: string
  id_category: number
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

// Type pour les filtres actifs
export type ActiveFilters = {
  title: string | null
  description: string | null
  features: string | null
  minPrice: number | null
  maxPrice: number | null
  category: string | null
  onlyAvailable: boolean
}

// Type pour les options de tri
export type SortOptions = {
  price: "asc" | "desc"
  newness: "new" | "old"
  availability: "available" | "unavailable"
}

// Type pour les fonctions de mise à jour des filtres
export interface FilterHandlers {
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  setFeatures: (value: string) => void
  setPriceRange: (values: [number, number]) => void
  setPriceInput: (value: { min: string; max: string }) => void
  setSelectedCategory: (value: string) => void
  setOnlyAvailable: (value: boolean) => void
  handlePriceRangeChange: (values: number[]) => void
  handlePriceInputChange: (type: "min" | "max", value: string) => void
  handleSearch: (e: React.FormEvent) => void
  resetFilters: () => void
  removeFilter: (key: keyof ActiveFilters) => void
}

// Type pour les propriétés des composants
export interface FilterPanelProps {
  title: string
  description: string
  features: string
  priceRange: [number, number]
  priceInput: { min: string; max: string }
  selectedCategory: string
  onlyAvailable: boolean
  categories: Category[]
  handlers: FilterHandlers
}

export interface MobileFilterPanelProps extends FilterPanelProps {
  isFilterMenuOpen: boolean
  setIsFilterMenuOpen: (value: boolean) => void
}

export interface ActiveFiltersProps {
  activeFilters: ActiveFilters
  categories: Category[]
  removeFilter: (key: keyof ActiveFilters) => void
  resetFilters: () => void
  hasActiveFilters: () => boolean
}

export interface SortOptionsProps {
  sortOptions: SortOptions
  updateSort: (key: keyof SortOptions, value: string) => void
  productsCount: number
}

export interface AdvancedSearchProps {
  categories: Category[]
}
