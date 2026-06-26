import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { removeWarns } from "@/infra/database";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Unwarn",
  alias: ["uw", "unwarn"],
  description: t("group.unwarn.description"),
  groupOnly: true,
  adminOnly: true,
  handler: async (_sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("group.unwarn.noTarget"));
    removeWarns(msg.jid, target);
    await msg.reply(t("group.unwarn.done", { target: getNumber(target) }));
  },
});
