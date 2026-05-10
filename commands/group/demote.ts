import { defineCommand } from "@/types";

export default defineCommand({
  name: "demote",
  description: "Hapus admin dari member",
  handler: async (sock, msg) => {
    if (!msg.isGroup) return msg.reply("Hanya bisa di grup!");
    if (!msg.isAdmin) return msg.reply("Kamu bukan admin!");
    if (!msg.isBotAdmin) return msg.reply("Bot bukan admin!");
    const target = msg.mentioned[0] || msg.quoted;
    if (!target) return msg.reply("Tag atau reply user yang mau di demote!");
    await sock.groupParticipantsUpdate(msg.lid, [target], "demote");
    await msg.reply("Done, user telah dicopot dari admin!");
  },
});
