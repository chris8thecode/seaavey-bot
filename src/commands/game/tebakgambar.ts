import { createWordGame } from "@/game/word-game-factory";

interface TBGData {
  img: string;
  jawaban: string;
  deskripsi: string;
}

const { command, checkAnswer } = createWordGame<TBGData>({
  name: "Tebak Gambar",
  triggers: ["tebakgambar", "tbg"],
  description: "Tebak gambar yang dikirim bot",
  dataFile: "tebakgambar.json",
  emoji: "🖼️",
  reward: 20,
  question: (item) => `Clue: ${item.deskripsi}`,
  answer: (item) => item.jawaban,
  image: (item) => item.img,
  timeoutMessage: (item, _ans) =>
    `⏰ Waktu habis!\n\nJawabannya: *${item.jawaban}*\nDeskripsi: ${item.deskripsi}`,
  correctMessage: (item, _ans) => `✅ Benar! Jawabannya *${item.jawaban}* (+20 XP)`,
});

export default command;
export const checkTebakGambar = checkAnswer;
