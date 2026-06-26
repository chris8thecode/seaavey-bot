import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Carbon",
  alias: ["crb", "carbon"],
  description: t("media.carbon.desc"),
  handler: async (_sock, msg) => {
    const code = msg.args.join(" ");
    if (!code) return msg.reply(t("media.carbon.format"));
    const url = `https://carbonara.solopov.dev/api/cook?code=${encodeURIComponent(code)}&theme=monokai&language=auto`;
    const res = await fetch(url);
    if (!res.ok) return msg.reply(t("media.carbon.failed"));
    const buffer = Buffer.from(await res.arrayBuffer());
    await msg.send({ image: buffer, caption: "💻 Carbon" });
  },
});
