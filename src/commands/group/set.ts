import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";
import { setGroup } from "@/infra/database";

export default defineCommand({
  name: "Set",
  alias: ["set"],
  description: t("group.set.description"),
  groupOnly: true,
  adminOnly: true,
  handler: async (_sock, msg) => {
    const [key, ...rest] = msg.args;
    const value = rest.join(" ");

    if (!key || !value) {
      return msg.reply(t("group.set.usage"));
    }

    const allowed = ["welcomeMsg", "goodbyeMsg", "warnMax"] as const;
    type AllowedKey = (typeof allowed)[number];
    if (!allowed.includes(key as AllowedKey)) {
      return msg.reply(t("group.set.invalidKey", { keys: allowed.join(", ") }));
    }

    const finalValue = key === "warnMax" ? Number(value) || 3 : value;
    setGroup(msg.jid, key as AllowedKey, finalValue);
    await msg.reply(t("group.set.done", { key }));
  },
});
