/**
 * Create or reset an admin account.
 *   npm run admin:create -- you@example.com "a-strong-password" ["Your Name"]
 * Run while the site is stopped or running – SQLite handles the lock.
 */
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const [email, password, name = "Administrator"] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error('Usage: npm run admin:create -- <email> <password (min 10 chars)> ["Name"]');
  process.exit(1);
}

const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "era.db");
if (!fs.existsSync(file)) {
  console.error(`Database not found at ${file}. Start the site once (npm run dev) so it is created, then re-run.`);
  process.exit(1);
}

// Same format as src/server/services/password.ts
const salt = randomBytes(16);
const hash = `scrypt$${salt.toString("base64")}$${scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("base64")}`;

const db = new DatabaseSync(file);
db.exec("PRAGMA busy_timeout = 5000");
db.prepare(
  `INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)
   ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, name = excluded.name`,
).run(email.toLowerCase(), name, hash);
db.prepare("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ?)").run(email.toLowerCase());
console.log(`Admin "${email}" saved. Sign in at /admin/login`);
