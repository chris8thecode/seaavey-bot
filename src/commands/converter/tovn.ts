import { downloadMediaMessage, type WAMessage } from "baileys";
import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { toOpus } from "@/utils/convert";

export default defineCommand({
  name: "To Voice Note",
  alias: ["tovn"],
  description: t("converter.tovn.desc"),
  handler: async (sock, msg) => {
    const videoMsg = msg.message?.videoMessage || msg.quoted?.videoMessage;
    const audioMsg = msg.message?.audioMessage || msg.quoted?.audioMessage;

    if (!videoMsg && !audioMsg) {
      return msg.reply(t("converter.tovn.noMedia"));
    }

    await msg.reply(t("converter.tovn.processing"));

    const message = msg.quoted
      ? ({
          key: { ...msg.key, id: msg.quoted.id, participant: msg.quoted.sender },
          message: msg.quoted.videoMessage
            ? { videoMessage: msg.quoted.videoMessage }
            : { audioMessage: msg.quoted.audioMessage },
        } as WAMessage)
      : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", {
      host: "mmg.whatsapp.net",
    })) as Buffer;
    const opus = toOpus(buffer);

    await msg.send({
      audio: opus,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });
  },
});
