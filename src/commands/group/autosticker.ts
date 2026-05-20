import { toggleCommand } from "@/utils/command-factory";

export default toggleCommand({
  name: "Auto Sticker",
  field: "autosticker",
  alias: ["as", "autos", "autosticker"],
  description: "Toggle autosticker on/off",
});
