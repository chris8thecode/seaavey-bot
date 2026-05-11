import { defineCommand } from "@/types";

export default defineCommand({
  name: "kick",
  description: "Kick member dari grup",
  handler: async (sock, msg) => {
    if (!msg.isGroup) return msg.reply("Hanya bisa di grup!");
    if (!msg.isAdmin) return msg.reply("Kamu bukan admin!");
    if (!msg.isBotAdmin) return msg.reply("Bot bukan admin!");
    const target = msg.mentioned[0] || msg.quoted;
    if (!target) return msg.reply("Tag atau reply user yang mau di kick!");
    await sock.groupParticipantsUpdate(msg.lid, [target], "remove");
    await msg.send({
      text: `Done, @${target.replace(/@.+/, "")} telah di kick!`,
      mentions: [target],
    });
  },
});
