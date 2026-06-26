import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Add",
  alias: ["add"],
  description: t("group.add.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const number = msg.args[0]?.replace(/[^0-9]/g, "");
    if (!number) return msg.reply(t("group.add.noNumber"));
    const target = `${number}@s.whatsapp.net`;
    await sock.groupParticipantsUpdate(msg.jid, [target], "add");
    await msg.send({
      text: t("group.add.done", { target: getNumber(target) }),
      mentions: [target],
    });
  },
});
