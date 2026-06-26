import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TebakKalimatData {
  soal: string;
  jawaban: string;
}

const { command, checkAnswer } = createWordGame<TebakKalimatData>({
  name: "Tebak Kalimat",
  triggers: ["tebakkalimat", "tblm"],
  description: t("game.tebakkalimat.desc"),
  dataFile: "tebakkalimat.json",
  emoji: "📖",
  reward: 15,
  question: (item) => `Kalimat: ${item.soal}`,
  answer: (item) => item.jawaban,
});

export default command;
export const checkTebakKalimat = checkAnswer;
