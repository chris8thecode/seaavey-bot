import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Welcome",
  alias: ["wel", "welcome"],
  field: "welcome",
  description: "Toggle welcome message on/off",
});
