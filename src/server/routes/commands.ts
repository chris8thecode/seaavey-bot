import { Elysia } from "elysia";
import { commands } from "@/infra/loader";

export const commandsRoutes = new Elysia({ prefix: "/api/commands" })
  .get("/", () => {
    return Array.from(commands.values()).map((cmd) => ({
      name: cmd.name,
      category: cmd.category || "general",
      description: cmd.description || "",
      enabled: cmd.enabled !== false,
    }));
  })
  .patch("/:name", ({ params, body }) => {
    const cmd = commands.get(params.name);
    if (!cmd) return { error: "Command not found" };
    const data = body as { enabled?: boolean };
    if (data.enabled !== undefined) cmd.enabled = data.enabled;
    return { name: cmd.name, category: cmd.category, enabled: cmd.enabled };
  })
  .post("/:name/enable", ({ params }) => {
    const cmd = commands.get(params.name);
    if (!cmd) return { error: "Command not found" };
    cmd.enabled = true;
    return { name: cmd.name, enabled: true };
  })
  .post("/:name/disable", ({ params }) => {
    const cmd = commands.get(params.name);
    if (!cmd) return { error: "Command not found" };
    cmd.enabled = false;
    return { name: cmd.name, enabled: false };
  });
