// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName: string
      lastName: string
      role?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    firstName: string
    lastName: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName: string
    lastName: string
    role?: string
  }
}
