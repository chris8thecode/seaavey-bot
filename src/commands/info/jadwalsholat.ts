import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Jadwal Sholat",
  alias: ["sholat", "jadwal", "jadwalsholat"],
  description: t("info.jadwalsholat.desc"),
  handler: async (_sock, msg) => {
    const city = msg.args.join(" ");
    if (!city) return msg.reply(t("info.jadwalsholat.format"));
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
    const data = await safeFetchJSON<{
      data?: { timings?: Record<string, string> };
    }>(
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=Indonesia&method=20`,
    );
    const timings = data?.data?.timings;
    if (!timings) return msg.reply(t("info.jadwalsholat.notFound"));
    await msg.reply(
      t("info.jadwalsholat.schedule", {
        city,
        date,
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
      }),
    );
  },
});
