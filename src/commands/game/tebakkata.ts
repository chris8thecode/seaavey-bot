import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TBKData {
  word: string;
}

function shuffle(word: string): string {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

const { command, checkAnswer } = createWordGame<TBKData>({
  name: "Tebak Kata",
  triggers: ["tebakkata", "tbk"],
  description: t("game.tebakkata.desc"),
  dataFile: "tebakkata.json",
  emoji: "🔤",
  reward: 20,
  question: (item) => {
    let s = shuffle(item.word);
    while (s === item.word) s = shuffle(item.word);
    return `${t("game.tebakkata.question")}\n\n*${s.toUpperCase()}*`;
  },
  answer: (item) => item.word,
  correctMessage: (item, _ans) => t("game.tebakkata.correct", { answer: item.word }),
});

export default command;
export const checkTebakKata = checkAnswer;
