import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomNumber } from "@/utils/helper";
export default defineCommand({
  name: "Dice",
  alias: ["dice"],
  description: t("game.dice.desc"),
  handler: async (_sock, msg) => {
    const guess = Number(msg.args[0]);
    if (!guess || guess < 1 || guess > 6) {
      return msg.reply(t("game.dice.example"));
    }

    const result = getRandomNumber(1, 6);

    if (guess === result) {
      addXp(msg.sender, 15);
      await msg.reply(t("game.dice.win", { result }));
    } else {
      await msg.reply(t("game.dice.lose", { result, guess }));
    }
  },
});
