import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Elysia } from "elysia";

const LOGS_DIR = join(import.meta.dir, "..", "..", "..", "logs");

export const logsRoutes = new Elysia({ prefix: "/api/logs" }).get("/", ({ query }) => {
  const logFile = join(LOGS_DIR, "bot.log");
  if (!existsSync(logFile)) return [];

  const content = readFileSync(logFile, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean).slice(-100);

  const logs = lines
    .map((line, i) => {
      try {
        const parsed = JSON.parse(line);
        return {
          id: i + 1,
          level: parsed.level <= 30 ? "info" : parsed.level <= 40 ? "warn" : "error",
          message: parsed.msg || line,
          timestamp: parsed.time
            ? new Date(parsed.time).toISOString().replace("T", " ").slice(0, 19)
            : "",
        };
      } catch {
        return { id: i + 1, level: "info", message: line, timestamp: "" };
      }
    })
    .reverse();

  const level = query.level;
  if (level && level !== "all") {
    return logs.filter((l) => l.level === level);
  }
  return logs;
});
