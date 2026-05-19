import { Elysia } from "elysia";
import db, { setBanned } from "@/infra/database";

interface UserRow {
  jid: string;
  hits: number;
  banned: number;
  lastChat: number;
  xp: number;
  level: number;
}

function formatLastSeen(timestamp: number): string {
  if (!timestamp) return "Never";
  const diff = Math.floor((Date.now() - timestamp) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function mapUser(u: UserRow) {
  return {
    jid: u.jid,
    name: u.jid.split("@")[0],
    status: u.banned ? "banned" : "active",
    lastSeen: formatLastSeen(u.lastChat),
    commands: u.hits,
    level: u.level,
    xp: u.xp,
  };
}

export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .get("/", () => {
    const rows = db.query("SELECT * FROM users").all() as UserRow[];
    return rows.map(mapUser);
  })
  .get("/:jid", ({ params }) => {
    const row = db.query("SELECT * FROM users WHERE jid = ?").get(params.jid) as UserRow | null;
    if (!row) return null;
    return mapUser(row);
  })
  .patch("/:jid", ({ params, body }) => {
    const { status } = body as { name?: string; status?: string };
    if (status !== undefined) {
      setBanned(params.jid, status === "banned");
    }
    const row = db.query("SELECT * FROM users WHERE jid = ?").get(params.jid) as UserRow | null;
    if (!row) return null;
    return mapUser(row);
  })
  .post("/:jid/ban", ({ params }) => {
    setBanned(params.jid, true);
    return { jid: params.jid, status: "banned" };
  })
  .post("/:jid/unban", ({ params }) => {
    setBanned(params.jid, false);
    return { jid: params.jid, status: "active" };
  });
