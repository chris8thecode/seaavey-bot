import { api } from "@/api";
import { defineCommand } from "@/types";

interface FBData {
  url: string;
  title: string;
}

export default defineCommand({
  name: "fbdl",
  description: "Download video dari Facebook",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL Facebook.\nContoh: .fbdl https://fb.watch/...");
    await msg.reply("⏳ Downloading...");
    const res = await api.get<FBData>(`/downloader/facebook?url=${encodeURIComponent(url)}`);
    await msg.send({ video: { url: res.data.url }, caption: res.data.title });
  },
});
