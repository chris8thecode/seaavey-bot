import { Elysia } from "elysia"

export const broadcastRoutes = new Elysia({ prefix: "/api/broadcast" })
  .post("/", ({ body }) => {
    const { target, message } = body as { target: string; message: string }
    return { success: true, target, message }
  })
