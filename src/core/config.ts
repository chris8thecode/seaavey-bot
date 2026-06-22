import { readFileSync } from "node:fs";
import { join } from "node:path";

export const isDev = process.env.NODE_ENV !== "production";

interface Config {
  name: string;
  prefix: string;
  owner: string[];
  accessMode: "public" | "private" | "self";
  apiKey: string;
  googleAiKey: string;
  toxicRegex: RegExp;
}

const toxicWords = readFileSync(join(import.meta.dir, "..", "assets", "toxic.txt"), "utf-8")
  .split("\n")
  .filter((w) => w.trim())
  .map((w) => w.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // escape regex special chars
  .join("|");

export const config: Config = {
  name: "SeaaveyBot",
  prefix: ".",
  owner: (process.env.OWNER_NUMBER ?? "62123456789").split(","),
  accessMode: (process.env.ACCESS_MODE ?? "public") as Config["accessMode"],
  apiKey: process.env.API_KEY ?? "",
  googleAiKey: process.env.GEMINI_API_KEY ?? "",
  toxicRegex: new RegExp(`\\b(?:${toxicWords})\\b`, "i"),
};
