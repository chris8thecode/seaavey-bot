import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { setXp } from "@/infra/database";
import { getNumber } from "@/utils/helper";

export default defineCommand({
  name: "SetXP",
  alias: ["setxp"],
  description: t("owner.setxp.desc"),
  ownerOnly: true,
  handler: async (_sock, msg) => {
    const target = msg.quoted?.sender || msg.mentioned[0];
    const xp = Number.parseInt(msg.args[1] || msg.args[0] || "0", 10);

    if (!target || Number.isNaN(xp)) {
      return msg.reply(t("owner.setxp.format"));
    }

    setXp(target, xp);
    await msg.reply(t("owner.setxp.success", { target: getNumber(target), xp: String(xp) }));
  },
});
