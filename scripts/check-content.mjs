#!/usr/bin/env node
/**
 * Content check: every string in lib/content/site.ts (the client's verbatim
 * copy and the structural labels) must be on the built homepage.
 *
 *   npm run build && npm run check:content            reads .next/server/app/index.html
 *   node scripts/check-content.mjs http://localhost:3000   reads a running server
 *
 * Skipped (not page text): links, ids, image paths and alt text, colour
 * codes, the `ui` / `aria*` interface labels, the form's status messages and
 * the map's iframe settings. <title> and the meta description are checked
 * against the document head.
 *
 * Needs Node ≥ 23.6 (it imports the TypeScript content file directly).
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = await import(path.join(root, "lib/content/site.ts"));

const SKIP_KEYS = new Set(["href", "src", "alt", "id", "cap", "icon", "shape", "url", "logo", "image", "ui", "map", "index"]);
const SKIP_EXPORTS = new Set(["CAPS", "CAP_ORDER", "meta", "ui"]);
const skipKey = k => SKIP_KEYS.has(k) || /^aria/.test(k) || /Href$/.test(k);

/** Every string under `value`, with the path it was found at. */
function strings(value, at, out) {
  if (typeof value === "string") out.push([at, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${at}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) if (!skipKey(k)) strings(v, `${at}.${k}`, out);
  }
  return out;
}

const decode = s =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
const norm = s => s.replace(/\s+/g, " ").trim();

const source = process.argv[2];
let html;
if (source) {
  const res = await fetch(source);
  if (!res.ok) throw new Error(`${source} → ${res.status}`);
  html = await res.text();
} else {
  html = await readFile(path.join(root, ".next/server/app/index.html"), "utf8").catch(() => {
    console.error("No built homepage at .next/server/app/index.html. Run `npm run build` first, or pass a URL.");
    process.exit(2);
  });
}

const head = html.slice(0, html.indexOf("<body"));
const body = html
  .slice(html.indexOf("<body"))
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<[^>]+>/g, "");
const text = norm(decode(body));

const missing = [];
let checked = 0;
for (const [name, value] of Object.entries(content)) {
  if (SKIP_EXPORTS.has(name) || typeof value === "function") continue;
  for (const [at, s] of strings(value, name, [])) {
    const needle = norm(s);
    if (!needle) continue;
    checked++;
    if (!text.includes(needle)) missing.push(`${at}: ${JSON.stringify(s)}`);
  }
}

const title = decode(head.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
const description = decode(head.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
if (title !== content.meta.title) missing.push(`meta.title: <title> is ${JSON.stringify(title)}`);
if (description !== content.meta.description) missing.push(`meta.description: the meta tag is ${JSON.stringify(description)}`);
checked += 2;

if (missing.length) {
  console.error(`✗ ${missing.length} of ${checked} content strings are missing from the homepage:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ All ${checked} content strings are on the homepage.`);
