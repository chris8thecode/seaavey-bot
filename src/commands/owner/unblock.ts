import { defineCommand } from "@/core/types";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Unblock",
  alias: ["ublk", "unblock"],
  description: "Unblock a user (owner only)",
  ownerOnly: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply("Tag atau reply user yang mau di-unblock.");

    await sock.updateBlockStatus(target, "unblock");
    await msg.reply(`✅ @${getNumber(target)} berhasil di-unblock.`);
  },
});
