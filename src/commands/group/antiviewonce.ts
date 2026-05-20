import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Anti View Once",
  field: "antiviewonce",
  alias: ["avo"],
  description: "Toggle anti-viewonce on/off. Pesan view once akan di-forward ulang.",
});
