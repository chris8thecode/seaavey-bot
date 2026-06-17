import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

interface Gempa {
  Tanggal: string;
  Jam: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Shakemap: string;
}

export default defineCommand({
  name: "Gempa",
  alias: ["gempa"],
  description: "Info gempa terkini dari BMKG",
  handler: async (_sock, msg) => {
    const data = await safeFetchJSON<{ Infogempa?: { gempa?: Gempa } }>(
      "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json",
    );
    const g = data?.Infogempa?.gempa;
    if (!g) return msg.reply("❌ Data gempa tidak tersedia.");
    const caption = `🌍 *Info Gempa Terkini*\n\n📅 ${g.Tanggal} ${g.Jam}\n📏 Magnitudo: ${g.Magnitude}\n📐 Kedalaman: ${g.Kedalaman}\n📍 Wilayah: ${g.Wilayah}\n⚠️ Potensi: ${g.Potensi}`;
    await msg.send({
      image: { url: `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}` },
      caption,
    });
  },
});
