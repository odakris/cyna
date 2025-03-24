import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  console.log("E-mail reçu:", email);

  if (!email) {
    console.log("E-mail manquant ou invalide");
    return NextResponse.json({ error: "L'e-mail est requis" }, { status: 400 });
  }

  try {
    console.log("Recherche de l'utilisateur...");
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log("Utilisateur trouvé:", user);

    if (!user) {
      console.log("Utilisateur non trouvé, renvoi d'une réponse générique");
      return NextResponse.json(
        { message: "Si l'e-mail existe, un lien de réinitialisation a été envoyé." },
        { status: 200 }
      );
    }

    console.log("Génération du token...");
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    console.log("Token généré:", token);

    console.log("Enregistrement du token dans la base de données...");
    const resetToken = await prisma.passwordResetToken.create({
      data: {
        token,
        id_user: user.id_user,
        expiresAt,
      },
    });
    console.log("Token enregistré:", resetToken);

    console.log("Création du lien de réinitialisation...");
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    console.log("Lien de réinitialisation:", resetLink);

    // Retourne le resetLink et l'e-mail au frontend
    return NextResponse.json(
      {
        message: "Lien de réinitialisation généré. L'e-mail sera envoyé depuis le frontend.",
        resetLink,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}