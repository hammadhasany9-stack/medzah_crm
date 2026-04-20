import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Ensures dev clients never cache `/_next/*` (JS/CSS chunks). Stale cache after a
 * `.next` rebuild is the usual cause of "everything looks like plain HTML" in dev.
 * No effect in production (NODE_ENV === "production").
 */
export function middleware(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.next();
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store, must-revalidate, max-age=0");
  return res;
}

export const config = {
  matcher: "/_next/:path*",
};
