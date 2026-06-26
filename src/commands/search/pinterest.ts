import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { pinterestSearch } from "@/infra/scrapers";

export default defineCommand({
  name: "Pinterest",
  alias: ["pin", "pinterest"],
  description: t("search.pinterest.desc"),
  handler: async (_sock, msg) => {
    const query = msg.args.join(" ");
    if (!query) return msg.reply(t("search.pinterest.format"));
    await msg.reply(t("search.pinterest.searching"));
    const res = await pinterestSearch(query, 5);
    if (!res.status) return msg.reply(`❌ ${res.error}`);
    if (!res.data.length) return msg.reply(t("search.pinterest.noResult"));
    for (const pin of res.data) {
      await msg.send({ image: { url: pin.image }, caption: pin.title || "" });
    }
  },
});
