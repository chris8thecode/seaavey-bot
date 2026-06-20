import { defineCommand } from "@/core/types";
import { soundcloudSearch } from "@/infra/scrapers";

export default defineCommand({
  name: "SoundCloud",
  alias: ["sc", "soundcloud"],
  description: "Cari lagu di SoundCloud. Contoh: .soundcloud lofi beats",
  handler: async (_sock, msg) => {
    const query = msg.args.join(" ");
    if (!query) return msg.reply("Format: .soundcloud <kata kunci>");

    await msg.reply("🔍 Mencari...");

    const result = await soundcloudSearch(query, 5);

    if (!result.status) {
      return msg.reply(`❌ Gagal: ${result.error || "Tidak ditemukan"}`);
    }

    if (result.data.tracks.length === 0) {
      return msg.reply("❌ Tidak ditemukan.");
    }

    const list = result.data.tracks
      .map((s, i) => `${i + 1}. *${s.title}*\n   🎤 ${s.artist} • ⏱️ ${s.duration}\n   🔗 ${s.url}`)
      .join("\n\n");

    await msg.reply(`🎶 *SoundCloud Search*\n\n${list}\n\nDownload: .scdl <url>`);
  },
});
