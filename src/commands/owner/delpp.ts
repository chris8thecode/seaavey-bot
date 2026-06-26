import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Del PP",
  alias: ["delpp"],
  description: t("owner.delpp.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!sock.user?.id) return;

    await sock.removeProfilePicture(sock.user.id);
    await msg.reply(t("owner.delpp.success"));
  },
});
