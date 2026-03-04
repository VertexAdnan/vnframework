import fs from "node:fs";
import path from "node:path";

async function globFiles(pattern: string) {
  const files: string[] = [];
  for await (const file of new Bun.Glob(pattern).scan(".")) {
    files.push(`./${file}`);
  }
  return files;
}

if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true });
}

console.log("🚀 Derleme işlemi başlıyor...");

const pages = await globFiles("src/pages/**/*.tsx");
const apis = await globFiles("src/api/**/*.ts");
const clientEntry = "./src/entry-client.tsx";

console.log("📦 Sunucu dosyaları derleniyor...");
const serverBuild = await Bun.build({
  entrypoints: ["./src/server.tsx", ...pages, ...apis],
  outdir: "./dist",
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
  entrypoints: [clientEntry],
  outdir: "./dist/public", 
  target: "browser",       
  minify: true,
  splitting: true,        
});

if (!clientBuild.success) {
  console.error("❌ İstemci derlemesi başarısız!");
  console.error(clientBuild.logs);
  process.exit(1);
}

if (fs.existsSync("./public")) {
  fs.cpSync("./public", "./dist/public", { recursive: true });
}

const runtimeDir = path.resolve(".runtime");
const restartSignalFile = path.join(runtimeDir, "restart.signal");

fs.mkdirSync(runtimeDir, { recursive: true });
fs.writeFileSync(restartSignalFile, new Date().toISOString());

console.log("♻️ Çalışan production sunucu varsa soft restart tetiklendi.");

console.log(`
✅ Derleme başarıyla tamamlandı!
---------------------------------
📁 Sunucu: dist/server.js
📁 Statik/JS: dist/public/
---------------------------------
Çalıştırmak için: bun start
`);