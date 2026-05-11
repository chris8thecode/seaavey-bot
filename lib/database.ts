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

// ======= Groups =======

db.run(`
  CREATE TABLE IF NOT EXISTS groups (
    jid TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    welcome INTEGER DEFAULT 0,
    goodbye INTEGER DEFAULT 0,
    antilink INTEGER DEFAULT 0,
    antidelete INTEGER DEFAULT 0,
    antispam INTEGER DEFAULT 0,
    antitoxic INTEGER DEFAULT 0,
    mute INTEGER DEFAULT 0,
    autosticker INTEGER DEFAULT 0,
    onlyAdmin INTEGER DEFAULT 0,
    welcomeMsg TEXT DEFAULT '',
    goodbyeMsg TEXT DEFAULT '',
    warnMax INTEGER DEFAULT 3
  )
`);

export interface Group {
  jid: string;
  name: string;
  welcome: number;
  goodbye: number;
  antilink: number;
  antidelete: number;
  antispam: number;
  antitoxic: number;
  mute: number;
  autosticker: number;
  onlyAdmin: number;
  welcomeMsg: string;
  goodbyeMsg: string;
  warnMax: number;
}

export function getGroup(jid: string): Group {
  const row = db.query("SELECT * FROM groups WHERE jid = ?").get(jid) as Group | null;
  if (row) return row;
  db.run("INSERT OR IGNORE INTO groups (jid) VALUES (?)", [jid]);
  return db.query("SELECT * FROM groups WHERE jid = ?").get(jid) as Group;
}

export function setGroup(jid: string, key: keyof Omit<Group, "jid">, value: string | number) {
  db.run("INSERT OR IGNORE INTO groups (jid) VALUES (?)", [jid]);
  db.run(`UPDATE groups SET ${key} = ? WHERE jid = ?`, [value, jid]);
}

export default db;
