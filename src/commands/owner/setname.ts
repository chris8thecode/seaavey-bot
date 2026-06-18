import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set Name",
  alias: ["setname"],
  description: "Set bot display name (owner only)",
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!msg.args.length) return msg.reply("Contoh: .setname SeaaveyBot");

    await sock.updateProfileName(msg.args.join(" "));
    await msg.reply("✅ Nama bot berhasil diubah!");
  },
});
