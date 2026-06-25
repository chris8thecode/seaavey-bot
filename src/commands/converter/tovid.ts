import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { webpToMp4 } from "@/infra/scrapers";

export default defineCommand({
  name: "To Video",
  alias: ["tovid", "tovideo"],
  description: "Konversi stiker bergerak ke video MP4 menggunakan EZGIF",
  usage: "{prefix}tovid",
  tags: ["converter"],
  handler: async (sock, msg) => {
    const sticker = msg.message?.stickerMessage || msg.quoted?.stickerMessage;

    if (!sticker) {
      return msg.reply("❌ Balas stiker bergerak dengan caption .tovid");
    }

    if (sticker.mimetype && sticker.mimetype !== "image/webp") {
      return msg.reply("❌ Hanya mendukung stiker WebP.");
    }

    await msg.reply("⏳ Mengonversi stiker ke video...");

    try {
      const mediaMsg = msg.quoted
        ? {
            message: { stickerMessage: msg.quoted.stickerMessage },
            key: { ...msg.key, id: msg.quoted.id, participant: msg.quoted.sender },
          }
        : msg.raw;

      const buffer = (await downloadMediaMessage(mediaMsg as WAMessage, "buffer", {
        host: "mmg.whatsapp.net",
      })) as Buffer;

      if (!buffer) {
        throw new Error("Gagal mengunduh stiker.");
      }

      const result = await webpToMp4(buffer);
      if (!result.status || !result.data) {
        return msg.reply(`❌ ${result.error || "Gagal mengonversi stiker."}`);
      }

      await msg.send({
        video: { url: result.data },
        caption: "✅ Berhasil dikonversi ke video",
      });
    } catch (error: unknown) {
      const err = error as Error;
      await msg.reply(`❌ Gagal: ${err.message}`);
    }
  },
});
