import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Goodbye",
  alias: ["bye", "goodbye"],
  field: "goodbye",
  description: "Toggle goodbye message on/off",
});
