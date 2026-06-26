import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { getNumber, getRandomNumber } from "@/utils/helper";
export default defineCommand({
  name: "Ship",
  alias: ["ship"],
  description: t("fun.ship.description"),
  handler: async (_sock, msg) => {
    const a = msg.mentioned[0];
    const b = msg.mentioned[1];
    if (!a || !b) return msg.reply(t("fun.ship.format"));
    const pct = getRandomNumber(0, 100);
    const bar = "❤️".repeat(Math.floor(pct / 10)) + "🖤".repeat(10 - Math.floor(pct / 10));
    let verdict = t("fun.ship.veryLow");
    if (pct > 80) verdict = t("fun.ship.veryHigh");
    else if (pct > 60) verdict = t("fun.ship.high");
    else if (pct > 40) verdict = t("fun.ship.medium");
    else if (pct > 20) verdict = t("fun.ship.low");
    await msg.send({
      text: t("fun.ship.result", { userA: getNumber(a), userB: getNumber(b), bar, pct, verdict }),
      mentions: [a, b],
    });
  },
});
