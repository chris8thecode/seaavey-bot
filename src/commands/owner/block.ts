import { defineCommand } from "@/core/types";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Block",
  alias: ["block"],
  description: "Block a user (owner only)",
  ownerOnly: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply("Tag atau reply user yang mau di-block.");

    await sock.updateBlockStatus(target, "block");
    await msg.reply(`✅ @${getNumber(target)} berhasil di-block.`);
  },
});
