import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { registerApiSchema } from "@/lib/validations/register-schema"; // Utiliser registerApiSchema
import Stripe from "stripe";  // Import Stripe SDK

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
});

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

        // Étape 2 : Créer un client Stripe
        const stripeCustomer = await stripe.customers.create({
            email, // Utiliser l'email de l'utilisateur
            name: `${firstName} ${lastName}`, // Nom complet
        });

        // Stocker l'ID du client Stripe en base de données
        await prisma.user.update({
            where: { id_user: user.id_user },
            data: {
                stripeCustomerId: stripeCustomer.id, // Ajouter l'ID du client Stripe à l'utilisateur
            },
        });

        return NextResponse.json(
            { message: "Utilisateur et client Stripe créés avec succès", user },
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