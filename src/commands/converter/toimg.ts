import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { stickerToImage } from "@/utils/convert";
import type { proto } from "@whiskeysockets/baileys";

export default defineCommand({
  name: "To Image",
  alias: ["toimage"],
  description: "Convert sticker to image",
  handler: async (_sock, msg) => {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = contextInfo?.quotedMessage;
    const sticker: proto.Message.IStickerMessage | undefined =
      quotedMsg?.stickerMessage ||
      quotedMsg?.viewOnceMessageV2?.message?.stickerMessage ||
      quotedMsg?.ephemeralMessage?.message?.stickerMessage;

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
      key: { ...msg.key, id: contextInfo?.stanzaId, participant: contextInfo?.participant },
      message: { stickerMessage: sticker },
    } as WAMessage;

    const buffer = (await downloadMediaMessage(message, "buffer", {})) as Buffer;
    const image = stickerToImage(buffer);

    await msg.send({ image });
  },
});
