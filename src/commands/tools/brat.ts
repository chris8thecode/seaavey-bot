import { defineCommand } from "@/core/types";
import { imageToSticker } from "@/utils/convert";

export default defineCommand({
  name: "Brat",
  alias: ["brat"],
  description: "Generate brat sticker/image",
  handler: async (_sock, msg) => {
    const text = msg.args.join(" ");
    if (!text) return msg.reply("Contoh: .brat anjayy kokk gini cik");

    await msg.reply("⏳ Generating brat...");

    try {
      const url = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal mengambil data dari API");

      const buffer = Buffer.from(await response.arrayBuffer());

      // Option to send as sticker or image
      // Default to sticker as requested (implied by "brat" usage)
      const sticker = await imageToSticker(buffer, { pack: "SeaaveyBot", author: "Seaavey" });
      await msg.send({ sticker });
    } catch (e: unknown) {
      const error = e as Error;
      await msg.reply(`❌ Error: ${error.message}`);
    }
  },
});
