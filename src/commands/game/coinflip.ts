import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";

export default defineCommand({
  name: "Coin Flip",
  alias: ["cf", "flip", "coinflip"],
  description: t("game.coinflip.desc"),
  handler: async (_sock, msg) => {
    const input = msg.args[0]?.toLowerCase();
    if (!input || (input !== "heads" && input !== "tails")) {
      return msg.reply(t("game.coinflip.example"));
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const emoji = result === "heads" ? "🪙" : "💫";

    if (input === result) {
      addXp(msg.sender, 5);
      await msg.reply(t("game.coinflip.win", { emoji, result: result.toUpperCase() }));
    } else {
      await msg.reply(t("game.coinflip.lose", { emoji, result: result.toUpperCase(), input }));
    }
  },
});
