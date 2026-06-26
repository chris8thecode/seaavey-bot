import { downloadMediaMessage } from "baileys";
import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "OCR",
  alias: ["ocr"],
  description: t("media.ocr.desc"),
  handler: async (sock, msg) => {
    const imgMsg = msg.message?.imageMessage || msg.quoted?.imageMessage;
    if (!imgMsg) return msg.reply(t("media.ocr.noImage"));
    await msg.reply(t("media.ocr.reading"));
    const buffer = await downloadMediaMessage(
      { message: { imageMessage: imgMsg }, key: msg.key },
      "buffer",
      { host: "mmg.whatsapp.net" },
    );
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: "image/png" }), "image.png");
    form.append("apikey", "K89642968388957");
    form.append("language", "ind");
    const res = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: form });
    const data = (await res.json()) as { ParsedResults?: Array<{ ParsedText: string }> };
    const text = data.ParsedResults?.[0]?.ParsedText;
    if (!text) return msg.reply(t("media.ocr.noText"));
    await msg.reply(t("media.ocr.result", { text }));
  },
});
