import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { stickerToImage } from "@/utils/convert";

export default defineCommand({
  name: "To Image",
  alias: ["toimage"],
  description: "Convert sticker to image",
  handler: async (sock, msg) => {
    const qm = msg.quoted?.msg;
    const sticker =
      qm?.stickerMessage ??
      qm?.viewOnceMessageV2?.message?.stickerMessage ??
      qm?.ephemeralMessage?.message?.stickerMessage;

    if (!sticker) {
      return msg.reply("Reply sticker dengan caption .toimg");
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

    if (sticker.isAnimated) {
      return msg.reply("Sticker animasi tidak bisa dikonversi ke gambar.");
    }

    const message = {
      key: { ...msg.key, id: msg.quoted?.id, participant: msg.quoted?.sender },
      message: { stickerMessage: sticker },
    } as WAMessage;

    const buffer = (await downloadMediaMessage(message, "buffer", { host: "mmg.whatsapp.net" })) as Buffer;
    const image = stickerToImage(buffer);

    await msg.send({ image });
  },
});
