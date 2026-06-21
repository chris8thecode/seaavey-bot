import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set PP",
  alias: ["setpp"],
  description: "Set bot profile picture (owner only)",
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!sock.user?.id) return;

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;

    if (!imageMsg) return msg.reply("Kirim/reply gambar dengan caption .setpp");

    const message = quotedMsg ? ({ key: msg.key, message: quotedMsg } as WAMessage) : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", { host: "mmg.whatsapp.net" })) as Buffer;

    await sock.updateProfilePicture(sock.user.id, buffer);
    await msg.reply("✅ Profile picture bot berhasil diubah!");
  },
});
