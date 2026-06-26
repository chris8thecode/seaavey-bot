import { mkdirSync } from "node:fs";
import pino from "pino";
import { isDev } from "@/core/config";

mkdirSync("logs", { recursive: true });

const today = new Date().toISOString().slice(0, 10);

export const logger = pino({
  level: isDev ? "info" : "warn",
  transport: {
    targets: [
      { target: "pino/file", options: { destination: `logs/${today}.log` } },
      { target: "pino-pretty", options: { colorize: true } },
    ],
  },
});

/**
 * Creates a dedicated pino logger that writes to `dev/<eventName>.log`.
 * Only active in dev mode — returns a silent (level "silent") logger in production.
 */
export function createEventLogger(eventName: string): pino.Logger {
  if (!isDev) {
    return pino({ level: "silent" });
  }

  mkdirSync("dev", { recursive: true });

  return pino(
    { level: "info" },
    pino.transport({
      targets: [
        { target: "pino/file", options: { destination: `dev/${eventName}.log`, mkdir: true } },
        { target: "pino-pretty", options: { colorize: true } },
      ],
    }),
  );
}
