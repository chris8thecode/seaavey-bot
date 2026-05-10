import { defineCommand } from "@/types";

export default defineCommand({
  name: "ttdl",
  description: "",
  handler: async (_sock, msg) => {
    msg.reply("TTDL");
  },
});
