import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { Role } from "./types/Types"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If user is authenticated
  if (token) {
    // Redirect authenticated users away from /auth
    if (pathname === "/auth") {
      const redirectUrl = token.role === Role.ADMIN ? "/dashboard" : "/"
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    // Protect /admin routes for non-admins
    if (pathname.startsWith("/dashboard") && token.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  } else {
    // Redirect unauthenticated users trying to access protected routes
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/auth", "/dashboard/:path*"], // Apply to /auth and /admin routes
}
