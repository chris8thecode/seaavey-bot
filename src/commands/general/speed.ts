import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Speed",
  alias: ["spd", "speed"],
  description: t("general.speed.desc"),
  handler: async (_sock, msg) => {
    const start = Date.now();
    await msg.reply("🏓 Testing...");
    const latency = Date.now() - start;
    await msg.reply(`⚡ *Speed Test*\n\nResponse: ${latency}ms`);
  },
});
