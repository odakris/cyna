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
    } & DefaultSession["user"]
  }

  interface User {
    id_user: number
    first_name: string
    last_name: string
    email: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_user: number
    first_name: string
    last_name: string
    email: string
    role?: string
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

        if (!credentials?.email || !credentials?.password) {
          console.log("Authorize - Erreur: Email ou mot de passe manquant")
          throw new Error("Email et mot de passe requis")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        console.log(
          "Authorize - Utilisateur trouvé:",
          user
            ? { id_user: user.id_user, email: user.email, role: user.role }
            : null
        )

        if (!user || !user.password) {
          console.log(
            "Authorize - Erreur: Utilisateur non trouvé ou sans mot de passe"
          )
          throw new Error("Utilisateur non trouvé")
        }

        // Vérification que l'utilisateur est actif
        if (!user.active) {
          console.log("Authorize - Erreur: Compte utilisateur inactif")
          throw new Error("Compte inactif")
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
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
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
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
