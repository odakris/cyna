// lib/permissions.ts
import { Role } from "@prisma/client"

export type Permission =
  | "dashboard:view"
  | "products:view"
  | "products:create"
  | "products:edit"
  | "products:delete"
  | "categories:view"
  | "categories:create"
  | "categories:edit"
  | "categories:delete"
  | "conversations:view"
  | "conversations:edit"
  | "conversations:delete"
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "orders:view"
  | "orders:create"
  | "orders:edit"
  | "orders:delete"
  | "hero-carousel:view"
  | "hero-carousel:create"
  | "hero-carousel:edit"
  | "hero-carousel:delete"
  | "main-message:view"
  | "main-message:create"
  | "main-message:edit"
  | "main-message:delete"
  | "contact:view"
  | "contact:respond"
  | "contact:delete"
  | "profile:edit"

// Définition des permissions par rôle
export const rolePermissions: Record<Role, Permission[]> = {
  CUSTOMER: ["profile:edit", "orders:view", "orders:create", "profile:edit"],
  MANAGER: [
    "dashboard:view",
    "products:view",
    "products:create",
    "products:edit",
    "categories:view",
    "categories:create",
    "categories:edit",
    "users:view",
    "orders:view",
    "orders:create",
    "orders:edit",
    "hero-carousel:view",
    "hero-carousel:create",
    "hero-carousel:edit",
    "hero-carousel:delete",
    "main-message:view",
    "main-message:create",
    "main-message:edit",
    "main-message:delete",
    "contact:view",
    "contact:respond",
    "contact:delete",
    "conversations:view",
    "conversations:edit",
    "conversations:delete",
    "profile:edit",
  ],
  ADMIN: [
    "dashboard:view",
    "products:view",
    "products:create",
    "products:edit",
    "products:delete",
    "categories:view",
    "categories:create",
    "categories:edit",
    "categories:delete",
    "users:view",
    "users:create",
    "users:edit",
    "orders:view",
    "orders:create",
    "orders:edit",
    "orders:delete",
    "hero-carousel:view",
    "hero-carousel:create",
    "hero-carousel:edit",
    "hero-carousel:delete",
    "main-message:view",
    "main-message:create",
    "main-message:edit",
    "main-message:delete",
    "contact:view",
    "contact:respond",
    "contact:delete",
    "conversations:view",
    "conversations:edit",
    "conversations:delete",
    "profile:edit",
  ],
  SUPER_ADMIN: [
    "dashboard:view",
    "products:view",
    "products:create",
    "products:edit",
    "products:delete",
    "categories:view",
    "categories:create",
    "categories:edit",
    "categories:delete",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "orders:view",
    "orders:create",
    "orders:edit",
    "orders:delete",
    "hero-carousel:view",
    "hero-carousel:create",
    "hero-carousel:edit",
    "hero-carousel:delete",
    "main-message:view",
    "main-message:create",
    "main-message:edit",
    "main-message:delete",
    "contact:view",
    "contact:respond",
    "contact:delete",
    "conversations:view",
    "conversations:edit",
    "conversations:delete",
    "profile:edit",
  ],
}

// Fonction utilitaire pour vérifier si un rôle possède une permission
export const hasPermission = (
  role: Role | undefined,
  permission: Permission
): boolean => {
  if (!role) return false
  return rolePermissions[role].includes(permission)
}
