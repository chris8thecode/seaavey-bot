import { defineCommand } from "@/types";

export default defineCommand({
  name: "add",
  description: "Tambah member ke grup",
  handler: async (sock, msg) => {
    if (!msg.isGroup) return msg.reply("Hanya bisa di grup!");
    if (!msg.isAdmin) return msg.reply("Kamu bukan admin!");
    if (!msg.isBotAdmin) return msg.reply("Bot bukan admin!");
    const number = msg.args[0]?.replace(/[^0-9]/g, "");
    if (!number) return msg.reply("Masukkan nomor! Contoh: !add 6281234567890");
    const target = `${number}@s.whatsapp.net`;
    await sock.groupParticipantsUpdate(msg.lid, [target], "add");
    await msg.send({
      text: `Done, @${target.replace(/@.+/, "")} telah ditambahkan!`,
      mentions: [target],
    });
  },
});
