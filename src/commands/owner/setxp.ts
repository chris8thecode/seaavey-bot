import { defineCommand } from "@/core/types";
import { setXp } from "@/infra/database";
import { getNumber } from "@/utils/helper";

export default defineCommand({
  name: "SetXP",
  alias: ["setxp"],
  description: "Set XP user (Owner Only)",
  handler: async (_sock, msg) => {
    if (!msg.isOwner) return msg.reply("❌ Fitur khusus Owner!");

    const target = msg.quoted || msg.mentioned[0];
    const xp = Number.parseInt(msg.args[1] || msg.args[0] || "0", 10);

    if (!target || Number.isNaN(xp)) {
      return msg.reply("Format: .setxp @user <xp> atau balas pesan user dengan .setxp <xp>");
    }

    setXp(target, xp);
    await msg.reply(`✅ Berhasil set XP @${getNumber(target)} menjadi *${xp}*`);
  },
});
