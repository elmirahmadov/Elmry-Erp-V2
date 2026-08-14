const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");

function ensureFreshBuild(pkg) {
  const pkgDir = path.join(root, "packages", pkg);
  const distIndex = path.join(pkgDir, "dist", "index.js");
  const buildInfo = path.join(pkgDir, "tsconfig.tsbuildinfo");

  if (!fs.existsSync(distIndex) && fs.existsSync(buildInfo)) {
    fs.unlinkSync(buildInfo);
    console.log(`Cleared stale build info for @elmry/${pkg}`);
  }
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

ensureFreshBuild("config");
ensureFreshBuild("database");

run("npm", ["run", "build", "--workspace=@elmry/config"]);
run("npm", ["run", "build", "--workspace=@elmry/database"]);
