"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCategories() {
    try {
        return await prisma.categorie.findMany();
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
        return [];
    }
}
