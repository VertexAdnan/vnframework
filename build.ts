import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve("dist");
const DIST_TMP_DIR = path.resolve("dist_tmp");
const DIST_BACKUP_DIR = path.resolve("dist_prev");

async function globFiles(pattern: string) {
  const files: string[] = [];
  for await (const file of new Bun.Glob(pattern).scan(".")) {
    files.push(`./${file}`);
  }
  return files;
}

function removeDirIfExists(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function commitBuildOutput() {
  removeDirIfExists(DIST_BACKUP_DIR);

  try {
    if (fs.existsSync(DIST_DIR)) {
      fs.renameSync(DIST_DIR, DIST_BACKUP_DIR);
    }

    fs.renameSync(DIST_TMP_DIR, DIST_DIR);
    removeDirIfExists(DIST_BACKUP_DIR);
  } catch (error) {
    console.error("❌ Dist klasoru degisimi basarisiz oldu.");

    if (!fs.existsSync(DIST_DIR) && fs.existsSync(DIST_BACKUP_DIR)) {
      fs.renameSync(DIST_BACKUP_DIR, DIST_DIR);
    }

    throw error;
  }
}

removeDirIfExists(DIST_TMP_DIR);
removeDirIfExists(DIST_BACKUP_DIR);

console.log("🚀 Derleme işlemi başlıyor...");

const pages = await globFiles("src/pages/**/*.tsx");
const apis = await globFiles("src/api/**/*.ts");
const clientEntry = "./src/entry-client.tsx";

console.log("📦 Sunucu dosyaları derleniyor...");
const serverBuild = await Bun.build({
  entrypoints: ["./src/server.tsx", ...pages, ...apis],
  outdir: DIST_TMP_DIR,
  target: "bun",
  minify: true, 
  sourcemap: "none",
  splitting: false,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

if (!serverBuild.success) {
  console.error("❌ Sunucu derlemesi başarısız!");
  console.error(serverBuild.logs);
  process.exit(1);
}

console.log("🌐 Tarayıcı dosyaları (Hydration) hazırlanıyor...");
const clientBuild = await Bun.build({
  entrypoints: [clientEntry, ...pages],
  outdir: path.join(DIST_TMP_DIR, "assets"), 
  target: "browser",       
  minify: true,
  splitting: true,
});

if (!clientBuild.success) {
  console.error("❌ İstemci derlemesi başarısız!");
  console.error(clientBuild.logs);
  process.exit(1);
}

commitBuildOutput();

const runtimeDir = path.resolve(".runtime");
const restartSignalFile = path.join(runtimeDir, "restart.signal");

fs.mkdirSync(runtimeDir, { recursive: true });
fs.writeFileSync(restartSignalFile, new Date().toISOString());

console.log("♻️ Çalışan production sunucu varsa soft restart tetiklendi.");

console.log(`
✅ Derleme başarıyla tamamlandı!
---------------------------------
📁 Sunucu: dist/server.js
📁 Client JS: dist/assets/
📁 Statik dosyalar: public/
---------------------------------
Çalıştırmak için: bun start
`);