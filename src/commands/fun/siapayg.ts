import { defineCommand } from "@/types";

export default defineCommand({
  name: "siapayg",
  description: "Random pilih member grup. Contoh: .siapayg paling ganteng",
  handler: async (sock, msg) => {
    if (!msg.isGroup) return msg.reply("❌ Hanya untuk group.");
    const question = msg.args.join(" ");
    if (!question)
      return msg.reply(
        "Format: .siapayg <pertanyaan>\nContoh: .siapayg paling ganteng di grup ini",
      );
    const metadata = await sock.groupMetadata(msg.lid);
    const members = metadata.participants.map((p) => p.id);
    const chosen = members[Math.floor(Math.random() * members.length)] as string;
    await msg.send({
      text: `🎯 *Siapa yang ${question}?*\n\nJawabannya: @${chosen.replace(/@.+/, "")} 😂`,
      mentions: [chosen],
    });
  },
});
