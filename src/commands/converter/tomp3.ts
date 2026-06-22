import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { toMp3 } from "@/utils/convert";

export default defineCommand({
  name: "To MP3",
  alias: ["mp3", "toaudio"],
  description: "Convert video/audio to MP3",
  handler: async (sock, msg) => {
    const quotedMsg = msg.quotedMsg;
    const videoMsg = msg.message?.videoMessage || quotedMsg?.videoMessage;
    const audioMsg = msg.message?.audioMessage || quotedMsg?.audioMessage;

    if (!videoMsg && !audioMsg) {
      return msg.reply("Kirim/reply video atau audio dengan caption .tomp3");
    }

    const message = quotedMsg ? ({ key: msg.key, message: quotedMsg } as WAMessage) : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", { host: "mmg.whatsapp.net" })) as Buffer;
    const mp3 = toMp3(buffer);

    await msg.send({
      audio: mp3,
      mimetype: "audio/mpeg",
      ptt: false,
    });
  },
});
