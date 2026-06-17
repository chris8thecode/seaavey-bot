import { defineCommand } from "@/core/types";
import { fsaver } from "@/infra/scrapers";

export default defineCommand({
  name: "Facebook DL",
  alias: ["facebookdl"],
  description: "Download video dari Facebook via fsaver.net",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL Facebook.\nContoh: .fbdl https://fb.watch/...");

    await msg.reply("⏳ Downloading...");

    const result = await fsaver(url);

    if (!result.status) {
      return msg.reply(`❌ Gagal: ${result.error || "Tidak ada media ditemukan"}`);
    }

    const best = result.data.at(0);
    if (!best) return msg.reply("❌ Gagal: Tidak ada link download ditemukan.");

    await msg.send({
      video: { url: best.url },
      caption: best.title || "",
    });
  },
});
