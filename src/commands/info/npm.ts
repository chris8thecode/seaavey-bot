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
  description: "Info package NPM. Contoh: .npm express",
  handler: async (_sock, msg) => {
    const pkg = msg.args[0];
    if (!pkg) return msg.reply("Format: .npm <package>");
    const data = await safeFetchJSON<NpmPackage>(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
    if (!data) return msg.reply("❌ Package tidak ditemukan.");
    await msg.reply(
      `📦 *NPM — ${data.name}*\n\n📝 ${data.description || "-"}\n🏷️ Latest: ${data["dist-tags"]?.latest || "?"}\n📄 License: ${data.license || "?"}\n🔗 https://npmjs.com/package/${data.name}`,
    );
  },
});
