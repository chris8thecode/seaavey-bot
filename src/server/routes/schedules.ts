import { Elysia } from "elysia"
import db, { deleteSchedule as dbDeleteSchedule } from "@/infra/database"

export const schedulesRoutes = new Elysia({ prefix: "/api/schedules" })
  .get("/", () => {
    return db.query("SELECT * FROM schedules WHERE done = 0").all()
  })
  .post("/", ({ body }) => {
    const { chatJid, creator, message, triggerAt, repeat } = body as {
      chatJid: string
      creator: string
      message: string
      triggerAt: number
      repeat?: string
    }
    db.run(
      "INSERT INTO schedules (chatJid, creator, message, triggerAt, repeat) VALUES (?, ?, ?, ?, ?)",
      [chatJid, creator, message, triggerAt, repeat || ""]
    )
    const id = (db.query("SELECT last_insert_rowid() as id").get() as { id: number }).id
    return { id, chatJid, creator, message, triggerAt, repeat }
  })
  .delete("/:id", ({ params }) => {
    dbDeleteSchedule(Number(params.id))
    return { id: params.id, deleted: true }
  })
