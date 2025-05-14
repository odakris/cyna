import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

declare module "next-auth" {
  interface Session {
    user: {
      id_user: number
      first_name: string
      last_name: string
      email: string
      role?: string
      isGuest?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id_user: number
    first_name: string
    last_name: string
    email: string
    role?: string
    isGuest?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_user: number
    first_name: string
    last_name: string
    email: string
    role?: string
    isGuest?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize - Credentials reçues:", credentials)

        if (!credentials?.email) {
          console.log("Authorize - Erreur: Email manquant")
          throw new Error("Email requis")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        console.log(
          "Authorize - Utilisateur trouvé:",
          user
            ? {
                id_user: user.id_user,
                email: user.email,
                role: user.role,
                isGuest: user.isGuest,
              }
            : null
        )

        if (!user) {
          console.log("Authorize - Erreur: Utilisateur non trouvé")
          throw new Error("Utilisateur non trouvé")
        }

        // Vérification que l'utilisateur est actif
        if (!user.active) {
          console.log("Authorize - Erreur: Compte utilisateur inactif")
          throw new Error("Compte inactif")
        }

        // Pour les utilisateurs invités, aucun mot de passe n'est requis
        if (user.isGuest) {
          console.log("[Authorize] Utilisateur invité autorisé:", {
            id_user: user.id_user,
            email: user.email,
            isGuest: user.isGuest,
          })
          return {
            id_user: user.id_user,
            email: user.email,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role: user.role,
            isGuest: user.isGuest,
          }
        }

        // Pour les utilisateurs normaux, vérifier le mot de passe
        if (!credentials.password || !user.password) {
          console.log("Authorize - Erreur: Mot de passe manquant ou non défini")
          throw new Error("Mot de passe requis")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        console.log("Authorize - Mot de passe valide:", isPasswordValid)

        if (!isPasswordValid) {
          console.log("Authorize - Erreur: Mot de passe incorrect")
          throw new Error("Mot de passe incorrect")
        }

        return {
          id_user: user.id_user,
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          role: user.role,
          isGuest: user.isGuest,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id_user = user.id_user
        token.email = user.email
        token.first_name = user.first_name
        token.last_name = user.last_name
        token.role = user.role
        token.isGuest = user.isGuest
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id_user = token.id_user
        session.user.email = token.email
        session.user.first_name = token.first_name
        session.user.last_name = token.last_name
        session.user.role = token.role
        session.user.isGuest = token.isGuest
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 heures pour les sessions, y compris invités
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
