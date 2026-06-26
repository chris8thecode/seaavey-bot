import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import db from "@/infra/database";

db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerJid TEXT,
    title TEXT,
    content TEXT,
    timestamp INTEGER DEFAULT 0
  )
`);

export default defineCommand({
  name: "Note",
  alias: ["note"],
  description: t("productivity.note.desc"),
  handler: async (_sock, msg) => {
    const sub = msg.args[0]?.toLowerCase();

    if (sub === "save") {
      const title = msg.args[1];
      const content = msg.args.slice(2).join(" ");
      if (!title || !content) return msg.reply(t("productivity.note.saveFormat"));
      db.run("INSERT INTO notes (ownerJid, title, content, timestamp) VALUES (?, ?, ?, ?)", [
        msg.sender,
        title,
        content,
        Date.now(),
      ]);
      return msg.reply(t("productivity.note.saved", { title }));
    }

    if (sub === "get") {
      const title = msg.args[1];
      if (!title) return msg.reply(t("productivity.note.getFormat"));
      const note = db
        .query("SELECT content FROM notes WHERE ownerJid = ? AND title = ?")
        .get(msg.sender, title) as { content: string } | null;
      if (!note) return msg.reply(t("productivity.note.notFound"));
      return msg.reply(`📝 *${title}*\n\n${note.content}`);
    }

    if (sub === "list") {
      const notes = db
        .query("SELECT title FROM notes WHERE ownerJid = ? ORDER BY timestamp DESC")
        .all(msg.sender) as { title: string }[];
      if (!notes.length) return msg.reply(t("productivity.note.empty"));
      const list = notes.map((n, i) => `${i + 1}. ${n.title}`).join("\n");
      return msg.reply(t("productivity.note.list", { list }));
    }

    if (sub === "del") {
      const title = msg.args[1];
      if (!title) return msg.reply(t("productivity.note.delFormat"));
      db.run("DELETE FROM notes WHERE ownerJid = ? AND title = ?", [msg.sender, title]);
      return msg.reply(t("productivity.note.deleted", { title }));
    }

    await msg.reply(t("productivity.note.help"));
  },
});
