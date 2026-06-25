import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { config } from "@/core/config";
import { stickerToImage, stickerToVideo } from "@/utils/convert";

export default defineCommand({
  name: "To MP4 / Image",
  alias: ["tomp4", "tovid", "tovideo", "stickertoimg", "stickertovideo"],
  description: "Convert sticker to MP4 video or static image locally",
  usage: "{prefix}tomp4",
  tags: ["converter"],
  handler: async (sock, msg) => {
    const sticker = msg.message?.stickerMessage || msg.quoted?.stickerMessage;

    if (!sticker) {
      return msg.reply(
        "❌ Balas atau kirim stiker dengan caption .tomp4, .tovid, atau .stickertoimg",
      );
    }

    if (sticker.mimetype && sticker.mimetype !== "image/webp") {
      return msg.reply("❌ Hanya mendukung stiker WebP (image/webp).");
    }

    if (!sticker.url && !sticker.directPath) {
      return msg.reply("❌ Stiker tidak memiliki media path yang valid.");
    }

    if (sticker.fileLength && Number(sticker.fileLength) === 0) {
      return msg.reply("❌ Stiker kosong atau corrupt.");
    }

    // Parse the actual trigger invoked by the user
    const body = msg.body || "";
    const prefix = config.prefix.find((p) => body.startsWith(p)) || "";
    const trigger = (body.slice(prefix.length).split(" ")[0] || "").toLowerCase();

    const mediaMsg = msg.quoted
      ? {
          key: { ...msg.key, id: msg.quoted.id, participant: msg.quoted.sender },
          message: { stickerMessage: sticker },
        }
      : msg.raw;

    try {
      // Determine conversion type: static image vs animated video
      const isStaticRequest = trigger === "stickertoimg" || !sticker.isAnimated;

      if (isStaticRequest) {
        await msg.reply("⏳ Mengonversi stiker ke gambar...");
        const buffer = (await downloadMediaMessage(mediaMsg as WAMessage, "buffer", {
          host: "mmg.whatsapp.net",
        })) as Buffer;

        if (!buffer) throw new Error("Gagal mengunduh stiker.");
        const image = stickerToImage(buffer);
        await msg.send({ image });
      } else {
        await msg.reply("⏳ Mengonversi stiker animasi ke video...");
        const buffer = (await downloadMediaMessage(mediaMsg as WAMessage, "buffer", {
          host: "mmg.whatsapp.net",
        })) as Buffer;

        if (!buffer) throw new Error("Gagal mengunduh stiker.");
        const video = stickerToVideo(buffer);
        await msg.send({
          video,
          mimetype: "video/mp4",
          caption: "✅ Berhasil dikonversi ke video",
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      await msg.reply(`❌ Gagal mengonversi stiker: ${err.message}`);
    }
  },
});
