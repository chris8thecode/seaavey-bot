import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { logger } from "@/core/logger";
import { broadcastRoutes } from "./routes/broadcast";
import { commandsRoutes } from "./routes/commands";
import { groupsRoutes } from "./routes/groups";
import { logsRoutes } from "./routes/logs";
import { schedulesRoutes } from "./routes/schedules";
import { settingsRoutes } from "./routes/settings";
import { statsRoutes } from "./routes/stats";
import { usersRoutes } from "./routes/users";

const PORT = process.env.API_PORT || 8080;

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
    .listen(PORT);

  logger.info(`[API] Server running on http://localhost:${PORT}`);
  return app;
}
