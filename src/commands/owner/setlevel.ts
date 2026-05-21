import { defineCommand } from "@/core/types";
import { setLevel } from "@/infra/database";
import { getNumber } from "@/utils/helper";

export default defineCommand({
  name: "SetLevel",
  alias: ["setlevel"],
  description: "Set level user (Owner Only)",
  handler: async (_sock, msg) => {
    if (!msg.isOwner) return msg.reply("❌ Fitur khusus Owner!");

    const target = msg.quoted || msg.mentioned[0];
    const level = Number.parseInt(msg.args[1] || msg.args[0] || "0", 10);

    if (!target || Number.isNaN(level)) {
      return msg.reply(
        "Format: .setlevel @user <level> atau balas pesan user dengan .setlevel <level>",
      );
    }

    setLevel(target, level);
    await msg.reply(`✅ Berhasil set level @${getNumber(target)} menjadi *${level}*`);
  },
});
