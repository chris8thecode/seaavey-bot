import { defineCommand } from "@/core/types";
import { addWarn, getGroup, getWarns } from "@/infra/database";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Warn",
  alias: ["warn"],
  description: "Beri peringatan ke member",
  groupOnly: true,
  adminOnly: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply("Tag atau reply user yang ingin diwarn.");
    const reason =
      msg.args.filter((a: string) => !a.startsWith("@")).join(" ") || "Tidak ada alasan";
    addWarn(msg.jid, target, reason);
    const warns = getWarns(msg.jid, target);
    const group = getGroup(msg.jid);
    const max = group.warnMax || 3;
    if (warns.length >= max) {
      await sock.groupParticipantsUpdate(msg.jid, [target], "remove");
      await msg.reply(`⚠️ @${getNumber(target)} telah mencapai ${max} warn dan dikick!`);
    } else {
      await msg.reply(
        `⚠️ @${getNumber(target)} diwarn! (${warns.length}/${max})\nAlasan: ${reason}`,
      );
    }
  },
});
