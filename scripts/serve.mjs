#!/usr/bin/env node
/**
 * serve.mjs — local preview server, zero dependencies. Run with `npm run serve`.
 *
 * Behaves like GitHub Pages / Cloudflare Pages, so what you see locally is what ships:
 *   - clean URLs: /our-story serves our-story.html, /products/12-inch-round-plate its page
 *   - works with or without the SITE.basePath prefix (/earthens-poc/our-story)
 *   - unknown paths get our own 404.html with a real 404 status
 *
 * Listens on 127.0.0.1 only. Set PORT to change the port (default 8080).
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE } from '../assets/js/config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

const isFile = (p) => stat(p).then((s) => s.isFile(), () => false);

/** Map a URL path to a file inside ROOT, or null. Never resolves outside ROOT. */
async function resolve(urlPath) {
  let rel = decodeURIComponent(urlPath);
  const base = SITE.basePath.replace(/\/$/, '');
  if (base && (rel === base || rel.startsWith(`${base}/`))) rel = rel.slice(base.length) || '/';
  const abs = path.join(ROOT, path.normalize(rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null; // path traversal
  if (path.relative(ROOT, abs).split(path.sep).some((part) => part.startsWith('.'))) return null; // .git, .github…
  for (const candidate of [abs, path.join(abs, 'index.html'), `${abs}.html`]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  try {
    const file = await resolve(new URL(req.url, 'http://localhost').pathname);
    const status = file ? 200 : 404;
    const target = file ?? path.join(ROOT, '404.html');
    const body = await readFile(target);
    res.writeHead(status, { 'Content-Type': TYPES[path.extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
    console.log(`${status} ${req.url}`);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Server error');
    console.error(err);
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Earthens preview: http://localhost:${PORT}/  (Ctrl+C to stop)`));
