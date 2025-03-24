import { prisma } from "@/lib/prisma";
import { PasswordResetTokenType } from "../../types/Types";

// Remplacez "PasswordResetTokenType" par "passwordResetToken" dans les appels Prisma
export const createPasswordResetToken = async (data: {
  token: string;
  id_user: number;
  expiresAt: Date;
}): Promise<PasswordResetTokenType> => {
  return prisma.passwordResetToken.create({ data });
};

export const findPasswordResetToken = async (
  token: string
): Promise<PasswordResetTokenType | null> => {
  return prisma.passwordResetToken.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
  });
};

export const deletePasswordResetToken = async (id: number): Promise<void> => {
  await prisma.passwordResetToken.delete({ where: { id } });
};

export const findUserByEmail = async (
  email: string
): Promise<{ id_user: number; email: string } | null> => {
  return prisma.user.findUnique({
    where: { email },
    select: { id_user: true, email: true },
  });
};

export const updateUserPassword = async (
  id_user: number,
  hashedPassword: string
): Promise<void> => {
  await prisma.user.update({
    where: { id_user },
    data: { password: hashedPassword },
  });
};

const passwordResetRepository = {
  createPasswordResetToken,
  findPasswordResetToken,
  deletePasswordResetToken,
  findUserByEmail,
  updateUserPassword,
};

export default passwordResetRepository;