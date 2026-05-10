import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((r) => rl.question(q, r));
const print = (msg: string) => process.stdout.write(`${msg}\n`);

const categories = readdirSync("commands", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

print(`\n${c.bold}${c.cyan}⚡ Create New Command${c.reset}\n`);

const name = await ask(`${c.yellow}  ✏️  Command name:${c.reset} `);
const description = await ask(`${c.yellow}  📝 Description:${c.reset} `);

print(`\n${c.bold}  🔖 Pilih category:${c.reset}`);
for (let i = 0; i < categories.length; i++) {
  print(`     ${c.cyan}${i + 1}.${c.reset} ${categories[i]}`);
}
print(`     ${c.green}${categories.length + 1}.${c.reset} ➕ Buat baru`);

const choice = parseInt(await ask(`\n${c.yellow}  👉 Pilihan:${c.reset} `), 10);
let category = "";

if (choice === categories.length + 1) {
  category = await ask(`${c.yellow}  🏷️  Nama category baru:${c.reset} `);
} else if (choice >= 1 && choice <= categories.length) {
  category = categories[choice - 1] as string;
} else {
  print(`${c.red}❌ Pilihan tidak valid${c.reset}`);
  rl.close();
  process.exit(1);
}

rl.close();

if (!name) {
  print(`${c.red}❌ Name is required${c.reset}`);
  process.exit(1);
}

const dir = join("commands", category);
const file = join(dir, `${name}.ts`);

if (existsSync(file)) {
  print(`${c.red}❌ Command already exists: ${file}${c.reset}`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });

const template = `import { defineCommand } from "@/types";

export default defineCommand({
  name: "${name}",
  description: "${description}",
  handler: async (_sock, msg) => {
    await msg.reply("");
  },
});
`;

writeFileSync(file, template);
print(`\n${c.green}✅ Created: ${c.bold}${file}${c.reset}`);
