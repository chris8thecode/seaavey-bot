import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Anti Link",
  alias: ["alink", "antilink"],
  field: "antilink",
  description: "Toggle antilink on/off",
});
