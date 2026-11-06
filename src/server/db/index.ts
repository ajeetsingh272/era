import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { MIGRATIONS } from "./schema";
import { seed } from "./seed";

type Db = DatabaseSync;
const globalForDb = globalThis as unknown as { __eraDb?: Db };

function open(): Db {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "era.db");
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  // busy timeout first: every later statement (incl. the WAL switch) then waits for locks instead of failing.
  const db = new DatabaseSync(file, { timeout: 15000 });
  db.exec("PRAGMA busy_timeout = 15000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  migrate(db);
  return db;
}

const version = (db: Db) => (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;

function migrate(db: Db) {
  // Up to date (the normal case): no write lock, so parallel build workers/servers don't queue up.
  if (version(db) >= MIGRATIONS.length) return;
  // IMMEDIATE lock so parallel build workers don't race on first boot; re-check once we hold it.
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = version(db);
    for (let v = current; v < MIGRATIONS.length; v++) db.exec(MIGRATIONS[v]);
    if (current < MIGRATIONS.length) db.exec(`PRAGMA user_version = ${MIGRATIONS.length}`);
    seed(db);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

/** Shared connection (cached across hot reloads in dev). */
export function getDb(): Db {
  if (!globalForDb.__eraDb) globalForDb.__eraDb = open();
  return globalForDb.__eraDb;
}

/** Run `fn` inside a transaction. */
export function tx<T>(fn: (db: Db) => T): T {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const out = fn(db);
    db.exec("COMMIT");
    return out;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

/** Test helper: drop the cached connection so the next getDb() starts fresh. */
export function resetDbForTests() {
  globalForDb.__eraDb?.close();
  globalForDb.__eraDb = undefined;
}
