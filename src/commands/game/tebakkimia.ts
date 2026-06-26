import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TebakKimiaData {
  unsur: string;
  lambang: string;
}

const { command, checkAnswer } = createWordGame<TebakKimiaData>({
  name: "Tebak Kimia",
  triggers: ["tebakkimia", "tbkm"],
  description: t("game.tebakkimia.desc"),
  dataFile: "tebakkimia.json",
  emoji: "⚗️",
  reward: 15,
  question: (item) => `Unsur: *${item.unsur}*\n\nKetik lambang unsurnya!`,
  answer: (item) => item.lambang,
  timeoutMessage: (item, ans) => t("game.tebakkimia.timeout", { answer: ans, name: item.unsur }),
  correctMessage: (item, ans) =>
    t("game.tebakkimia.correct", { name: item.unsur, answer: ans.toUpperCase() }),
});

export default command;
export const checkTebakKimia = checkAnswer;
