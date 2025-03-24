import { NextRequest, NextResponse } from "next/server";
import passwordResetService from "@/lib/services/passwordResetService";

export const requestPasswordReset = async (
  request: NextRequest
): Promise<NextResponse> => {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "L'e-mail est requis" },
        { status: 400 }
      );
    }

    const { resetLink } = await passwordResetService.requestPasswordReset(email);
    return NextResponse.json(
      { resetLink, message: "Lien de réinitialisation généré avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    const message =
      error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export const resetPassword = async (
  request: NextRequest
): Promise<NextResponse> => {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token et nouveau mot de passe requis" },
        { status: 400 }
      );
    }

    await passwordResetService.resetPassword(token, newPassword);
    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    const message =
      error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

const passwordResetController = {
  requestPasswordReset,
  resetPassword,
};

export default passwordResetController;