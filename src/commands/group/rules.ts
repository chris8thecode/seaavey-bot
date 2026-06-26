import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { getGroup, setGroup } from "@/infra/database";

export default defineCommand({
  name: "Rules",
  alias: ["rules"],
  description: t("group.rules.description"),
  groupOnly: true,
  handler: async (_sock, msg) => {
    const sub = msg.args[0]?.toLowerCase();

    if (sub === "set") {
      if (!msg.isAdmin) return msg.reply(t("group.rules.adminOnly"));
      const text = msg.args.slice(1).join(" ");
      if (!text) return msg.reply(t("group.rules.noText"));
      setGroup(msg.jid, "welcomeMsg", text);
      return msg.reply(t("group.rules.saved"));
    }

    const group = getGroup(msg.jid);
    const rules = group.welcomeMsg;
    if (!rules) return msg.reply(t("group.rules.noRules"));
    await msg.reply(t("group.rules.show", { rules }));
  },
});
