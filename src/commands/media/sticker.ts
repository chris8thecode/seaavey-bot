import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { imageToSticker, videoToSticker } from "@/utils/convert";

export default defineCommand({
  name: "Sticker",
  alias: ["stiker", "sticker"],
  description: "Convert image/video to sticker",
  handler: async (_sock, msg) => {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    const videoMsg = msg.message?.videoMessage || quotedMsg?.videoMessage;

    if (!imageMsg && !videoMsg) {
      return msg.reply("Kirim/reply gambar atau video (max 10s) dengan caption .sticker");
    }

    const message = quotedMsg ? ({ key: msg.key, message: quotedMsg } as WAMessage) : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", {})) as Buffer;

    const pack = msg.args[0] || "SeaaveyBot";
    const author = msg.args[1] || "Seaavey";

    const sticker = videoMsg
      ? await videoToSticker(buffer, { pack, author })
      : await imageToSticker(buffer, { pack, author });

    await msg.send({ sticker });
  },
});
