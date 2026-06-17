import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Jadwal Sholat",
  alias: ["sholat", "jadwal", "jadwalsholat"],
  description: "Jadwal sholat hari ini. Contoh: .jadwalsholat Jakarta",
  handler: async (_sock, msg) => {
    const city = msg.args.join(" ");
    if (!city) return msg.reply("Format: .jadwalsholat <kota>\nContoh: .jadwalsholat Jakarta");
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
    const data = await safeFetchJSON<{
      data?: { timings?: Record<string, string> };
    }>(
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=Indonesia&method=20`,
    );
    const t = data?.data?.timings;
    if (!t) return msg.reply("❌ Kota tidak ditemukan.");
    await msg.reply(
      `🕌 *Jadwal Sholat — ${city}*\n📅 ${date}\n\n🌅 Subuh: ${t.Fajr}\n🌄 Terbit: ${t.Sunrise}\n☀️ Dzuhur: ${t.Dhuhr}\n🌤️ Ashar: ${t.Asr}\n🌅 Maghrib: ${t.Maghrib}\n🌙 Isya: ${t.Isha}`,
    );
  },
});
