import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Encode",
  alias: ["enc", "encode"],
  description: t("converter.encode.desc"),
  handler: async (_sock, msg) => {
    const text = msg.args.join(" ");
    if (!text) return msg.reply("Format: .encode <text>");
    await msg.reply(`🔐 *Base64 Encode:*\n\n${Buffer.from(text).toString("base64")}`);
  },
});
