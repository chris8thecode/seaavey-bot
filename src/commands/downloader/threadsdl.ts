import { defineCommand } from "@/core/types";
import { api } from "@/infra/api";

export default defineCommand({
  name: "Threads DL",
  alias: ["tdl"],
  description: "Download media dari Threads",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL Threads.\nContoh: .threadsdl https://threads.net/...");
    await msg.reply("⏳ Downloading...");
    const res = await api.get<{ url: string }>(
      `/downloader/threads?url=${encodeURIComponent(url)}`,
    );
    await msg.send({ video: { url: res.data.url } });
  },
});
