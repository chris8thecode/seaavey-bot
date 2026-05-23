import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { img2img } from "@/utils/ai";

export default defineCommand({
  name: "hitamkan",
  alias: ["hitamkan"],
  handler: async (sock, msg) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isImage = msg.message?.imageMessage || quoted?.imageMessage;

    if (!isImage) return msg.reply("❌ Balas atau kirim gambar dengan caption .hitamkan");

    await msg.reply("⏳ Sedang memproses...");

    try {
      const mediaMsg = quoted
        ? {
            message: quoted,
            key: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
          }
        : msg.raw;
      const buffer = await downloadMediaMessage(mediaMsg as WAMessage, "buffer", {});

      const result = await img2img(
        Buffer.from(buffer),
        "image/jpeg",
        "Change the skin color of all people in this image to very dark black/ebony skin tone. Keep everything else exactly the same — same pose, same clothing, same background, same facial features, same hair. Only change the skin color to deep dark black.",
      );

      if (!result.success) return msg.reply(`❌ ${result.text}`);

      await sock.sendMessage(
        msg.jid,
        { image: result.buffer, caption: "✅ Done" },
        { quoted: msg.raw },
      );
    } catch (e: unknown) {
      const error = e as Error;
      await msg.reply(`❌ Gagal: ${error.message}`);
    }
  },
});
