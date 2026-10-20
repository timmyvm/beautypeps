import "server-only";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSessionToken, verifySessionToken } from "./jwt";

export type SessionUser = Omit<User, "passwordHash">;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Sign the user in by setting the session cookie. Call from a Server Action or Route Handler. */
export async function createSession(user: Pick<User, "id" | "role" | "tokenVersion">) {
  const token = await signSessionToken({ sub: user.id, role: user.role, v: user.tokenVersion });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** The signed-in user (or null). Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.sub) });
  if (!user || user.disabled || user.tokenVersion !== session.v) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
});

/** For customer pages: redirects to /login?next=... when signed out. */
export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** For admin pages and admin server actions. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") notFound();
  return user;
}
