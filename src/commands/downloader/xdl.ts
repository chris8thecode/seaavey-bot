import { api } from "@/api";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "xdl",
  description: "Download media dari X/Twitter",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL X/Twitter.\nContoh: .xdl https://x.com/...");
    await msg.reply("⏳ Downloading...");
    const res = await api.get<{ url: string }>(`/downloader/x?url=${encodeURIComponent(url)}`);
    await msg.send({ video: { url: res.data.url } });
  },
});
