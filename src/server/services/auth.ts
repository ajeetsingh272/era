import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { sessionsRepo } from "../repositories/users";
import type { AdminUser } from "@/types";

export const SESSION_COOKIE = "era_admin";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Create a DB-backed session and set an httpOnly cookie. Only the token hash is stored. */
export async function startSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + TTL_MS);
  sessionsRepo.purgeExpired();
  sessionsRepo.create(sha256(token), userId, expires);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) sessionsRepo.delete(sha256(token));
  jar.delete(SESSION_COOKIE);
}

/** Current admin for this request (memoised per request), or null. */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? sessionsRepo.findUser(sha256(token)) : null;
});

/** Guard for admin pages and server actions. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

/** Sign out every other device for this user (after a password change). */
export async function revokeOtherSessions(userId: number) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) sessionsRepo.deleteForUserExcept(userId, sha256(token));
}
