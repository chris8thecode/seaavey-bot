import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Lock",
  alias: ["lock"],
  description: "Kunci setting grup (hanya admin bisa edit info)",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "locked");
    await msg.reply("Setting grup dikunci, hanya admin yang bisa edit info.");
  },
});
