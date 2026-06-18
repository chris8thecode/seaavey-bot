import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Del PP",
  alias: ["delpp"],
  description: "Remove bot profile picture (owner only)",
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!sock.user?.id) return;

    await sock.removeProfilePicture(sock.user.id);
    await msg.reply("✅ Profile picture bot berhasil dihapus!");
  },
});
