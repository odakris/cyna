import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { registerApiSchema } from "@/lib/validations/register-schema"; // Utiliser registerApiSchema

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Vérifier que le corps de la requête est valide
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Le corps de la requête est invalide ou mal formé" },
        { status: 400 }
      );
    }

    // Valider les données avec Zod
    const result = registerApiSchema.safeParse(body); // Utiliser registerApiSchema
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = result.data;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un utilisateur avec tous les champs requis
    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER,
      },
    });

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", user },
      { status: 201 }
    );
  } catch (error) {
    // Gestion sécurisée des erreurs
    if (error instanceof Error) {
      console.error("Erreur lors de l'inscription:", error.message);
    } else {
      console.error("Erreur inconnue lors de l'inscription:", error);
    }
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}