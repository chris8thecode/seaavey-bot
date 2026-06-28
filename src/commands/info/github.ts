import { t } from "@/core/translations";
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
  description: t("info.github.desc"),
  handler: async (_sock, msg) => {
    const username = msg.args[0];
    if (!username) return msg.reply(t("info.github.format"));
    await msg.reply(t("info.github.searching"));
    const u = await safeFetchJSON<GitHubUser>(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
    );
    if (!u) return msg.reply(t("info.github.notFound"));
    await msg.send({
      image: { url: u.avatar_url },
      caption: t("info.github.profile", {
        login: u.login,
        name: u.name || "-",
        bio: u.bio || "-",
        repos: u.public_repos,
        followers: u.followers,
        following: u.following,
        url: u.html_url,
      }),
    });
  },
});
