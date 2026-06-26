import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import db from "@/infra/database";

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerJid TEXT,
    task TEXT,
    done INTEGER DEFAULT 0,
    timestamp INTEGER DEFAULT 0
  )
`);

export default defineCommand({
  name: "Todo",
  alias: ["todo"],
  description: t("productivity.todo.desc"),
  handler: async (_sock, msg) => {
    const sub = msg.args[0]?.toLowerCase();

    if (sub === "add") {
      const task = msg.args.slice(1).join(" ");
      if (!task) return msg.reply(t("productivity.todo.addFormat"));
      db.run("INSERT INTO todos (ownerJid, task, timestamp) VALUES (?, ?, ?)", [
        msg.sender,
        task,
        Date.now(),
      ]);
      return msg.reply(t("productivity.todo.added", { task }));
    }

    if (sub === "list") {
      const todos = db
        .query(
          "SELECT id, task, done FROM todos WHERE ownerJid = ? AND done = 0 ORDER BY timestamp",
        )
        .all(msg.sender) as { id: number; task: string; done: number }[];
      if (!todos.length) return msg.reply(t("productivity.todo.empty"));
      const list = todos.map((t, i) => `${i + 1}. ${t.task}`).join("\n");
      return msg.reply(t("productivity.todo.list", { list }));
    }

    if (sub === "done") {
      const idx = parseInt(msg.args[1] || "0", 10);
      const todos = db
        .query("SELECT id FROM todos WHERE ownerJid = ? AND done = 0 ORDER BY timestamp")
        .all(msg.sender) as { id: number }[];
      const target = todos[idx - 1];
      if (!target) return msg.reply(t("productivity.todo.invalidNumber"));
      db.run("UPDATE todos SET done = 1 WHERE id = ?", [target.id]);
      return msg.reply(t("productivity.todo.done"));
    }

    if (sub === "clear") {
      db.run("DELETE FROM todos WHERE ownerJid = ? AND done = 1", [msg.sender]);
      return msg.reply(t("productivity.todo.cleared"));
    }

    await msg.reply(t("productivity.todo.help"));
  },
});
