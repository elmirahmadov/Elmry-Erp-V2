const net = require("net");

const host = process.env.MYSQL_HOST || "127.0.0.1";
const port = Number(process.env.MYSQL_PORT || 3307);
const timeoutMs = Number(process.env.MYSQL_WAIT_TIMEOUT_MS || 90000);
const intervalMs = 1000;
const startedAt = Date.now();

function tryConnect() {
  const socket = new net.Socket();

  const onFail = () => {
    socket.destroy();
    if (Date.now() - startedAt >= timeoutMs) {
      console.error(`MySQL not ready at ${host}:${port} after ${timeoutMs}ms`);
      process.exit(1);
    }
    setTimeout(tryConnect, intervalMs);
  };

  socket.setTimeout(2000);
  socket.once("error", onFail);
  socket.once("timeout", onFail);
  socket.connect(port, host, () => {
    socket.end();
    console.log(`MySQL is ready at ${host}:${port}`);
    process.exit(0);
  });
}

console.log(`Waiting for MySQL at ${host}:${port}...`);
tryConnect();
