"use server";

import { redirect } from "next/navigation";
import { fieldErrors, formObject, loginSchema, passwordChangeSchema, type FormState } from "@/lib/validation";
import { usersRepo } from "../repositories/users";
import { endSession, requireAdmin, revokeOtherSessions, startSession } from "../services/auth";
import { hashPassword, verifyPassword } from "../services/password";
import { clear, clientIp, hit } from "../services/rate-limit";

const DUMMY_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const key = `login:${await clientIp()}`;
  const gate = hit(key, 8, 15 * 60 * 1000);
  if (!gate.allowed) return { message: `Too many attempts. Try again in ${Math.ceil(gate.retryAfterMs / 60000)} min.` };

  const user = usersRepo.findByEmail(parsed.data.email);
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { message: "Invalid email or password." };

  clear(key);
  await startSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = passwordChangeSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const current = usersRepo.getPasswordHash(admin.id);
  if (!current || !(await verifyPassword(parsed.data.current, current))) return { errors: { current: "Current password is incorrect" } };

  usersRepo.setPassword(admin.id, await hashPassword(parsed.data.next));
  await revokeOtherSessions(admin.id);
  return { ok: true, message: "Password updated. Other devices have been signed out." };
}
