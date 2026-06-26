import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Emoji Mix",
  alias: ["emix", "emojimix"],
  description: t("fun.emojimix.description"),
  handler: async (_sock, msg) => {
    const text = msg.args.join(" ");
    const match = text.match(/(.+)\+(.+)/);
    if (!match) return msg.reply(t("fun.emojimix.format"));
    const [, e1, e2] = match;
    const code1 = [...(e1?.trim() || "")].map((c) => c.codePointAt(0)?.toString(16)).join("-");
    const code2 = [...(e2?.trim() || "")].map((c) => c.codePointAt(0)?.toString(16)).join("-");
    const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${code1}/u${code1}_u${code2}.png`;
    const data = await safeFetchJSON(url);
    if (data === null) return msg.reply(t("fun.emojimix.notAvailable"));
    await msg.send({ sticker: { url } });
  },
});
