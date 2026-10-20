"use server";

import { randomBytes } from "node:crypto";
import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orders, passwordResets, users } from "@/lib/db/schema";
import { passwordResetEmail, sendEmail, welcomeEmail } from "@/lib/email";
import { authDestination, getValidPasswordReset, hashResetToken } from "@/lib/queries/account";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { fieldErrors, safeRedirectPath, type FormState } from "@/lib/utils";

/** Form state for auth forms — echoes non-secret values back so fields survive a failed submit. */
export type AuthFormState = FormState & { values?: Record<string, string> };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const normaliseEmail = (email: string) => email.trim().toLowerCase();

const PASSWORD_MIN = 8;
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(200, "That password is too long.");

async function findUserByEmail(email: string) {
  return db.query.users.findFirst({ where: sql`lower(${users.email}) = ${normaliseEmail(email)}` });
}

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normaliseEmail(str(formData, "email"));
  const next = str(formData, "next");
  const values = { email };

  const parsed = loginSchema.safeParse({ email, password: String(formData.get("password") ?? "") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), values };

  const limitKey = `login:${await clientIp()}:${email}`;
  const limit = rateLimit(limitKey, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return {
      ok: false,
      message: `Too many sign-in attempts. Please try again in ${Math.ceil(limit.retryAfter / 60)} minutes.`,
      values,
    };
  }

  const user = await findUserByEmail(email);
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { ok: false, message: "Email or password is incorrect.", values };
  if (user.disabled) {
    return { ok: false, message: "This account has been disabled. Please contact us for help.", values };
  }

  resetRateLimit(limitKey);
  await createSession(user);
  redirect(authDestination(user.role, next));
}

/* ------------------------------------------------------------------ */
/* Register                                                            */
/* ------------------------------------------------------------------ */

const registerSchema = z
  .object({
    firstName: z.string().min(1, "Enter your first name.").max(60),
    lastName: z.string().min(1, "Enter your last name.").max(60),
    email: z.email("Enter a valid email address.").max(200),
    password: passwordSchema,
    confirm: z.string(),
    marketing: z.boolean(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const input = {
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    email: normaliseEmail(str(formData, "email")),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
    marketing: formData.get("marketing") === "on",
  };
  const next = str(formData, "next");
  const values = { firstName: input.firstName, lastName: input.lastName, email: input.email, marketing: input.marketing ? "on" : "" };

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), values };

  const limit = rateLimit(`register:${await clientIp()}`, 10, 60 * 60 * 1000);
  if (!limit.ok) return { ok: false, message: "Too many sign-ups from this network. Please try again later.", values };

  if (await findUserByEmail(input.email)) {
    return {
      ok: false,
      errors: { email: "An account with this email already exists — sign in instead." },
      values,
    };
  }

  const [user] = await db
    .insert(users)
    .values({
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      marketingOptIn: parsed.data.marketing,
      role: "customer",
    })
    .returning();

  // Attach any earlier guest checkouts made with this email.
  await db
    .update(orders)
    .set({ userId: user.id })
    .where(and(isNull(orders.userId), sql`lower(${orders.email}) = ${user.email}`));

  try {
    const mail = welcomeEmail(user.firstName);
    await sendEmail({ to: user.email, ...mail });
  } catch (e) {
    console.error("[register] welcome email failed", e);
  }

  await createSession(user);
  redirect(next ? authDestination(user.role, next) : "/account?welcome=1");
}

/* ------------------------------------------------------------------ */
/* Forgot / reset password                                             */
/* ------------------------------------------------------------------ */

const FORGOT_OK =
  "If an account exists for that email, we've sent a link to reset your password. It's valid for 1 hour.";

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function forgotPasswordAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normaliseEmail(str(formData, "email"));
  const parsed = z.email("Enter a valid email address.").safeParse(email);
  if (!parsed.success) return { ok: false, errors: { email: parsed.error.issues[0].message }, values: { email } };

  const ip = await clientIp();
  const byIp = rateLimit(`forgot:ip:${ip}`, 10, 15 * 60 * 1000);
  const byEmail = rateLimit(`forgot:email:${email}`, 3, 15 * 60 * 1000);
  if (!byIp.ok) return { ok: false, message: "Too many requests. Please try again shortly.", values: { email } };
  // Silently skip sending when one address is being hammered, but keep the response identical.
  if (!byEmail.ok) return { ok: true, message: FORGOT_OK };

  const user = await findUserByEmail(email);
  if (user && !user.disabled) {
    const token = randomBytes(32).toString("base64url");
    await db.insert(passwordResets).values({
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const resetUrl = `${await siteOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await sendEmail({ to: user.email, ...passwordResetEmail(resetUrl) });
    } catch (e) {
      console.error("[forgot-password] email failed", e);
    }
  }

  return { ok: true, message: FORGOT_OK };
}

const resetSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function resetPasswordAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const token = str(formData, "token");
  const parsed = resetSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues) };

  const reset = await getValidPasswordReset(token);
  if (!reset) {
    return { ok: false, message: "This reset link is invalid or has expired. Please request a new one." };
  }

  const [user] = await db
    .update(users)
    .set({
      passwordHash: await hashPassword(parsed.data.password),
      tokenVersion: sql`${users.tokenVersion} + 1`,
    })
    .where(eq(users.id, reset.userId))
    .returning();
  if (!user) return { ok: false, message: "This reset link is invalid or has expired. Please request a new one." };

  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, reset.id));
  await db
    .delete(passwordResets)
    .where(and(eq(passwordResets.userId, user.id), ne(passwordResets.id, reset.id)));

  if (user.disabled) {
    return { ok: true, message: "Your password has been updated. This account is disabled — please contact us." };
  }

  await createSession(user);
  redirect(user.role === "admin" ? "/admin" : safeRedirectPath("/account?reset=1"));
}
