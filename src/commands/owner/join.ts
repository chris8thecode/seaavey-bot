import { defineCommand } from "@/core/types";

const InviteUrlRe = /chat\.whatsapp\.com\/([A-Za-z0-9]+)/;

export default defineCommand({
  name: "Join",
  alias: ["join"],
  description: "Join group via invite link (owner only)",
  ownerOnly: true,
  handler: async (sock, msg) => {
    const input = msg.args[0];
    if (!input)
      return msg.reply(
        "Masukkan link atau kode invite group.\n\n" +
          "Contoh:\n" +
          "• .join https://chat.whatsapp.com/xxx\n" +
          "• .join xxx",
      );

    const match = input.match(InviteUrlRe);
    const code = match ? (match[1] ?? input) : input;

    try {
      const groupId: string = (await sock.groupAcceptInvite(code)) ?? "";
      if (!groupId) throw new Error("No group ID returned");
      const metadata = await sock.groupMetadata(groupId);
      await msg.reply(
        `✅ Berhasil join *${metadata.subject}*.\n` + `👥 ${metadata.participants.length} anggota`,
      );
    } catch {
      await msg.reply("❌ Gagal join group. Link tidak valid atau sudah expired.");
    }
  },
});
