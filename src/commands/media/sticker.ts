import { downloadMediaMessage, type WAMessage } from "baileys";
import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { imageToSticker, videoToSticker } from "@/utils/convert";

export default defineCommand({
  name: "Sticker",
  alias: ["stiker", "sticker", "s"],
  description: t("media.sticker.desc"),
  handler: async (sock, msg) => {
    const imageMsg = msg.message?.imageMessage || msg.quoted?.imageMessage;
    const videoMsg = msg.message?.videoMessage || msg.quoted?.videoMessage;

    if (!imageMsg && !videoMsg) {
      return msg.reply(t("media.sticker.noMedia"));
    }

    const message = msg.quoted
      ? ({
          key: { ...msg.key, id: msg.quoted.id, participant: msg.quoted.sender },
          message: msg.quoted.imageMessage
            ? { imageMessage: msg.quoted.imageMessage }
            : { videoMessage: msg.quoted.videoMessage },
        } as WAMessage)
      : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", {
      host: "mmg.whatsapp.net",
    })) as Buffer;

    const pack = msg.args[0] || "SeaaveyBot";
    const author = msg.args[1] || "Seaavey";

    const sticker = videoMsg
      ? await videoToSticker(buffer, { pack, author })
      : await imageToSticker(buffer, { pack, author });

    await msg.send({ sticker });
  },
});
