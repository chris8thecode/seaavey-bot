import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TTData {
  soal: string;
  jawaban: string;
}

const { command, checkAnswer } = createWordGame<TTData>({
  name: "Teka Teki",
  triggers: ["tekateki", "tt"],
  description: t("game.tekateki.desc"),
  dataFile: "tekateki.json",
  emoji: "🧩",
  reward: 15,
  question: (item) => `Soal: ${item.soal}`,
  answer: (item) => item.jawaban,
  correctMessage: (_item, _ans) => t("game.tekateki.correct"),
});

export default command;
export const checkTekaTeki = checkAnswer;
