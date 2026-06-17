import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Cuaca",
  alias: ["cuaca"],
  description: "Cek cuaca suatu kota. Contoh: .cuaca Jakarta",
  handler: async (_sock, msg) => {
    const city = msg.args.join(" ");
    if (!city) return msg.reply("Format: .cuaca <nama kota>\nContoh: .cuaca Jakarta");
    const data = await safeFetchJSON<{
      current_condition?: Array<{
        temp_C: string;
        weatherDesc: Array<{ value: string }>;
        humidity: string;
        windspeedKmph: string;
      }>;
      nearest_area?: Array<{
        areaName: Array<{ value: string }>;
        country: Array<{ value: string }>;
      }>;
    }>(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    if (!data) return msg.reply("❌ Kota tidak ditemukan.");
    const cur = data.current_condition?.[0];
    const area = data.nearest_area?.[0];
    if (!cur) return msg.reply("❌ Data cuaca tidak tersedia.");
    await msg.reply(
      `🌤️ *Cuaca ${area?.areaName[0]?.value || city}, ${area?.country[0]?.value || ""}*\n\n🌡️ Suhu: ${cur.temp_C}°C\n☁️ Kondisi: ${cur.weatherDesc[0]?.value}\n💧 Kelembaban: ${cur.humidity}%\n💨 Angin: ${cur.windspeedKmph} km/h`,
    );
  },
});
