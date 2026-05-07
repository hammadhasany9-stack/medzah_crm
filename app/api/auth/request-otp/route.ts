import { NextResponse } from "next/server";
import {
  getFixedLoginOtp,
  isAllowedLoginEmail,
  normalizeEmail,
} from "@/lib/auth/constants";
import { sendLoginOtp } from "@/lib/auth/otp-transport";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email ?? "")
      : "";
  if (!email || !isAllowedLoginEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const normalized = normalizeEmail(email);
  const code = getFixedLoginOtp(normalized);
  if (!code) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  await sendLoginOtp(normalized, code);
  return NextResponse.json({ ok: true });
}
