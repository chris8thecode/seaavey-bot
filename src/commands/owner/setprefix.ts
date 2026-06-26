import { t } from "@/core/translations";
import { config } from "@/core/config";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Set Prefix",
  alias: ["prefix", "setprefix"],
  description: t("owner.setprefix.desc"),
  ownerOnly: true,
  handler: async (_sock, msg) => {
    if (!msg.args[0]) return msg.reply(t("owner.setprefix.format"));
    const newPrefixes = msg.args[0].split(",");
    config.prefix = newPrefixes;
    await msg.reply(t("owner.setprefix.success", { prefix: config.prefix.join(", ") }));
  },
});
