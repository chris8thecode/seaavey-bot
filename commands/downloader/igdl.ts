import { api } from "@/api";
import { defineCommand } from "@/types";

interface IGData {
  url: string;
  type: string;
}

export default defineCommand({
  name: "igdl",
  description: "Download media dari Instagram",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL Instagram.\nContoh: .igdl https://instagram.com/p/...");
    await msg.reply("⏳ Downloading...");
    const res = await api.get<IGData[]>(`/downloader/instagram?url=${encodeURIComponent(url)}`);
    for (const media of res.data) {
      if (media.type === "video") {
        await msg.send({ video: { url: media.url } });
      } else {
        await msg.send({ image: { url: media.url } });
      }
    }
  },
});
