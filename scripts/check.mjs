#!/usr/bin/env node
/**
 * check.mjs — fast, dependency-free quality gate. Run with `npm run check` (CI runs it too).
 *
 * Fails (exit code 1) when any page:
 *   - is missing <html lang>, <title>, meta description or a canonical / noindex tag
 *   - does not have exactly one <h1>
 *   - has an <img> without alt, width or height (alt="" is fine for decoration)
 *   - uses an inline style="" attribute or inline <script> (blocked by our CSP)
 *   - links to a local file that does not exist
 *   - opens a new tab without rel="noopener"
 *   - still contains an empty, un-built partial marker
 * and when styles.css has unbalanced braces (a stray "}" silently drops the rule after it).
 *
 * It is intentionally simple (regex based). For deeper audits use Lighthouse.
 */
import { readdir, readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);
const exists = (p) => access(p).then(() => true, () => false);

// Root pages + generated product pages.
const files = [
  ...(await readdir(ROOT)).filter((f) => f.endsWith('.html')),
  ...(await readdir(path.join(ROOT, 'products')).catch(() => [])).filter((f) => f.endsWith('.html')).map((f) => `products/${f}`),
];

for (const file of files) {
  const html = await readFile(path.join(ROOT, file), 'utf8');
  // Ignore <template> contents and comments for structural checks.
  const body = html.replace(/<!--[\s\S]*?-->/g, '');

  if (!/<html[^>]+lang="[^"]+"/.test(body)) fail(file, 'missing <html lang>');
  if (!/<title>[^<]{10,}<\/title>/.test(body)) fail(file, 'missing or very short <title>');
  if (!/<meta name="description" content="[^"]{50,}"/.test(body)) fail(file, 'missing or short meta description');
  if (!/rel="canonical"|name="robots" content="noindex/.test(body)) fail(file, 'needs a canonical link or noindex');
  if (/<!-- @partial ([\w-]+) --><!-- \/@partial \1 -->/.test(html)) fail(file, 'un-built partial marker: run `npm run build`');

  const h1s = body.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) fail(file, `expected exactly one <h1>, found ${h1s}`);

  if (/\sstyle="/.test(body)) fail(file, 'inline style="" attribute (blocked by CSP; use styles.css)');
  for (const [tag] of body.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/g)) {
    fail(file, `inline script not allowed by CSP: ${tag}`);
  }

  for (const [tag] of body.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) fail(file, `img without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) fail(file, `img without width/height (layout shift): ${tag.slice(0, 80)}`);
  }

  for (const [tag] of body.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(tag)) fail(file, `target=_blank without rel=noopener: ${tag.slice(0, 80)}`);
  }

  // Local links and assets must exist. (<base href> on 404.html is the site root, not a link.)
  for (const [, url] of body.replace(/<base\b[^>]*>/g, '').matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) continue;
    const local = url.split(/[?#]/)[0];
    if (local && !(await exists(path.join(ROOT, path.dirname(file), local)))) fail(file, `broken local link: ${url}`);
  }
  for (const [, list] of body.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const candidate of list.split(',')) {
      const local = candidate.trim().split(/\s+/)[0];
      if (!(await exists(path.join(ROOT, path.dirname(file), local)))) fail(file, `broken srcset entry: ${local}`);
    }
  }
}

// Stylesheet: braces must balance, outside comments and strings.
{
  const css = (await readFile(path.join(ROOT, 'assets/css/styles.css'), 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/"[^"\n]*"|'[^'\n]*'/g, (m) => ' '.repeat(m.length));
  let depth = 0;
  css.split('\n').forEach((line, i) => {
    for (const c of line) {
      if (c === '{') depth++;
      else if (c === '}' && --depth < 0) { fail('assets/css/styles.css', `stray "}" on line ${i + 1}`); depth = 0; }
    }
  });
  if (depth > 0) fail('assets/css/styles.css', `${depth} unclosed "{"`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${files.length} pages passed`);
