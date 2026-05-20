import { defineCommand } from "@/core/types";
import { api } from "@/infra/api";

export default defineCommand({
  name: "X (Twitter) DL",
  alias: ["x(twitter)dl"],
  description: "Download media dari X/Twitter",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL X/Twitter.\nContoh: .xdl https://x.com/...");
    await msg.reply("⏳ Downloading...");
    const res = await api.get<{ url: string }>(`/downloader/x?url=${encodeURIComponent(url)}`);
    await msg.send({ video: { url: res.data.url } });
  },
});
