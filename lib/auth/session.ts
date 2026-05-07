import { SignJWT, jwtVerify } from "jose";
import type { Tenant } from "./constants";

export const SESSION_COOKIE = "crm_session";

function getSecret(): Uint8Array {
  const s = process.env.CRM_SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("CRM_SESSION_SECRET is required in production");
  }
  return new TextEncoder().encode(
    s ?? "dev-crm-session-secret-change-in-production"
  );
}

export type SessionPayload = {
  email: string;
  tenant: Tenant;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, tenant: payload.tenant })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const email = String(payload.email ?? "");
    const tenant = payload.tenant;
    if (tenant !== "kevin" && tenant !== "amanda") {
      return null;
    }
    return { email, tenant };
  } catch {
    return null;
  }
}
