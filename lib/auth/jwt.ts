import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@/lib/db/schema";

/* Runtime-agnostic JWT helpers — shared by proxy.ts and server code. */

export const SESSION_COOKIE = "bp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  sub: string; // user id
  role: UserRole;
  v: number; // users.tokenVersion at sign-in
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set in production");
    }
    return new TextEncoder().encode("beautypeps-dev-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, v: payload.v })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      role: payload.role === "admin" ? "admin" : "customer",
      v: typeof payload.v === "number" ? payload.v : 0,
    };
  } catch {
    return null;
  }
}
