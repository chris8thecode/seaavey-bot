import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Kick",
  alias: ["kick"],
  description: t("group.kick.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("group.kick.noTarget"));
    await sock.groupParticipantsUpdate(msg.jid, [target], "remove");
    await msg.send({
      text: t("group.kick.done", { target: getNumber(target) }),
      mentions: [target],
    });
  },
});
