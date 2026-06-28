import { t } from "@/core/translations";
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
  description: t("info.gempa.desc"),
  handler: async (_sock, msg) => {
    await msg.reply(t("info.gempa.searching"));
    const data = await safeFetchJSON<{ Infogempa?: { gempa?: Gempa } }>(
      "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json",
    );
    const g = data?.Infogempa?.gempa;
    if (!g) return msg.reply(t("info.gempa.noData"));
    const caption = t("info.gempa.detail", {
      date: g.Tanggal,
      time: g.Jam,
      magnitude: g.Magnitude,
      depth: g.Kedalaman,
      region: g.Wilayah,
      potential: g.Potensi,
    });
    await msg.send({
      image: { url: `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}` },
      caption,
    });
  },
});
