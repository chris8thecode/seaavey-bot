import { defineCommand } from "@/core/types";
import { twitterDl } from "@/infra/scrapers";

export default defineCommand({
  name: "X (Twitter) DL",
  alias: ["xdl", "x(twitter)dl"],
  description: "Download media dari X/Twitter",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL Twitter/X.\nContoh: .xdl https://x.com/user/status/...");
    if (!url.includes("x.com") && !url.includes("twitter.com"))
      return msg.reply("❌ URL harus dari X/Twitter");
    await msg.reply("⏳ Downloading...");
    const res = await twitterDl(url);
    if (!res.status) return msg.reply(`❌ ${res.error}`);
    const { video, photo, title, author } = res.data;
    if (video) {
      await msg.send({
        video: { url: video },
        caption: `🐦 ${author ? `@${author}` : ""}${title ? ` — ${title}` : ""}`,
      });
    } else if (photo) {
      await msg.send({
        image: { url: photo },
        caption: `🐦 ${author ? `@${author}` : ""}${title ? ` — ${title}` : ""}`,
      });
    } else {
      await msg.reply("❌ Tidak ada media yang ditemukan di tweet ini");
    }
  },
});
