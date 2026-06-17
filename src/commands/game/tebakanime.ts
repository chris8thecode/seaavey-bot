import { createWordGame } from "@/game/word-game-factory";

interface AnimeData {
  img: string;
  jawaban: string;
  karakter?: string;
}

const { command, checkAnswer } = createWordGame<AnimeData>({
  name: "Tebak Anime",
  triggers: ["tebakanime", "tba"],
  description: "Tebak judul anime dari gambar (Ketik 'hint' untuk bantuan)",
  dataFile: "tebakanime.json",
  emoji: "🎌",
  reward: 15,
  question: (item) => `Anime apa ini?${item.karakter ? `\n\nKarakter: ${item.karakter}` : ""}`,
  answer: (item) => item.jawaban,
  image: (item) => item.img,
  timeoutMessage: (item, _ans) =>
    item.karakter
      ? `⏰ Habis! Jawabannya: *${item.jawaban}* (${item.karakter})`
      : `⏰ Habis! Jawabannya: *${item.jawaban}*`,
  correctMessage: (item, _ans) => `✅ Benar! Judulnya *${item.jawaban}* (+15 XP)`,
});

export default command;
export const checkTebakAnime = checkAnswer;
