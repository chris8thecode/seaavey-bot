#!/bin/bash

set -e

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "\n${BOLD}${CYAN}⚡ Create New Command${RESET}\n"

read -p "$(echo -e "${YELLOW}  ✏️  Command name:${RESET} ")" name
read -p "$(echo -e "${YELLOW}  📝 Description:${RESET} ")" description

# List categories
categories=($(ls -d commands/*/ 2>/dev/null | xargs -n1 basename))

echo -e "\n${BOLD}  🔖 Pilih category:${RESET}"
for i in "${!categories[@]}"; do
  echo -e "     ${CYAN}$((i+1)).${RESET} ${categories[$i]}"
done
echo -e "     ${GREEN}$((${#categories[@]}+1)).${RESET} ➕ Buat baru"

read -p "$(echo -e "\n${YELLOW}  👉 Pilihan:${RESET} ")" choice

if [ "$choice" -eq "$((${#categories[@]}+1))" ] 2>/dev/null; then
  read -p "$(echo -e "${YELLOW}  🏷️  Nama category baru:${RESET} ")" category
elif [ "$choice" -ge 1 ] && [ "$choice" -le "${#categories[@]}" ] 2>/dev/null; then
  category="${categories[$((choice-1))]}"
else
  echo -e "${RED}❌ Pilihan tidak valid${RESET}"
  exit 1
fi

if [ -z "$name" ]; then
  echo -e "${RED}❌ Name is required${RESET}"
  exit 1
fi

dir="commands/$category"
file="$dir/$name.ts"

if [ -f "$file" ]; then
  echo -e "${RED}❌ Command already exists: $file${RESET}"
  exit 1
fi

mkdir -p "$dir"

cat > "$file" <<EOF
import { defineCommand } from "@/types";

export default defineCommand({
  name: "$name",
  description: "$description",
  handler: async (_sock, msg) => {
    await msg.reply("");
  },
});
EOF

echo -e "\n${GREEN}✅ Created: ${BOLD}$file${RESET}"
