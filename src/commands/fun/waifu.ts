import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Waifu",
  alias: ["waifu"],
  description: "Random gambar anime waifu",
  handler: async (_sock, msg) => {
    const data = await safeFetchJSON<{ url?: string }>("https://api.waifu.pics/sfw/waifu");
    if (!data?.url) return msg.reply("❌ Gagal mengambil gambar.");
    await msg.send({ image: { url: data.url }, caption: "🌸 Random Waifu" });
  },
});
