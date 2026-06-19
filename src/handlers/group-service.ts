import db, { type Group, setGroup } from "@/infra/database";

function formatGroup(g: Group) {
  const members = (
    db.query("SELECT COUNT(*) as count FROM group_members WHERE groupJid = ?").get(g.jid) as {
      count: number;
    }
  ).count;
  return {
    jid: g.jid,
    name: g.name || g.jid.split("@")[0],
    members,
    status: g.mute ? "muted" : "active",
    welcome: !!g.welcome,
    goodbye: !!g.goodbye,
    antiSpam: !!g.antispam,
    antilink: !!g.antilink,
    antidelete: !!g.antidelete,
    antitoxic: !!g.antitoxic,
    antiviewonce: !!g.antiviewonce,
    autosticker: !!g.autosticker,
    onlyAdmin: !!g.onlyAdmin,
    warnMax: g.warnMax,
  };
}

export function listGroups() {
  const rows = db.query("SELECT * FROM groups").all() as Group[];
  return rows.map(formatGroup);
}

export function getGroupByJid(jid: string) {
  const g = db.query("SELECT * FROM groups WHERE jid = ?").get(jid) as Group | null;
  if (!g) return null;
  return formatGroup(g);
}

export interface GroupUpdateData {
  name?: string;
  status?: string;
  welcome?: boolean;
  goodbye?: boolean;
  antiSpam?: boolean;
  antilink?: boolean;
  antidelete?: boolean;
  antitoxic?: boolean;
  antiviewonce?: boolean;
  autosticker?: boolean;
  onlyAdmin?: boolean;
}

export function updateGroupSettings(jid: string, data: GroupUpdateData) {
  const fieldMap: Record<string, keyof Omit<Group, "jid">> = {
    name: "name",
    status: "mute",
    welcome: "welcome",
    goodbye: "goodbye",
    antiSpam: "antispam",
    antilink: "antilink",
    antidelete: "antidelete",
    antitoxic: "antitoxic",
    antiviewonce: "antiviewonce",
    autosticker: "autosticker",
    onlyAdmin: "onlyAdmin",
  };

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    const field = fieldMap[key];
    if (!field) continue;
    const dbValue = key === "status" ? (value === "muted" ? 1 : 0) : +!!value;
    setGroup(jid, field, dbValue);
  }

  return getGroupByJid(jid);
}

export function setGroupMute(jid: string, muted: boolean) {
  setGroup(jid, "mute", muted ? 1 : 0);
  return { jid, status: muted ? "muted" : "active" };
}
