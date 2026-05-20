import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Anti Delete",
  alias: ["adel", "antidelete"],
  field: "antidelete",
  description: "Toggle antidelete on/off",
});
