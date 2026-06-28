import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Cuaca",
  alias: ["cuaca"],
  description: t("info.cuaca.desc"),
  handler: async (_sock, msg) => {
    const city = msg.args.join(" ");
    if (!city) return msg.reply(t("info.cuaca.format"));
    await msg.reply(t("info.cuaca.checking"));
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
    if (!data) return msg.reply(t("info.cuaca.notFound"));
    const cur = data.current_condition?.[0];
    const area = data.nearest_area?.[0];
    if (!cur) return msg.reply(t("info.cuaca.noData"));
    await msg.reply(
      t("info.cuaca.weather", {
        city: area?.areaName[0]?.value || city,
        country: area?.country[0]?.value || "",
        temp: cur.temp_C,
        condition: cur.weatherDesc[0]?.value,
        humidity: cur.humidity,
        wind: cur.windspeedKmph,
      }),
    );
  },
});
