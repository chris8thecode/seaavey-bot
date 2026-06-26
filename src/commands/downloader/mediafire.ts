import { defineCommand } from "@/core/types";
import { mediafireDl } from "@/infra/scrapers";
import { t } from "@/core/translations";

export default defineCommand({
  name: "MediaFire",
  alias: ["mf", "mediafire"],
  description: t("downloader.mediafire.desc"),
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url)
      return msg.reply("Send a Mediafire URL.\nExample: .mediafire https://mediafire.com/file/...");
    await msg.reply("⏳ Downloading...");
    const res = await mediafireDl(url);
    if (!res.status) return msg.reply(`❌ ${res.error}`);
    await msg.send({
      document: { url: res.data.url },
      mimetype: "application/octet-stream",
      fileName: res.data.filename,
    });
  },
});
