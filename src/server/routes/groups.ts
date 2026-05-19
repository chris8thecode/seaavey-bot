import { Elysia } from "elysia";
import db, { type Group, setGroup } from "@/infra/database";

export const groupsRoutes = new Elysia({ prefix: "/api/groups" })
  .get("/", () => {
    const rows = db.query("SELECT * FROM groups").all() as Group[];
    return rows.map((g) => ({
      jid: g.jid,
      name: g.name || g.jid.split("@")[0],
      members: (
        db.query("SELECT COUNT(*) as count FROM group_members WHERE groupJid = ?").get(g.jid) as {
          count: number;
        }
      ).count,
      status: g.mute ? "muted" : "active",
      welcome: !!g.welcome,
      goodbye: !!g.goodbye,
      antiSpam: !!g.antispam,
      antilink: !!g.antilink,
      antidelete: !!g.antidelete,
      antitoxic: !!g.antitoxic,
      antinsfw: !!g.antinsfw,
      antiviewonce: !!g.antiviewonce,
      autosticker: !!g.autosticker,
      onlyAdmin: !!g.onlyAdmin,
      warnMax: g.warnMax,
    }));
  })
  .get("/:jid", ({ params }) => {
    const g = db.query("SELECT * FROM groups WHERE jid = ?").get(params.jid) as Group | null;
    if (!g) return null;
    return {
      jid: g.jid,
      name: g.name || g.jid.split("@")[0],
      members: (
        db.query("SELECT COUNT(*) as count FROM group_members WHERE groupJid = ?").get(g.jid) as {
          count: number;
        }
      ).count,
      status: g.mute ? "muted" : "active",
      welcome: !!g.welcome,
      goodbye: !!g.goodbye,
      antiSpam: !!g.antispam,
      antilink: !!g.antilink,
      antidelete: !!g.antidelete,
      antitoxic: !!g.antitoxic,
      antinsfw: !!g.antinsfw,
      antiviewonce: !!g.antiviewonce,
      autosticker: !!g.autosticker,
      onlyAdmin: !!g.onlyAdmin,
      warnMax: g.warnMax,
    };
  })
  .patch("/:jid", ({ params, body }) => {
    const data = body as Record<string, unknown>;
    if (data.name !== undefined) setGroup(params.jid, "name", data.name);
    if (data.status !== undefined) setGroup(params.jid, "mute", data.status === "muted" ? 1 : 0);
    if (data.welcome !== undefined) setGroup(params.jid, "welcome", data.welcome ? 1 : 0);
    if (data.goodbye !== undefined) setGroup(params.jid, "goodbye", data.goodbye ? 1 : 0);
    if (data.antiSpam !== undefined) setGroup(params.jid, "antispam", data.antiSpam ? 1 : 0);
    if (data.antilink !== undefined) setGroup(params.jid, "antilink", data.antilink ? 1 : 0);
    if (data.antidelete !== undefined) setGroup(params.jid, "antidelete", data.antidelete ? 1 : 0);
    if (data.antitoxic !== undefined) setGroup(params.jid, "antitoxic", data.antitoxic ? 1 : 0);
    if (data.antinsfw !== undefined) setGroup(params.jid, "antinsfw", data.antinsfw ? 1 : 0);
    if (data.antiviewonce !== undefined)
      setGroup(params.jid, "antiviewonce", data.antiviewonce ? 1 : 0);
    if (data.autosticker !== undefined)
      setGroup(params.jid, "autosticker", data.autosticker ? 1 : 0);
    if (data.onlyAdmin !== undefined) setGroup(params.jid, "onlyAdmin", data.onlyAdmin ? 1 : 0);
    const g = db.query("SELECT * FROM groups WHERE jid = ?").get(params.jid) as Group;
    return {
      jid: g.jid,
      name: g.name || g.jid.split("@")[0],
      members: (
        db.query("SELECT COUNT(*) as count FROM group_members WHERE groupJid = ?").get(g.jid) as {
          count: number;
        }
      ).count,
      status: g.mute ? "muted" : "active",
      welcome: !!g.welcome,
      goodbye: !!g.goodbye,
      antiSpam: !!g.antispam,
      antilink: !!g.antilink,
      antidelete: !!g.antidelete,
      antitoxic: !!g.antitoxic,
      antinsfw: !!g.antinsfw,
      antiviewonce: !!g.antiviewonce,
      autosticker: !!g.autosticker,
      onlyAdmin: !!g.onlyAdmin,
      warnMax: g.warnMax,
    };
  })
  .post("/:jid/mute", ({ params }) => {
    setGroup(params.jid, "mute", 1);
    return { jid: params.jid, status: "muted" };
  })
  .post("/:jid/unmute", ({ params }) => {
    setGroup(params.jid, "mute", 0);
    return { jid: params.jid, status: "active" };
  });
