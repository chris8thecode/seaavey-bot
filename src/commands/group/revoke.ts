import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Revoke",
  alias: ["rev", "revoke"],
  description: "Reset link invite grup",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupRevokeInvite(msg.jid);
    await msg.reply("Link invite grup telah direset!");
  },
});
