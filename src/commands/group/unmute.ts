import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Unmute",
  alias: ["um", "unmute"],
  description: "Buka grup (semua member bisa chat)",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "not_announcement");
    await msg.reply("Grup telah dibuka, semua member bisa chat.");
  },
});
