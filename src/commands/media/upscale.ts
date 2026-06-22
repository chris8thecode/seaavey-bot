import { downloadMediaMessage, type WAMessage } from "baileys";
import { defineCommand } from "@/core/types";
import { upscaleImage } from "@/infra/scrapers";

export default defineCommand({
  name: "Upscale",
  alias: ["upscale", "hd"],
  description: "Upscale gambar 2x atau 4x menggunakan iLoveIMG",
  usage: "{prefix}upscale [2|4]",
  tags: ["media"],
  handler: async (sock, msg) => {
    const isImage = msg.message?.imageMessage || msg.quoted?.imageMessage;

    if (!isImage) return msg.reply("❌ Balas atau kirim gambar dengan caption .upscale [2|4]");

    const scale = parseInt(msg.args[0] || "4") as 2 | 4;
    if (![2, 4].includes(scale)) return msg.reply("❌ Scale harus 2 atau 4");

    await msg.reply(`⏳ Sedang upscale ${scale}x...`);

    try {
      const mediaMsg = msg.quoted
        ? { message: { imageMessage: msg.quoted.imageMessage }, key: { ...msg.key, id: msg.quoted.id, participant: msg.quoted.sender } }
        : msg.raw;
      const buffer = await downloadMediaMessage(mediaMsg as WAMessage, "buffer", { host: "mmg.whatsapp.net" });

      const result = await upscaleImage(Buffer.from(buffer), scale);
      if (!result.status) return msg.reply(`❌ ${result.error}`);

      await sock.sendMessage(
        msg.jid,
        { image: result.data.buffer, caption: `✅ Upscaled ${result.data.scale}x (${result.data.server})` },
        { quoted: msg.raw },
      );
    } catch (e: unknown) {
      const error = e as Error;
      await msg.reply(`❌ Gagal: ${error.message}`);
    }
  },
});
