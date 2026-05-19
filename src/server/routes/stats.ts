import { Elysia } from "elysia"
import db from "@/infra/database"

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (parts.length === 0) parts.push(`${s}s`)
  return parts.join(" ")
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const statsRoutes = new Elysia({ prefix: "/api/stats" })
  .get("/", () => {
    const totalUsers = (db.query("SELECT COUNT(*) as count FROM users").get() as { count: number }).count
    const totalGroups = (db.query("SELECT COUNT(*) as count FROM groups").get() as { count: number }).count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const commandsToday = (db.query("SELECT SUM(hits) as total FROM users WHERE lastChat >= ?").get(today.getTime()) as { total: number | null }).total || 0

    return {
      status: "connected",
      uptime: formatUptime(process.uptime()),
      totalGroups,
      totalUsers,
      commandsToday,
      messagesProcessed: (db.query("SELECT SUM(hits) as total FROM users").get() as { total: number | null }).total || 0,
    }
  })
  .get("/chart", () => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const row = db.query(
        "SELECT COUNT(*) as count FROM group_members WHERE lastChat >= ? AND lastChat < ?"
      ).get(date.getTime(), nextDate.getTime()) as { count: number }

      result.push({ day: DAYS[date.getDay()] as string, commands: row.count })
    }
    return result
  })
  .get("/activity", () => {
    const rows = db.query(
      "SELECT gm.memberJid, gm.groupJid, gm.lastChat, g.name as groupName FROM group_members gm LEFT JOIN groups g ON gm.groupJid = g.jid ORDER BY gm.lastChat DESC LIMIT 10"
    ).all() as { memberJid: string; groupJid: string; lastChat: number; groupName: string }[]

    return rows.map((row) => {
      const diff = Math.floor((Date.now() - row.lastChat) / 60000)
      let time: string
      if (diff < 1) time = "just now"
      else if (diff < 60) time = `${diff}m ago`
      else if (diff < 1440) time = `${Math.floor(diff / 60)}h ago`
      else if (diff < 43200) time = `${Math.floor(diff / 1440)}d ago`
      else time = `${Math.floor(diff / 43200)}m ago`

      const number = row.memberJid.replace(/@.*/, "")
      const group = row.groupName || "Unknown Group"
      return {
        type: "command",
        text: `${number} chatted in ${group}`,
        time,
      }
    })
  })
