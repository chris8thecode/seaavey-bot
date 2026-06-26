import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Promote",
  alias: ["pmt", "promote"],
  description: t("group.promote.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("group.promote.noTarget"));
    await sock.groupParticipantsUpdate(msg.jid, [target], "promote");
    await msg.send({
      text: t("group.promote.done", { target: getNumber(target) }),
      mentions: [target],
    });
  },
});
