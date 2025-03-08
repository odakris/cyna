// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize - Credentials:", credentials);
        if (
          credentials?.email === "test@example.com" &&
          credentials?.password === "password123"
        ) {
          const user = {
            id: "1",
            name: "Admin User",
            email: credentials.email,
            role: "admin",
          };
          console.log("Authorize - User autorisé:", user);
          return user;
        }
        console.log("Authorize - Échec: utilisateur non trouvé");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - Token avant:", token, "User:", user);
      if (user) token.role = user.role;
      console.log("JWT callback - Token après:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - Session avant:", session, "Token:", token);
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      console.log("Session callback - Session après:", session);
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - URL:", url, "BaseUrl:", baseUrl);
      return `${baseUrl}/admin/dashboard`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };