import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set Name",
  command: "gsetname",
  description: "Ubah nama grup",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const name = msg.args.join(" ");
    if (!name) return msg.reply("Masukkan nama baru! Contoh: !setname Grup Keren");
    await sock.groupUpdateSubject(msg.jid, name);
    await msg.reply(`Nama grup diubah ke: ${name}`);
  },
});
