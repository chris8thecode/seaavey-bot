import { setAfk } from "@/database";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "afk",
  description: "Set status AFK",
  handler: async (_sock, msg) => {
    const reason = msg.args.join(" ") || "Tidak ada alasan";
    setAfk(msg.sender, reason);
    await msg.reply(`💤 @${msg.sender.replace(/@.+/, "")} sedang AFK\nAlasan: ${reason}`);
  },
});
