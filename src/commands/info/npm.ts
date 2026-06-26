import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

interface NpmPackage {
  name: string;
  description: string;
  "dist-tags": { latest: string };
  license: string;
  homepage: string;
}

export default defineCommand({
  name: "NPM",
  alias: ["npm"],
  description: t("info.npm.desc"),
  handler: async (_sock, msg) => {
    const pkg = msg.args[0];
    if (!pkg) return msg.reply(t("info.npm.format"));
    const data = await safeFetchJSON<NpmPackage>(
      `https://registry.npmjs.org/${encodeURIComponent(pkg)}`,
    );
    if (!data) return msg.reply(t("info.npm.notFound"));
    await msg.reply(
      t("info.npm.detail", {
        name: data.name,
        description: data.description || "-",
        latest: data["dist-tags"]?.latest || "?",
        license: data.license || "?",
      }),
    );
  },
});
