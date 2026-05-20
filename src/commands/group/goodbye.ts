import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Goodbye",
  field: "goodbye",
  description: "Toggle goodbye message on/off",
});
