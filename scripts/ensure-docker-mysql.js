const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const net = require("net");
const path = require("path");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const CONTAINER = "elmry-erp-mysql";
const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3307);
const DOCKER_WAIT_MS = Number(process.env.DOCKER_WAIT_TIMEOUT_MS || 120000);
const MYSQL_WAIT_MS = Number(process.env.MYSQL_WAIT_TIMEOUT_MS || 90000);

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: options.shell ?? false,
    stdio: options.stdio ?? "pipe",
    windowsHide: true,
    env: process.env,
  });
}

function sleep(ms) {
  spawnSync(process.execPath, ["-e", `Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,${ms})`], {
    stdio: "ignore",
    windowsHide: true,
  });
}

function dockerReady() {
  const result = run("docker", ["info"], { stdio: "ignore" });
  return result.status === 0;
}

function findDockerDesktopExe() {
  const candidates = [
    process.env.DOCKER_DESKTOP_PATH,
    "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe",
    path.join(process.env.LOCALAPPDATA || "", "Docker", "Docker Desktop.exe"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function startDockerDesktop() {
  if (process.platform !== "win32") {
    console.warn(
      "Docker daemon is not running. Start Docker Desktop, then retry.",
    );
    return false;
  }

  const exe = findDockerDesktopExe();
  if (!exe) {
    console.error("Docker Desktop not found. Install Docker Desktop first.");
    return false;
  }

  console.log("Starting Docker Desktop...");
  const child = spawn(exe, [], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
  return true;
}

function waitForDocker() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < DOCKER_WAIT_MS) {
    if (dockerReady()) {
      console.log("Docker is ready.");
      return true;
    }
    process.stdout.write(".");
    sleep(2000);
  }
  console.error(`\nDocker did not become ready within ${DOCKER_WAIT_MS}ms.`);
  return false;
}

function containerExists(name) {
  const result = run("docker", ["inspect", name], { stdio: "ignore" });
  return result.status === 0;
}

function containerRunning(name) {
  const result = run(
    "docker",
    ["inspect", "-f", "{{.State.Running}}", name],
    { stdio: "pipe" },
  );
  return result.status === 0 && String(result.stdout).trim() === "true";
}

function ensureMysqlContainer() {
  const useShell = os.platform() === "win32";

  if (containerExists(CONTAINER)) {
    if (containerRunning(CONTAINER)) {
      console.log(`MySQL container already running (${CONTAINER}).`);
      return true;
    }
    console.log(`Starting existing MySQL container (${CONTAINER})...`);
    const started = run("docker", ["start", CONTAINER], {
      stdio: "inherit",
      shell: useShell,
    });
    return started.status === 0;
  }

  console.log("Creating MySQL container via docker compose...");
  const composeUp = run("docker", ["compose", "up", "-d", "mysql"], {
    stdio: "inherit",
    shell: useShell,
  });
  return composeUp.status === 0;
}

function waitForMysqlPort() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    console.log(`Waiting for MySQL at ${MYSQL_HOST}:${MYSQL_PORT}...`);

    const tryConnect = () => {
      const socket = new net.Socket();
      const onFail = () => {
        socket.destroy();
        if (Date.now() - startedAt >= MYSQL_WAIT_MS) {
          reject(
            new Error(
              `MySQL not ready at ${MYSQL_HOST}:${MYSQL_PORT} after ${MYSQL_WAIT_MS}ms`,
            ),
          );
          return;
        }
        setTimeout(tryConnect, 1000);
      };

      socket.setTimeout(2000);
      socket.once("error", onFail);
      socket.once("timeout", onFail);
      socket.connect(MYSQL_PORT, MYSQL_HOST, () => {
        socket.end();
        console.log(`MySQL is ready at ${MYSQL_HOST}:${MYSQL_PORT}`);
        resolve();
      });
    };

    tryConnect();
  });
}

async function main() {
  if (!dockerReady()) {
    if (!startDockerDesktop() && process.platform === "win32") {
      process.exit(1);
    }
    if (!waitForDocker()) {
      process.exit(1);
    }
  } else {
    console.log("Docker is already running.");
  }

  if (!ensureMysqlContainer()) {
    console.error("Could not start MySQL container (elmry-erp-mysql).");
    process.exit(1);
  }

  try {
    await waitForMysqlPort();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
