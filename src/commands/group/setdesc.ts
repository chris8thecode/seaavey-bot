import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set Desc",
  alias: ["sd", "setdesc"],
  description: "Ubah deskripsi grup",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const desc = msg.args.join(" ");
    if (!desc) return msg.reply("Masukkan deskripsi baru!");
    await sock.groupUpdateDescription(msg.jid, desc);
    await msg.reply("Deskripsi grup telah diubah!");
  },
});
