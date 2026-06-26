import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set Name",
  alias: ["setname"],
  description: t("owner.setname.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!msg.args.length) return msg.reply(t("owner.setname.format"));

    await sock.updateProfileName(msg.args.join(" "));
    await msg.reply(t("owner.setname.success"));
  },
});
