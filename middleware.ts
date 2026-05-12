import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AMANDA_ALLOWED_SEGMENTS,
  CRM_ROOT_SEGMENTS,
} from "@/lib/auth/constants";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.NODE_ENV === "development" && pathname.startsWith("/_next")) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, must-revalidate, max-age=0");
    return res;
  }

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image")
  ) {
    return NextResponse.next();
  }

  if (pathname.match(/\.(?:ico|svg|png|jpg|jpeg|gif|webp)$/)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  const session = token ? await verifySession(token) : null;

  if (pathname === "/login") {
    if (session) {
      const dest =
        session.tenant === "amanda" ? "/amanda/dashboard" : "/kevin/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const dest =
      session.tenant === "amanda" ? "/amanda/dashboard" : "/kevin/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (pathname.startsWith("/crm-onboarding")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];

  if (first === "kevin" || first === "amanda") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.tenant !== first) {
      const dest =
        session.tenant === "amanda" ? "/amanda/dashboard" : "/kevin/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    if (first === "amanda") {
      const seg = parts[1];
      if (!seg || !AMANDA_ALLOWED_SEGMENTS.has(seg)) {
        return NextResponse.redirect(new URL("/amanda/dashboard", request.url));
      }
      const routeKey = parts.join("/");
      if (
        routeKey === "amanda/customer-intake" ||
        routeKey === "amanda/customer-intake/create"
      ) {
        return NextResponse.redirect(
          new URL("/amanda/customer-intake/approval", request.url)
        );
      }
      if (
        routeKey === "amanda/contracts" ||
        routeKey === "amanda/contracts/create"
      ) {
        return NextResponse.redirect(
          new URL("/amanda/contracts/approval", request.url)
        );
      }
    }
    return NextResponse.next();
  }

  if (session && first && CRM_ROOT_SEGMENTS.has(first)) {
    return NextResponse.redirect(
      new URL(`/${session.tenant}${pathname}`, request.url)
    );
  }

  if (!session && first && CRM_ROOT_SEGMENTS.has(first)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\\\.(?:ico|svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
