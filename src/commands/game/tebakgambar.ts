import { t } from "@/core/translations";
import { createWordGame } from "@/game/word-game-factory";

interface TBGData {
  img: string;
  jawaban: string;
  deskripsi: string;
}

const { command, checkAnswer } = createWordGame<TBGData>({
  name: "Tebak Gambar",
  triggers: ["tebakgambar", "tbg"],
  description: t("game.tebakgambar.desc"),
  dataFile: "tebakgambar.json",
  emoji: "🖼️",
  reward: 20,
  question: (item) => `Clue: ${item.deskripsi}`,
  answer: (item) => item.jawaban,
  image: (item) => item.img,
  timeoutMessage: (item, _ans) =>
    t("game.tebakgambar.timeout", { answer: item.jawaban, description: item.deskripsi }),
  correctMessage: (item, _ans) => t("game.tebakgambar.correct", { answer: item.jawaban }),
});

export default command;
export const checkTebakGambar = checkAnswer;
