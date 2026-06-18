import type { WASocket } from "baileys";
import { defineCommand } from "@/core/types";
import type { Group } from "@/infra/database";
import { getGroup, setGroup } from "@/infra/database";
import type { MessageResolver } from "@/utils/message-resolver";

type GroupField = keyof Omit<Group, "jid">;

interface ToggleConfig {
  name: string;
  field: GroupField;
  description: string;
  alias?: string[];
}

export function toggleCommand({ name, field, description, alias }: ToggleConfig) {
  return defineCommand({
    name,
    ...(alias ? { alias } : {}),
    description,
    groupOnly: true,
    adminOnly: true,
    handler: async (_sock: WASocket, msg: MessageResolver) => {
      const group = getGroup(msg.jid);
      const newVal = group[field] ? 0 : 1;
      setGroup(msg.jid, field, newVal);
      await msg.reply(`✅ ${name} ${newVal ? "diaktifkan" : "dinonaktifkan"}.`);
    },
  });
}
