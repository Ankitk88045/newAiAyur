// lib/auth.ts
import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role as Role;

        // Get or create subscription
        let subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        });

        if (!subscription) {
          subscription = await prisma.subscription.create({
            data: { userId: user.id, plan: "FREE", status: "ACTIVE" },
          });
        }

        (session.user as any).plan = subscription.plan;
        (session.user as any).language =
          (user as any).language || "en";
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Auto-assign admin role if email matches env
        if (user.email === process.env.ADMIN_EMAIL) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { role: "ADMIN" },
          }).catch(() => {}); // may not exist yet on first sign in
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user as any).role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

// Extend Next-Auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      plan: string;
      language: string;
    };
  }
}
