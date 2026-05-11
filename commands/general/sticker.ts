import { downloadMediaMessage, type WAMessage } from "baileys";
import { imageToSticker, videoToSticker } from "@/convert";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "sticker",
  description: "Convert image/video to sticker",
  handler: async (_sock, msg) => {
    const raw = msg.msg;
    const quotedMsg = raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = raw.message?.imageMessage || quotedMsg?.imageMessage;
    const videoMsg = raw.message?.videoMessage || quotedMsg?.videoMessage;

    if (!imageMsg && !videoMsg) {
      return msg.reply("Kirim/reply gambar atau video (max 10s) dengan caption .sticker");
    }

    const message = quotedMsg ? ({ key: raw.key, message: quotedMsg } as WAMessage) : raw;
    const buffer = (await downloadMediaMessage(message, "buffer", {})) as Buffer;

    const pack = msg.args[0] || "SeaaveyBot";
    const author = msg.args[1] || "Seaavey";

    const sticker = videoMsg
      ? videoToSticker(buffer, { pack, author })
      : imageToSticker(buffer, { pack, author });

    await msg.send({ sticker });
  },
});
