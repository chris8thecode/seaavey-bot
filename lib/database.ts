import { Database } from "bun:sqlite";

const db = new Database("data.db");

db.run("PRAGMA journal_mode = WAL");
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    jid TEXT PRIMARY KEY,
    hits INTEGER DEFAULT 0,
    banned INTEGER DEFAULT 0,
    lastChat INTEGER DEFAULT 0
  )
`);

// migrate: add lastChat column if missing
try {
  db.run("ALTER TABLE users ADD COLUMN lastChat INTEGER DEFAULT 0");
} catch {}

export function getUser(jid: string) {
  return db.query("SELECT * FROM users WHERE jid = ?").get(jid) as {
    jid: string;
    hits: number;
    banned: number;
    lastChat: number;
  } | null;
}

export function addHit(jid: string) {
  db.run(
    "INSERT INTO users (jid, hits, lastChat) VALUES (?, 1, ?) ON CONFLICT(jid) DO UPDATE SET hits = hits + 1, lastChat = ?",
    [jid, Date.now(), Date.now()],
  );
}

export function setBanned(jid: string, banned: boolean) {
  db.run(
    "INSERT INTO users (jid, banned) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET banned = ?",
    [jid, +banned, +banned],
  );
}

export function isBanned(jid: string): boolean {
  const row = db.query("SELECT banned FROM users WHERE jid = ?").get(jid) as {
    banned: number;
  } | null;
  return row?.banned === 1;
}

export default db;
