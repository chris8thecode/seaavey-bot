import type { WASocket } from "baileys";
import type { ParsedMessage } from "@/utils/helper";

export interface Command {
  name: string;
  command?: string;
  alias?: string[];
  category: string;
  description?: string;
  enabled?: boolean;
  handler: (sock: WASocket, msg: ParsedMessage) => Promise<void>;
}

export function defineCommand(cmd: Omit<Command, "category">) {
  return cmd;
}
