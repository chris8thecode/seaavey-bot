import { defineCommand } from "@/core/types";
import { sswebDl } from "@/infra/scrapers";

export default defineCommand({
  name: "SS Web",
  alias: ["ssweb"],
  description: "Screenshot website. Contoh: .ssweb https://google.com",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    const mode = (msg.args[1] as "desktop" | "mobile") || "desktop";
    if (!url)
      return msg.reply("Format: .ssweb <url> [desktop|mobile]\nContoh: .ssweb https://google.com");
    await msg.reply("📸 Capturing...");
    const res = await sswebDl(url, mode === "mobile" ? "mobile" : "desktop");
    if (!res.status) return msg.reply(`❌ ${res.error}`);
    await msg.send({ image: { url: res.data.url }, caption: `🌐 ${url}` });
  },
});
