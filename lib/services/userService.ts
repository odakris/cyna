import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

// Fonction pour mettre à jour les informations personnelles de l'utilisateur
export const updateUserInfo = async (userId: string, { name, email, password, newPassword }: { name: string, email: string, password: string, newPassword: string }) => {
    // Vérifie si le mot de passe actuel est correct
    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        throw new Error("Utilisateur introuvable")
    }

    // Vérifie si le mot de passe actuel est correct
    if (password && !bcrypt.compareSync(password, user.password)) {
        throw new Error("Le mot de passe actuel est incorrect")
    }

    // Si un nouveau mot de passe est fourni, on le hache
    let hashedPassword = user.password
    if (newPassword) {
        const salt = bcrypt.genSaltSync(10)
        hashedPassword = bcrypt.hashSync(newPassword, salt)
    }

    try {
        // Met à jour les informations de l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                password: hashedPassword, // Si un nouveau mot de passe est fourni, il est mis à jour
            },
        })

        return updatedUser
    } catch (error) {
        throw new Error("Erreur lors de la mise à jour des informations de l'utilisateur")
    }
}
