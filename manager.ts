import fs, { type Stats } from "fs";
import path from "path";
import { spawn, type ChildProcess } from "child_process";

const runtimeDir = path.resolve(".runtime");
const restartSignalFile = path.join(runtimeDir, "restart.signal");
const serverEntry = path.resolve("dist/server.js");

let child: ChildProcess | null = null;
let isRestarting = false;
let isShuttingDown = false;
let queuedRestart = false;

fs.mkdirSync(runtimeDir, { recursive: true });
if (!fs.existsSync(restartSignalFile)) {
  fs.writeFileSync(restartSignalFile, "");
}

function startServer() {
  if (!fs.existsSync(serverEntry)) {
    console.error("dist/server.js bulunamadı. Önce `npm run build` çalıştırın.");
    process.exit(1);
  }

  child = spawn(process.execPath, [serverEntry], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  child.once("exit", () => {
    if (isShuttingDown) {
      process.exit(0);
    }

    if (isRestarting) {
      isRestarting = false;
      startServer();
      if (queuedRestart) {
        queuedRestart = false;
        restartServer();
      }
      return;
    }

    setTimeout(startServer, 1000);
  });
}

function restartServer() {
  if (isShuttingDown || !child) {
    return;
  }

  if (isRestarting) {
    queuedRestart = true;
    return;
  }

  isRestarting = true;
  console.log("♻️ Build tamamlandı, soft restart başlatılıyor...");

  child.kill("SIGTERM");

  setTimeout(() => {
    if (isRestarting && child && child.exitCode === null) {
      child.kill("SIGKILL");
    }
  }, 35000);
}

function shutdownManager() {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  fs.unwatchFile(restartSignalFile);

  if (!child || child.exitCode !== null) {
    process.exit(0);
    return;
  }

  child.once("exit", () => {
    process.exit(0);
  });

  child.kill("SIGTERM");

  setTimeout(() => {
    if (child && child.exitCode === null) {
      child.kill("SIGKILL");
    }
  }, 35000);
}

fs.watchFile(restartSignalFile, { interval: 500 }, (current: Stats, previous: Stats) => {
  if (current.mtimeMs !== previous.mtimeMs) {
    restartServer();
  }
});

process.on("SIGINT", shutdownManager);
process.on("SIGTERM", shutdownManager);

startServer();
