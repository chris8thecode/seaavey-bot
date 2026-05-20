import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Anti Spam",
  alias: ["spam", "antispam"],
  field: "antispam",
  description: "Toggle antispam on/off",
});
