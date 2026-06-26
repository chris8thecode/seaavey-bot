import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Unblock",
  alias: ["ublk", "unblock"],
  description: t("owner.unblock.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("owner.unblock.format"));

    await sock.updateBlockStatus(target, "unblock");
    await msg.reply(t("owner.unblock.success", { target: getNumber(target) }));
  },
});
