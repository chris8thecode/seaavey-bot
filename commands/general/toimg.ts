import { downloadMediaMessage, type WAMessage } from "baileys";
import { stickerToImage } from "@/convert";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "toimg",
  description: "Convert sticker to image",
  handler: async (_sock, msg) => {
    const raw = msg.msg;
    const quotedMsg = raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = raw.message?.stickerMessage || quotedMsg?.stickerMessage;

    if (!stickerMsg) {
      return msg.reply("Reply sticker dengan caption .toimg");
    }

    const message = quotedMsg ? ({ key: raw.key, message: quotedMsg } as WAMessage) : raw;
    const buffer = (await downloadMediaMessage(message, "buffer", {})) as Buffer;
    const image = stickerToImage(buffer);

    await msg.send({ image });
  },
});
