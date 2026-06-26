import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { isBanned, setBanned } from "@/infra/database";

export default defineCommand({
  name: "Ban",
  alias: ["ban"],
  description: t("owner.ban.desc"),
  ownerOnly: true,
  handler: async (_sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply(t("owner.ban.format"));

    if (isBanned(target)) {
      setBanned(target, false);
      await msg.reply(t("owner.ban.unbanned", { user: target.split("@")[0] }));
    } else {
      setBanned(target, true);
      await msg.reply(t("owner.ban.banned", { user: target.split("@")[0] }));
    }
  },
});
