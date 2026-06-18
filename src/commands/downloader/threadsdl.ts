import { defineCommand } from "@/core/types";
import { threadsDl } from "@/infra/scrapers";

export default defineCommand({
  name: "Threads DL",
  alias: ["tdl", "threadsdl"],
  description: "Download media dari Threads",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL Threads.\nContoh: .tdl https://threads.net/...");

    await msg.reply("⏳ Downloading...");

    const result = await threadsDl(url);

    if (!result.status) {
      return msg.reply(`❌ Gagal: ${result.error || "Tidak ada media ditemukan"}`);
    }

    for (const media of result.data) {
      const isVideo = media.type === "video";
      await msg.send(isVideo ? { video: { url: media.url } } : { image: { url: media.url } });
    }
  },
});
