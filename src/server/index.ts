import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { statsRoutes } from "./routes/stats"
import { usersRoutes } from "./routes/users"
import { groupsRoutes } from "./routes/groups"
import { commandsRoutes } from "./routes/commands"
import { logsRoutes } from "./routes/logs"
import { settingsRoutes } from "./routes/settings"
import { schedulesRoutes } from "./routes/schedules"
import { broadcastRoutes } from "./routes/broadcast"

const PORT = process.env.API_PORT || 8080

export function startServer() {
  const app = new Elysia()
    .use(cors())
    .use(statsRoutes)
    .use(usersRoutes)
    .use(groupsRoutes)
    .use(commandsRoutes)
    .use(logsRoutes)
    .use(settingsRoutes)
    .use(schedulesRoutes)
    .use(broadcastRoutes)
    .get("/", () => ({ status: "ok", name: "SeaaveyBot API" }))
    .listen(PORT)

  console.log(`[API] Server running on http://localhost:${PORT}`)
  return app
}
