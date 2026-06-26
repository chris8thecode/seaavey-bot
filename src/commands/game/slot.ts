import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem } from "@/utils/helper";

const symbols = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎"];

export default defineCommand({
  name: "Slot",
  alias: ["slot"],
  description: t("game.slot.desc"),
  handler: async (_sock, msg) => {
    const s1 = getRandomItem(symbols);
    const s2 = getRandomItem(symbols);
    const s3 = getRandomItem(symbols);

    let result: string;
    if (s1 === s2 && s2 === s3) {
      const xp = s1 === "💎" ? 50 : 25;
      addXp(msg.sender, xp);
      result = t("game.slot.jackpot", { xp });
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      addXp(msg.sender, 5);
      result = t("game.slot.twoMatch");
    } else {
      result = t("game.slot.lose");
    }

    await msg.reply(t("game.slot.result", { s1, s2, s3, result }));
  },
});
