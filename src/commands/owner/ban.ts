import { defineCommand } from "@/core/types";
import { isBanned, setBanned } from "@/infra/database";

export default defineCommand({
  name: "Ban",
  alias: ["ban"],
  description: "Ban/unban user (owner only)",
  ownerOnly: true,
  handler: async (_sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply("Tag atau reply user yang mau di-ban/unban.");

    if (isBanned(target)) {
      setBanned(target, false);
      await msg.reply(`✅ User ${target.split("@")[0]} telah di-unban.`);
    } else {
      setBanned(target, true);
      await msg.reply(`🚫 User ${target.split("@")[0]} telah di-ban.`);
    }
  },
});
