import fs from "node:fs";
import path from "node:path";

/**
 * Next.js (RSC) can resolve `swr` to its `react-server` export.
 * Some dependencies (e.g. Clerk) import `default` from `swr` / `swr/infinite`,
 * but SWR's `react-server` entrypoints intentionally don't export a default.
 *
 * This script appends a default export stub to those `react-server.mjs` files
 * so server bundling doesn't fail with:
 *   "Attempted import error: 'swr' does not contain a default export"
 *
 * The stub throws if executed (it shouldn't be in RSC), but allows the module
 * graph to compile.
 */

const repoRoot = process.cwd();
const pnpmDir = path.join(repoRoot, "node_modules", ".pnpm");

const targets = new Map([
  [
    path.join("dist", "index", "react-server.mjs"),
    `\n// patched by scripts/patch-swr-react-server.mjs\nconst __swr_default__ = () => {\n  throw new Error("SWR is not supported in React Server Components (react-server build).");\n};\nexport default __swr_default__;\n`,
  ],
  [
    path.join("dist", "infinite", "react-server.mjs"),
    `\n// patched by scripts/patch-swr-react-server.mjs\nconst __swr_infinite_default__ = () => {\n  throw new Error("SWR Infinite is not supported in React Server Components (react-server build).");\n};\nexport default __swr_infinite_default__;\n`,
  ],
]);

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.isFile()) continue;

    for (const [suffix, patchText] of targets.entries()) {
      if (!full.endsWith(path.join("node_modules", "swr", suffix))) continue;
      patchFile(full, patchText);
    }
  }
}

function patchFile(filePath, patchText) {
  let src;
  try {
    src = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
  }

  // Already patched or upstream changed.
  if (src.includes("patched by scripts/patch-swr-react-server.mjs")) return;
  if (/export\s+default\s+/m.test(src)) return;

  try {
    fs.writeFileSync(filePath, src + patchText, "utf8");
    // eslint-disable-next-line no-console
    console.log(`[patch-swr-react-server] patched ${path.relative(repoRoot, filePath)}`);
  } catch {
    // ignore
  }
}

if (fs.existsSync(pnpmDir)) {
  walk(pnpmDir);
}


