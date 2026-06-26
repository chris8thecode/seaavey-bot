import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TebakLirikData {
  soal: string;
  jawaban: string;
}

const { command, checkAnswer } = createWordGame<TebakLirikData>({
  name: "Tebak Lirik",
  triggers: ["tebaklirik", "tblr"],
  description: t("game.tebaklirik.desc"),
  dataFile: "tebaklirik.json",
  emoji: "🎵",
  reward: 15,
  question: (item) => `Lirik: ${item.soal}`,
  answer: (item) => item.jawaban,
});

export default command;
export const checkTebakLirik = checkAnswer;
