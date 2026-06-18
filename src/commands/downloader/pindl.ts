import { defineCommand } from "@/core/types";
import { pinterestDl } from "@/infra/scrapers";

export default defineCommand({
  name: "Pinterest DL",
  alias: ["pindl", "pinterestdl"],
  description: "Download media dari Pinterest",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) {
      return msg.reply("Kirim URL Pinterest.\nContoh: .pindl https://pin.it/xxxxx");
    }

    await msg.reply("⏳ Downloading...");
    const res = await pinterestDl(url);
    if (!res.status) return msg.reply(`❌ ${res.error}`);

    const pin = res.data;
    await msg.send({
      image: { url: pin.image },
      caption: pin.title || "",
    });
  },
});
