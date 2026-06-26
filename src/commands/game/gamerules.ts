import { t } from "@/core/translations";
import { config } from "@/core/config";
import { defineCommand } from "@/core/types";

const p = config.prefix[0];

export default defineCommand({
  name: "Game Rules",
  alias: ["grules", "gamerules"],
  description: t("game.rules.desc"),
  handler: async (_sock, msg) => {
    const text = [
      t("game.rules.title"),
      "",
      t("game.rules.math", { p }),
      "",
      t("game.rules.tebakkata", { p }),
      "",
      t("game.rules.trivia", { p }),
      "",
      t("game.rules.tebakbendera", { p }),
      "",
      t("game.rules.tebakgambar", { p }),
      "",
      t("game.rules.family100", { p }),
      "",
      t("game.rules.tebakangka", { p }),
      "",
      t("game.rules.quiz", { p }),
      "",
      t("game.rules.hangman", { p }),
      "",
      t("game.rules.tictactoe", { p }),
      "",
      t("game.rules.wordchain", { p }),
      "",
      t("game.rules.susunkata", { p }),
      "",
      t("game.rules.tebakkabupaten", { p }),
      "",
      t("game.rules.tebakkalimat", { p }),
      "",
      t("game.rules.tebakkimia", { p }),
      "",
      t("game.rules.tebaktebakan", { p }),
      "",
      t("game.rules.tebaklirik", { p }),
      "",
      t("game.rules.quickgames", { p }),
      "",
      t("game.rules.tips", { p }),
    ].join("\n");

    await msg.reply(text);
  },
});
