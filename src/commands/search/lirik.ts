import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { geniusSearch } from "@/infra/scrapers";

export default defineCommand({
  name: "Lirik",
  alias: ["lirik"],
  description: t("search.lirik.desc"),
  handler: async (_sock, msg) => {
    const query = msg.args.join(" ");
    if (!query) return msg.reply(t("search.lirik.format"));
    await msg.reply(t("search.lirik.searching"));
    const res = await geniusSearch(query, 5);
    if (!res.status) return msg.reply(`❌ ${res.error}`);
    const list = res.data
      .map(
        (s, i) =>
          `${i + 1}. *${s.title}* — ${s.artist}${s.album ? ` (${s.album}${s.year ? `, ${s.year}` : ""})` : ""}`,
      )
      .join("\n");
    await msg.reply(t("search.lirik.result", { list }));
  },
});
