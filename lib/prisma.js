// /lib/prisma.js
import { PrismaClient } from "@prisma/client"

// Utilisation d'une instance globale pour éviter les reconnexions multiples en développement
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ["query", "info", "warn", "error"], // Logs pour déboguer
    log: [], // Logs désactivés
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
