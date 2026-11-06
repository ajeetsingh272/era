import "server-only";
import { getDb } from "../db";
import type { AdminUser } from "@/types";

interface UserRow { id: number; email: string; name: string; password_hash: string }

export const usersRepo = {
  findByEmail(email: string): (AdminUser & { passwordHash: string }) | null {
    const r = getDb().prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(email) as UserRow | undefined;
    return r ? { id: r.id, email: r.email, name: r.name, passwordHash: r.password_hash } : null;
  },

  getPasswordHash(id: number): string | null {
    const r = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(id) as { password_hash: string } | undefined;
    return r?.password_hash ?? null;
  },

  setPassword(id: number, hash: string) {
    getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, id);
  },

  create(email: string, name: string, hash: string): number {
    return Number(getDb().prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)").run(email, name, hash).lastInsertRowid);
  },

  count(): number {
    return (getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
  },
};

export const sessionsRepo = {
  create(tokenHash: string, userId: number, expiresAt: Date) {
    getDb().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash, userId, expiresAt.toISOString());
  },

  findUser(tokenHash: string): AdminUser | null {
    const r = getDb()
      .prepare(
        `SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(tokenHash, new Date().toISOString()) as AdminUser | undefined;
    return r ?? null;
  },

  delete(tokenHash: string) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
  },

  deleteForUserExcept(userId: number, keepTokenHash: string) {
    getDb().prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").run(userId, keepTokenHash);
  },

  purgeExpired() {
    getDb().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
  },
};
