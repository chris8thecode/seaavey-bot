import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TebakTebakanData {
  soal: string;
  jawaban: string;
}

const { command, checkAnswer } = createWordGame<TebakTebakanData>({
  name: "Tebak Tebakan",
  triggers: ["tebaktebakan", "tbtb"],
  description: t("game.tebaktebakan.desc"),
  dataFile: "tebaktebakan.json",
  emoji: "😂",
  reward: 15,
  question: (item) => `Soal: ${item.soal}`,
  answer: (item) => item.jawaban,
});

export default command;
export const checkTebakTebakan = checkAnswer;
