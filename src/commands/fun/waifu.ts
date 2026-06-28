import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Waifu",
  alias: ["waifu"],
  description: t("fun.waifu.description"),
  handler: async (_sock, msg) => {
    const data = await safeFetchJSON<{ url?: string }>("https://api.waifu.pics/sfw/waifu");
    if (!data?.url) return msg.reply(t("fun.waifu.error"));
    await msg.reply(t("fun.waifu.processing"));
    await msg.send({ image: { url: data.url }, caption: t("fun.waifu.caption") });
  },
});
