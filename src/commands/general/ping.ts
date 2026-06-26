import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Ping",
  alias: ["ping"],
  description: t("general.ping.desc"),
  handler: async (_sock, msg) => {
    const start = Date.now();
    await msg.reply(`🏓 Pong! ${Date.now() - start}ms`);
  },
});
