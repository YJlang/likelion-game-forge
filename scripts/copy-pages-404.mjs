import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("dist/pages");
const indexPath = resolve(outDir, "index.html");
const notFoundPath = resolve(outDir, "404.html");

if (!existsSync(indexPath)) {
  throw new Error(`Cannot create GitHub Pages fallback. Missing ${indexPath}`);
}

copyFileSync(indexPath, notFoundPath);
