import passwordResetRepository from "@/lib/repositories/passwordResetRepository";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { PasswordResetTokenType } from "../../types/Types";

export const requestPasswordReset = async (email: string): Promise<{ resetLink: string }> => {
  // Vérifier si l'utilisateur existe
  const user = await passwordResetRepository.findUserByEmail(email);
  if (!user) {
    // Ne pas révéler si l'utilisateur existe ou non pour des raisons de sécurité
    throw new Error("Si l'e-mail existe, un lien de réinitialisation sera généré.");
  }

  // Générer un token unique
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Expire dans 1 heure

  // Enregistrer le token dans la base de données
  await passwordResetRepository.createPasswordResetToken({
    token,
    id_user: user.id_user,
    expiresAt,
  });

  // Générer le lien de réinitialisation
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  // Renvoyer le resetLink au lieu d'envoyer l'e-mail
  return { resetLink };
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  // Vérifier si le token est valide et non expiré
  const resetToken: PasswordResetTokenType | null =
    await passwordResetRepository.findPasswordResetToken(token);
  if (!resetToken) {
    throw new Error("Token invalide ou expiré");
  }

  // Hacher le nouveau mot de passe
  //const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Mettre à jour le mot de passe de l'utilisateur
  await passwordResetRepository.updateUserPassword(
    resetToken.id_user,
    newPassword
  );

  // Supprimer le token utilisé
  await passwordResetRepository.deletePasswordResetToken(resetToken.id);
};

const passwordResetService = {
  requestPasswordReset,
  resetPassword,
};

export default passwordResetService;