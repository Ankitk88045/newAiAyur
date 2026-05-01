import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that don't need auth
  const publicPaths = [
    "/auth/login",
    "/api/auth",
    "/api/subscription/webhook",
    "/_next",
    "/favicon.ico",
    "/icons",
  ];

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return intlMiddleware(req);
  }

  // Admin guard
  if (pathname.startsWith("/admin")) {
    return (authMiddleware as any)(req);
  }

  // Dashboard guard
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat")
  ) {
    return (authMiddleware as any)(req);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
