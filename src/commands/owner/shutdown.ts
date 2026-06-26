import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Shutdown",
  alias: ["off", "shutdown"],
  description: t("owner.shutdown.desc"),
  ownerOnly: true,
  handler: async (_sock, msg) => {
    await msg.reply("👋 Bot mati...");
    process.exit(0);
  },
});
