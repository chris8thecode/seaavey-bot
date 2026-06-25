/* eslint-disable @typescript-eslint/no-explicit-any */
let db: any;

if (typeof Bun !== "undefined") {
  // Running in Bun — use high-performance native bun:sqlite
  const { Database } = await import("bun:sqlite");
  db = new Database("data.db");
  db.run("PRAGMA journal_mode = WAL");
} else {
  // Running in Node.js — use better-sqlite3 with compatibility wrapper
  const BetterSqlite3 = (await import("better-sqlite3")).default;
  const rawDb = new BetterSqlite3("data.db");
  rawDb.pragma("journal_mode = WAL");

  db = {
    run(sql: string, params: any[] = []) {
      const stmt = rawDb.prepare(sql);
      return stmt.run(...params);
    },
    query(sql: string) {
      const stmt = rawDb.prepare(sql);
      return {
        get(...params: any[]) {
          return stmt.get(...params);
        },
        all(...params: any[]) {
          return stmt.all(...params);
        },
      };
    },
  };
}

export function safeMigrate(sql: string) {
  try {
    db.run(sql);
  } catch {}
}

export default db;
