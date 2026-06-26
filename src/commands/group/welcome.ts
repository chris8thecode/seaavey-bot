import { toggleCommand } from "@/utils/group-toggle";
import { t } from "@/core/translations";

export default toggleCommand({
  name: "Welcome",
  alias: ["wel", "welcome"],
  field: "welcome",
  description: t("group.welcome.desc"),
});
