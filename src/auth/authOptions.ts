// src/auth/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for session handling
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        console.log("JWT Token: ", token); // Debug
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session?.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        console.log("Session Data: ", session); // Debug
      }
      return session;
    },
  },
};
