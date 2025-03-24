import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Token et nouveau mot de passe requis" }, { status: 400 });
  }

  try {
    // Vérifier si le token existe et n'a pas expiré
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }, // Vérifie que le token n'a pas expiré
      },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
    }

    // Hacher le nouveau mot de passe
    //const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id_user: resetToken.id_user },
      data: { password: newPassword },
    });

    // Supprimer le token utilisé
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}