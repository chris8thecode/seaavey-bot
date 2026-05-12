import { addWarn, getGroup, getWarns } from "@/database";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "warn",
  description: "Beri peringatan ke member",
  handler: async (sock, msg) => {
    if (!msg.isGroup) return msg.reply("❌ Hanya untuk group.");
    if (!msg.isAdmin) return msg.reply("❌ Khusus admin.");
    const target = msg.mentioned[0] || msg.quoted;
    if (!target) return msg.reply("Tag atau reply user yang ingin diwarn.");
    const reason = msg.args.filter((a) => !a.startsWith("@")).join(" ") || "Tidak ada alasan";
    addWarn(msg.jid, target, reason);
    const warns = getWarns(msg.jid, target);
    const group = getGroup(msg.jid);
    const max = group.warnMax || 3;
    if (warns.length >= max) {
      await sock.groupParticipantsUpdate(msg.lid, [target], "remove");
      await msg.reply(`⚠️ @${target.replace(/@.+/, "")} telah mencapai ${max} warn dan dikick!`);
    } else {
      await msg.reply(
        `⚠️ @${target.replace(/@.+/, "")} diwarn! (${warns.length}/${max})\nAlasan: ${reason}`,
      );
    }
  },
});
