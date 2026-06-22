import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { stickerToVideo } from "@/utils/convert";

export default defineCommand({
  name: "To MP4",
  alias: ["tomp4"],
  description: "Convert animated sticker to MP4",
  handler: async (sock, msg) => {
    const sticker = msg.quoted?.stickerMessage;

    if (!sticker) {
      return msg.reply("Reply sticker dengan caption .tomp4");
    }

    if (sticker.mimetype && sticker.mimetype !== "image/webp") {
      return msg.reply("Hanya support sticker WebP (image/webp).");
    }

    if (!sticker.url && !sticker.directPath) {
      return msg.reply("Sticker tidak memiliki media path yang valid.");
    }

    if (sticker.fileLength && Number(sticker.fileLength) === 0) {
      return msg.reply("Sticker kosong atau corrupt.");
    }

    if (!sticker.isAnimated) {
      return msg.reply("Sticker statis tidak bisa dikonversi ke video.");
    }

    const message = {
      key: { ...msg.key, id: msg.quoted?.id, participant: msg.quoted?.sender },
      message: { stickerMessage: sticker },
    } as WAMessage;

    const buffer = (await downloadMediaMessage(message, "buffer", { host: "mmg.whatsapp.net" })) as Buffer;
    const video = stickerToVideo(buffer);

    await msg.send({
      video,
      mimetype: "video/mp4",
    });
  },
});
