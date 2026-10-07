// Fails the build if the compiled stylesheet is missing the brand theme —
// a guard against shipping new pages with stale or broken CSS.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function cssFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? cssFiles(p) : p.endsWith(".css") ? [p] : [];
  });
}

const css = cssFiles(".next/static").map((f) => readFileSync(f, "utf8")).join("\n");
const required = ["--color-ink-700:", ".bg-ink-700", "--font-display:"];
const missing = required.filter((token) => !css.includes(token));

if (missing.length) {
  console.error(`✗ Built CSS is missing: ${missing.join(", ")}. Refusing to ship a broken stylesheet.`);
  process.exit(1);
}
console.log("✓ Built CSS contains the AfterCare theme.");
