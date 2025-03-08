// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ne pas rediriger si l'utilisateur est déjà sur /admin/login
  if (pathname === "/admin/login") {
    console.log("Middleware - Accès à /admin/login, pas de redirection");
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Middleware - Chemin:", pathname, "Token:", token);

  if (!token || token.role !== "admin") {
    console.log("Middleware - Redirection vers /admin/login");
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  console.log("Middleware - Accès autorisé à", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};