import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { toOpus } from "@/utils/convert";

export default defineCommand({
  name: "To Voice Note",
  alias: ["tovn"],
  description: "Convert video/audio to voice note",
  handler: async (sock, msg) => {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const videoMsg = msg.message?.videoMessage || quotedMsg?.videoMessage;
    const audioMsg = msg.message?.audioMessage || quotedMsg?.audioMessage;

    if (!videoMsg && !audioMsg) {
      return msg.reply("Kirim/reply video atau audio dengan caption .tovn");
    }

    const message = quotedMsg ? ({ key: msg.key, message: quotedMsg } as WAMessage) : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", { host: "mmg.whatsapp.net" })) as Buffer;
    const opus = toOpus(buffer);

    await msg.send({
      audio: opus,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });
  },
});
