import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Welcome",
  field: "welcome",
  description: "Toggle welcome message on/off",
});
