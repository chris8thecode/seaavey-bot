import { defineCommand } from "@/core/types";
import { api } from "@/infra/api";

export default defineCommand({
  name: "Spotify",
  alias: ["spot", "spotify"],
  description: "Download lagu dari Spotify",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url)
      return msg.reply("Kirim URL Spotify.\nContoh: .spotify https://open.spotify.com/track/...");
    await msg.reply("⏳ Downloading...");
    const res = await api.get<{ title: string; url: string }>(
      `/downloader/spotify?url=${encodeURIComponent(url)}`,
    );
    await msg.send({ audio: { url: res.data.url }, mimetype: "audio/mpeg" });
  },
});
