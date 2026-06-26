import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { addWarn, getGroup, getWarns } from "@/infra/database";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Warn",
  alias: ["warn"],
  description: t("group.warn.description"),
  groupOnly: true,
  adminOnly: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("group.warn.noTarget"));
    const reason =
      msg.args.filter((a: string) => !a.startsWith("@")).join(" ") || t("group.warn.noReason");
    addWarn(msg.jid, target, reason);
    const warns = getWarns(msg.jid, target);
    const group = getGroup(msg.jid);
    const max = group.warnMax || 3;
    if (warns.length >= max) {
      await sock.groupParticipantsUpdate(msg.jid, [target], "remove");
      await msg.reply(t("group.warn.kicked", { target: getNumber(target), max }));
    } else {
      await msg.reply(
        t("group.warn.warned", { target: getNumber(target), count: warns.length, max, reason }),
      );
    }
  },
});
