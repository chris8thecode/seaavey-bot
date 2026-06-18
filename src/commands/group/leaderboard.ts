import { defineCommand } from "@/core/types";
import db from "@/infra/database";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Leaderboard",
  alias: ["lb", "top", "leaderboard"],
  description: "Top 10 member paling aktif di group",
  groupOnly: true,
  handler: async (_sock, msg) => {
    const top = db
      .query(
        "SELECT memberJid, chatCount FROM group_members WHERE groupJid = ? ORDER BY chatCount DESC LIMIT 10",
      )
      .all(msg.jid) as { memberJid: string; chatCount: number }[];

    if (!top.length) return msg.reply("❌ Belum ada data chat di group ini.");

    const medals = ["🥇", "🥈", "🥉"];
    const list = top
      .map(
        (m, i) => `${medals[i] || `${i + 1}.`} @${getNumber(m.memberJid)} — ${m.chatCount} pesan`,
      )
      .join("\n");

    await msg.send({
      text: `🏆 *Leaderboard Aktif*\n\n${list}`,
      mentions: top.map((m) => m.memberJid),
    });
  },
});
