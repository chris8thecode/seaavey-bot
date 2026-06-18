import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Mute",
  alias: ["mute"],
  description: "Tutup grup (hanya admin yang bisa chat)",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "announcement");
    await msg.reply("Grup telah ditutup, hanya admin yang bisa chat.");
  },
});
