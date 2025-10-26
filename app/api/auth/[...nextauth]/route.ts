import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("No credentials provided.");
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          console.log("User not found for email:", credentials.email);
          return null;
        }
        console.log("Attempting to log in user:", user.email);
        console.log("Provided password:", credentials.password);
        console.log("Stored hashed password:", user.password);

        if (user && user.password && bcrypt.compareSync(credentials.password, user.password)) {
          console.log("Password comparison successful!");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        console.log("Password comparison failed for user:", user.email);
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback - Token before update:", token);
      console.log("JWT Callback - User:", user);
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      console.log("JWT Callback - Token after update:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Session before update:", session);
      console.log("Session Callback - Token:", token);
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      console.log("Session Callback - Session after update:", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  url: process.env.NEXTAUTH_URL,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };