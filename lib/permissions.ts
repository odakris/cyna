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
    CUSTOMER: ["profile:edit"],
    MANAGER: [
        "dashboard:view",
        "products:view",
        "categories:view",
        "orders:view",
        "contact:view",
        "contact:respond",
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
        "users:edit",
        "orders:view",
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
