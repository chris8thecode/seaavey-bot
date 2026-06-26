import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set Status",
  alias: ["sst", "setstatus"],
  description: t("owner.setstatus.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!msg.args.length) return msg.reply(t("owner.setstatus.format"));

    await sock.updateProfileStatus(msg.args.join(" "));
    await msg.reply(t("owner.setstatus.success"));
  },
});
