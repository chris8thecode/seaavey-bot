import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { commands } from "@/infra/loader";

export default defineCommand({
  name: "Total Fitur",
  alias: ["features", "totalfitur"],
  description: t("general.totalfitur.desc"),
  handler: async (_sock, msg) => {
    await msg.reply(t("general.totalfitur.count", { count: String(commands.size) }));
  },
});
