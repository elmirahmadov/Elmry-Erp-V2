const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");

function findRootEnv(startDir) {
  let dir = startDir;
  while (true) {
    const envPath = path.join(dir, ".env");
    const turboPath = path.join(dir, "turbo.json");
    if (fs.existsSync(envPath) && fs.existsSync(turboPath)) {
      return envPath;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const envFile = findRootEnv(__dirname);
if (envFile) {
  dotenv.config({ path: envFile });
  console.log(`Loaded env: ${envFile}`);
} else {
  console.warn("Root .env not found");
}

const args = process.argv.slice(2);
const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: path.join(__dirname, "..", "packages", "database"),
});

process.exit(result.status ?? 1);
