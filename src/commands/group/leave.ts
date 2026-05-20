import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Leave",
  command: "gleave",
  description: "Bot keluar dari grup",
  handler: async (sock, msg) => {
    if (!msg.isGroup) return msg.reply("Hanya bisa di grup!");
    if (!msg.isOwner) return msg.reply("Hanya owner yang bisa!");
    await msg.reply("Bye bye 👋");
    await sock.groupLeave(msg.jid);
  },
});
