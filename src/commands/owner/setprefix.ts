import { config } from "@/core/config";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set Prefix",
  alias: ["prefix", "setprefix"],
  description: "Change bot prefix (owner only)",
  ownerOnly: true,
  handler: async (_sock, msg) => {
    if (!msg.args[0]) return msg.reply("Contoh: .setprefix !");

    config.prefix = msg.args[0];
    await msg.reply(`✅ Prefix berhasil diubah ke: ${config.prefix}`);
  },
});
