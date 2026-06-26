import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TebakKabupatenData {
  title: string;
  url: string;
}

const { command, checkAnswer } = createWordGame<TebakKabupatenData>({
  name: "Tebak Kabupaten",
  triggers: ["tebakkabupaten", "tbkp"],
  description: t("game.tebakkabupaten.desc"),
  dataFile: "tebakkabupaten.json",
  emoji: "🏛️",
  reward: 20,
  question: (_item) => t("game.tebakkabupaten.question"),
  answer: (item) => item.title.replace(/^(Kabupaten|Kota)\s*/i, ""),
  image: (item) => item.url,
  timeoutMessage: (item) => t("game.tebakkabupaten.timeout", { answer: item.title }),
  correctMessage: (item, _ans) => t("game.tebakkabupaten.correct", { answer: item.title }),
});

export default command;
export const checkTebakKabupaten = checkAnswer;
