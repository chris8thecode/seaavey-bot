import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Short",
  alias: ["short"],
  description: "Perpendek URL. Contoh: .short https://google.com",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply(t("tools.short.format"));
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const short = await res.text();
    if (!short.startsWith("http")) return msg.reply(t("tools.short.invalid"));
    await msg.reply(t("tools.short.result", { short }));
  },
});
