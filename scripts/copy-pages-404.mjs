import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repositoryBasePath = "/likelion-game-forge/";
const outDir = resolve("dist/pages");
const indexPath = resolve(outDir, "index.html");
const notFoundPath = resolve(outDir, "404.html");
const noJekyllPath = resolve(outDir, ".nojekyll");

if (!existsSync(indexPath)) {
  throw new Error(`Cannot create GitHub Pages fallback. Missing ${indexPath}`);
}

writeFileSync(
  notFoundPath,
  `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      (function () {
        var base = ${JSON.stringify(repositoryBasePath)};
        var path = window.location.pathname;
        var suffix = path.indexOf(base) === 0 ? path.slice(base.length - 1) : "/";
        var search = window.location.search || "";
        var hash = window.location.hash || "";
        window.location.replace(base + "#" + suffix + search + hash);
      })();
    </script>
  </head>
  <body></body>
</html>
`,
);

writeFileSync(noJekyllPath, "");
