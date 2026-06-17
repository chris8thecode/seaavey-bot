import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

export default defineCommand({
  name: "Translate",
  alias: ["tr", "translate"],
  description: "Terjemahkan teks. Contoh: .translate en Halo dunia",
  handler: async (_sock, msg) => {
    const lang = msg.args[0];
    const text = msg.args.slice(1).join(" ");
    if (!lang || !text)
      return msg.reply(
        "Format: .translate <kode_bahasa> <teks>\nContoh: .translate en Apa kabar?\n\nKode: id, en, ja, ko, ar, zh, fr, de, es",
      );
    const data = await safeFetchJSON<{ responseData?: { translatedText?: string } }>(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`,
    );
    const translated = data?.responseData?.translatedText;
    if (!translated) return msg.reply("❌ Gagal menerjemahkan.");
    await msg.reply(`🌐 *Translate* → ${lang.toUpperCase()}\n\n${translated}`);
  },
});
