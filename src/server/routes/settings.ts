import { Elysia } from "elysia";

export const settingsRoutes = new Elysia({ prefix: "/api/settings" })
  .get("/", () => ({
    botName: "SeaaveyBot",
    ownerNumber: "",
    prefix: ".",
    apiKey: "",
    autoRead: true,
    selfMode: false,
    publicMode: true,
  }))
  .patch("/", ({ body }) => ({ ...(body as object), updated: true }));
