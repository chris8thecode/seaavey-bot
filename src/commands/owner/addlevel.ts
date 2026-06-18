import { defineCommand } from "@/core/types";
import { addLevel } from "@/infra/database";
import { getNumber } from "@/utils/helper";

export default defineCommand({
  name: "AddLevel",
  alias: ["addlevel"],
  description: "Tambah level user (Owner Only)",
  ownerOnly: true,
  handler: async (_sock, msg) => {
    const target = msg.quoted?.sender || msg.mentioned[0];
    const amount = Number.parseInt(msg.args[1] || msg.args[0] || "0", 10);

    if (!target || Number.isNaN(amount)) {
      return msg.reply(
        "Format: .addlevel @user <jumlah> atau balas pesan user dengan .addlevel <jumlah>",
      );
    }

    addLevel(target, amount);
    await msg.reply(`✅ Berhasil menambah *${amount}* level untuk @${getNumber(target)}`);
  },
});
