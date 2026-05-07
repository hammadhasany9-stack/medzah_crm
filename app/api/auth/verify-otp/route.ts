import { NextResponse } from "next/server";
import {
  emailToTenant,
  getFixedLoginOtp,
  normalizeEmail,
} from "@/lib/auth/constants";
import { SESSION_COOKIE, signSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { email, code } = body as { email?: unknown; code?: unknown };
  const emailStr = typeof email === "string" ? email : "";
  const tenant = emailToTenant(emailStr);
  if (!tenant) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const normalized = normalizeEmail(emailStr);
  const expected = getFixedLoginOtp(normalized);
  if (!expected || code.trim() !== expected) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const token = await signSession({ email: normalized, tenant });
  const res = NextResponse.json({ ok: true, tenant });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
