import { downloadMediaMessage, type WAMessage } from "baileys";
import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set PP",
  alias: ["setpp"],
  description: t("owner.setpp.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!sock.user?.id) return;

    const imageMsg = msg.message?.imageMessage || msg.quoted?.imageMessage;

    if (!imageMsg) return msg.reply(t("owner.setpp.format"));

    const message = msg.quoted
      ? ({
          key: { ...msg.key, id: msg.quoted.id, participant: msg.quoted.sender },
          message: { imageMessage: msg.quoted.imageMessage },
        } as WAMessage)
      : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", {
      host: "mmg.whatsapp.net",
    })) as Buffer;

    await sock.updateProfilePicture(sock.user.id, buffer);
    await msg.reply(t("owner.setpp.success"));
  },
});
