import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Block",
  alias: ["block"],
  description: t("owner.block.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("owner.block.format"));

    await sock.updateBlockStatus(target, "block");
    await msg.reply(t("owner.block.success", { target: getNumber(target) }));
  },
});
