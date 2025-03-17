import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

// Initialisation de PrismaClient
const prisma = new PrismaClient()

// Étendre les types pour inclure le rôle
declare module "next-auth" {
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

// Configuration des options de NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize - Credentials:", credentials)

        // Vérifier que les credentials existent
        if (!credentials?.email || !credentials?.password) {
          console.log("Authorize - Échec: email ou mot de passe manquant")
          return null
        }

        try {
          // Rechercher le client dans la base de données
          const client = await prisma.client.findUnique({
            where: { email: credentials.email },
          })

          if (!client) {
            console.log("Authorize - Échec: utilisateur non trouvé")
            return null
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            client.password
          )

          if (!isPasswordValid) {
            console.log("Authorize - Échec: mot de passe incorrect")
            return null
          }

          // Déterminer le rôle (ajustez selon votre logique)
          // Ici, on suppose que seuls certains utilisateurs sont admins
          const role = client.email === "admin@example.com" ? "admin" : "user" // À ajuster selon votre base de données

          const user = {
            id: client.id_client.toString(),
            name: `${client.first_name} ${client.last_name}`,
            email: client.email,
            role, // Ajouter le rôle
          }

          console.log("Authorize - Utilisateur autorisé:", user)
          return user
        } catch (error) {
          console.error("Authorize - Erreur:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      console.log("JWT callback - Token avant:", token, "User:", user)
      if (user) {
        token.role = user.role
      }
      console.log("JWT callback - Token après:", token)
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log("Session callback - Session avant:", session, "Token:", token)
      if (session.user && token.role) {
        session.user.role = token.role
      }
      console.log("Session callback - Session après:", session)
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("Redirect callback - URL:", url, "BaseUrl:", baseUrl)
      return `${baseUrl}/admin/dashboard`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt" as const,
  },
}

// Gestionnaire NextAuth
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
