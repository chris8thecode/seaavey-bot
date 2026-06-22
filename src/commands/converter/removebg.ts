import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { removeBackground } from "@/infra/scrapers";

export default defineCommand({
  name: "Remove Background",
  alias: ["removebg", "rbg"],
  description: "Remove image background",
  handler: async (sock, msg) => {
    const quotedMsg = msg.quoted?.msg;
    const imageMsg = msg.message?.imageMessage || msg.quoted?.imageMessage;

    if (!imageMsg) {
      return msg.reply("Kirim/reply gambar dengan caption .removebg");
    }

    const message = quotedMsg ? ({ key: msg.key, message: quotedMsg } as WAMessage) : msg.raw;
    const buffer = (await downloadMediaMessage(message, "buffer", { host: "mmg.whatsapp.net" })) as Buffer;

    const result = await removeBackground(buffer);

    if (!result.status) {
      return msg.reply(result.error || "Gagal menghapus background.");
    }

    await msg.send({ image: result.data.buffer });
  },
});
