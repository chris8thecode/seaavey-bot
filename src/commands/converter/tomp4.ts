import { downloadMediaMessage, type WAMessage } from "baileys";
import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { config } from "@/core/config";
import { stickerToImage, stickerToVideo } from "@/utils/convert";

export default defineCommand({
  name: "To MP4 / Image",
  alias: ["tomp4", "tovid", "tovideo", "stickertoimg", "stickertovideo"],
  description: t("converter.tomp4.desc"),
  usage: "{prefix}tomp4",
  tags: ["converter"],
  handler: async (sock, msg) => {
    const sticker = msg.message?.stickerMessage || msg.quoted?.stickerMessage;

    if (!sticker) {
      return msg.reply(t("converter.tomp4.noSticker"));
    }

    if (sticker.mimetype && sticker.mimetype !== "image/webp") {
      return msg.reply(t("converter.tomp4.notWebp"));
    }

    if (!sticker.url && !sticker.directPath) {
      return msg.reply(t("converter.tomp4.invalidPath"));
    }

    if (sticker.fileLength && Number(sticker.fileLength) === 0) {
      return msg.reply(t("converter.tomp4.emptySticker"));
    }

    // Parse the actual trigger invoked by the user
    const body = msg.body || "";
    const prefix = config.prefix.find((p) => body.startsWith(p)) || "";
    const trigger = (body.slice(prefix.length).split(" ")[0] || "").toLowerCase();

    const mediaMsg = msg.quoted
      ? {
          key: { ...msg.key, id: msg.quoted.id, participant: msg.quoted.sender },
          message: { stickerMessage: sticker },
        }
      : msg.raw;

    try {
      // Determine conversion type: static image vs animated video
      const isStaticRequest = trigger === "stickertoimg" || !sticker.isAnimated;

      if (isStaticRequest) {
        await msg.reply(t("converter.tomp4.convertingImage"));
        const buffer = (await downloadMediaMessage(mediaMsg as WAMessage, "buffer", {
          host: "mmg.whatsapp.net",
        })) as Buffer;

        if (!buffer) throw new Error(t("converter.tomp4.downloadFailed"));
        const image = stickerToImage(buffer);
        await msg.send({ image });
      } else {
        await msg.reply(t("converter.tomp4.convertingVideo"));
        const buffer = (await downloadMediaMessage(mediaMsg as WAMessage, "buffer", {
          host: "mmg.whatsapp.net",
        })) as Buffer;

        if (!buffer) throw new Error(t("converter.tomp4.downloadFailed"));
        const video = stickerToVideo(buffer);
        await msg.send({
          video,
          mimetype: "video/mp4",
          caption: t("converter.tomp4.successVideo"),
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      await msg.reply(t("converter.tomp4.failed", { error: err.message }));
    }
  },
});
