import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
}

export default defineCommand({
  name: "GitHub",
  alias: ["gh", "github"],
  description: "Info profil GitHub. Contoh: .github seaavey",
  handler: async (_sock, msg) => {
    const username = msg.args[0];
    if (!username) return msg.reply("Format: .github <username>");
    const u = await safeFetchJSON<GitHubUser>(`https://api.github.com/users/${encodeURIComponent(username)}`);
    if (!u) return msg.reply("❌ User tidak ditemukan.");
    await msg.send({
      image: { url: u.avatar_url },
      caption: `🐙 *GitHub — ${u.login}*\n\n👤 ${u.name || "-"}\n📝 ${u.bio || "-"}\n📦 Repos: ${u.public_repos}\n👥 Followers: ${u.followers} | Following: ${u.following}\n🔗 ${u.html_url}`,
    });
  },
});
