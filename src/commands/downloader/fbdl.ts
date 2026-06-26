import { defineCommand } from "@/core/types";
import { fsaver } from "@/infra/scrapers";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Facebook DL",
  alias: ["facebookdl"],
  description: t("downloader.fbdl.desc"),
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Send a Facebook URL.\nExample: .fbdl https://fb.watch/...");

    await msg.reply("⏳ Downloading...");

    const result = await fsaver(url);

    if (!result.status) {
      return msg.reply(`❌ Failed: ${result.error || "No media found"}`);
    }

    const best = result.data.at(0);
    if (!best) return msg.reply("❌ Failed: No download link found.");

    await msg.send({
      video: { url: best.url },
      caption: best.title || "",
    });
  },
});
