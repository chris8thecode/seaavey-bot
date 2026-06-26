import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { setAfk } from "@/infra/database";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "AFK",
  alias: ["afk"],
  description: t("productivity.afk.desc"),
  handler: async (_sock, msg) => {
    const reason = msg.args.join(" ") || t("productivity.afk.noReason");
    setAfk(msg.sender, reason);
    await msg.reply(t("productivity.afk.set", { user: getNumber(msg.sender), reason }));
  },
});
