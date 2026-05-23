import { defineCommand } from "@/core/types";
import { getGroup, getWarns } from "@/infra/database";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Warn List",
  alias: ["wl", "warns", "warnlist"],
  description: "Lihat daftar warn member",
  handler: async (_sock, msg) => {
    if (!msg.isGroup) return msg.reply("❌ Hanya untuk group.");
    const target = msg.mentioned[0] || msg.quoted?.sender || msg.sender;
    const warns = getWarns(msg.jid, target);
    const max = getGroup(msg.jid).warnMax || 3;
    if (!warns.length) return msg.reply(`✅ @${getNumber(target)} tidak punya warn.`);
    const list = warns
      .map((w, i) => `${i + 1}. ${w.reason} (${new Date(w.timestamp).toLocaleDateString("id")})`)
      .join("\n");
    await msg.reply(`⚠️ *Warn List* — @${getNumber(target)} (${warns.length}/${max})\n\n${list}`);
  },
});
