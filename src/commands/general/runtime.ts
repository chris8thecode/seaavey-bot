import { defineCommand } from "@/core/types";
import { formatTime } from "@/utils/helper";
import { t } from "@/core/translations";

const startTime = Date.now();

export default defineCommand({
  name: "Runtime",
  alias: ["run", "runtime"],
  description: t("general.runtime.desc"),
  handler: async (_sock, msg) => {
    const ms = Date.now() - startTime;
    await msg.reply(`⏱️ Uptime: ${formatTime(ms / 1000)}`);
  },
});
