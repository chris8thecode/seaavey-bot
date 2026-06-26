import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Decode",
  alias: ["dec", "decode"],
  description: t("converter.decode.desc"),
  handler: async (_sock, msg) => {
    const text = msg.args.join(" ");
    if (!text) return msg.reply("Format: .decode <base64>");
    try {
      await msg.reply(`🔓 *Base64 Decode:*\n\n${Buffer.from(text, "base64").toString("utf-8")}`);
    } catch {
      await msg.reply("❌ Input is not valid Base64.");
    }
  },
});
