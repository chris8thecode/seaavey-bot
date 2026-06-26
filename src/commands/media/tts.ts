import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "TTS",
  alias: ["tts"],
  description: t("media.tts.desc"),
  handler: async (_sock, msg) => {
    const text = msg.args.join(" ");
    if (!text) return msg.reply(t("media.tts.format"));
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=tw-ob`;
    await msg.send({ audio: { url }, mimetype: "audio/mpeg", ptt: true });
  },
});
