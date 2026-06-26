import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Calc",
  alias: ["calc"],
  description: t("tools.calc.desc"),
  handler: async (_sock, msg) => {
    const expr = msg.args.join(" ");
    if (!expr) return msg.reply(t("tools.calc.format"));
    if (!/^[\d\s+\-*/().%^]+$/.test(expr)) return msg.reply(t("tools.calc.invalid"));
    try {
      const result = Function(`"use strict"; return (${expr.replace(/\^/g, "**")})`)();
      await msg.reply(t("tools.calc.result", { expr, result: String(result) }));
    } catch {
      await msg.reply(t("tools.calc.invalid"));
    }
  },
});
