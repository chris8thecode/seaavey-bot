import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Anonymous",
  alias: ["anon", "anonymous"],
  description: t("fun.anonymous.description"),
  groupOnly: true,
  handler: async (sock, msg) => {
    const mentioned = msg.mentioned[0];
    const text = msg.args.slice(1).join(" ");

    if (!mentioned || !text) {
      return msg.reply(t("fun.anonymous.format"));
    }

    if (mentioned === msg.sender) return msg.reply(t("fun.anonymous.selfError"));

    await sock.sendMessage(msg.jid, {
      text: t("fun.anonymous.message", { text }),
      mentions: [mentioned],
    });

    await msg.reply(t("fun.anonymous.sent"));
  },
});
