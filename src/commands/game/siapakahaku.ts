import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface SAHData {
  soal: string;
  jawaban: string;
}

const { command, checkAnswer } = createWordGame<SAHData>({
  name: "Siapakah Aku",
  triggers: ["siapakahaku", "sah", "siapa"],
  description: t("game.siapakahaku.desc"),
  dataFile: "siapakahaku.json",
  emoji: "🕵️",
  reward: 15,
  question: (item) => `Soal: ${item.soal}`,
  answer: (item) => item.jawaban,
  correctMessage: (item, _ans) => t("game.siapakahaku.correct", { answer: item.jawaban }),
});

export default command;
export const checkSiapakahAku = checkAnswer;
