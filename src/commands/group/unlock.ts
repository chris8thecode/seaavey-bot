import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Unlock",
  alias: ["ul", "unlock"],
  description: "Buka setting grup (semua member bisa edit info)",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "unlocked");
    await msg.reply("Setting grup dibuka, semua member bisa edit info.");
  },
});
