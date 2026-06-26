import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Demote",
  alias: ["dmt", "demote"],
  description: t("group.demote.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("group.demote.noTarget"));
    await sock.groupParticipantsUpdate(msg.jid, [target], "demote");
    await msg.send({
      text: t("group.demote.done", { target: getNumber(target) }),
      mentions: [target],
    });
  },
});
