import type { WASocket } from "baileys";
import type { MessageResolver } from "@/utils/message-resolver";

export interface Command {
  name: string;
  command?: string;
  alias?: string[];
  triggers?: string[];
  category: string;
  description?: string;
  usage?: string;
  enabled?: boolean;
  ownerOnly?: boolean;
  groupOnly?: boolean;
  privateOnly?: boolean;
  adminOnly?: boolean;
  botAdmin?: boolean;
  cooldown?: number;
  tags?: string[];
  handler: (sock: WASocket, msg: MessageResolver) => Promise<void>;
}

export function defineCommand(cmd: Omit<Command, "category">) {
  return cmd;
}
