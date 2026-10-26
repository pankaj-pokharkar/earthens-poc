#!/usr/bin/env node
/**
 * build.mjs — regenerates the shared parts of the static site. Zero dependencies.
 *
 * What it does:
 *   1. For every *.html file in the project root, replaces the content between
 *      <!-- @partial NAME --> and <!-- /@partial NAME --> with the output of the
 *      matching function in scripts/partials.mjs.
 *   2. Writes sitemap.xml, robots.txt, llms.txt and site.webmanifest from config.js.
 *
 * The output is committed to git, so GitHub Pages serves plain files with no
 * build step on the server. Run it after changing config.js, catalog.js or partials.mjs:
 *     npm run build
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, PAGES, CONTACT } from '../assets/js/config.js';
import { CATEGORIES, PRODUCTS } from '../assets/js/catalog.js';
import * as partials from './partials.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = /(<!-- @partial ([\w-]+) -->)[\s\S]*?(<!-- \/@partial \2 -->)/g;

/** Partial name in HTML -> function that renders it for a given page. */
const RENDERERS = {
  head: (page) => partials.head(page),
  header: (page) => partials.header(page),
  footer: () => partials.footer(),
  categories: () => partials.categories(),
  'product-filter': () => partials.productFilter(),
  'product-groups': () => partials.productGroups(),
  'contact-tiles': () => partials.contactTiles(),
};

async function buildPages() {
  const files = (await readdir(ROOT)).filter((f) => f.endsWith('.html'));
  for (const file of files) {
    const page = PAGES.find((p) => p.file === file);
    if (!page) {
      console.warn(`! ${file} is not listed in PAGES (config.js); skipped.`);
      continue;
    }
    const source = await readFile(path.join(ROOT, file), 'utf8');
    const output = source.replace(MARKER, (match, open, name, close) => {
      const render = RENDERERS[name];
      if (!render) throw new Error(`${file}: unknown partial "${name}"`);
      return `${open}${render(page)}${close}`;
    });
    if (output !== source) {
      await writeFile(path.join(ROOT, file), output);
      console.log(`✓ ${file}`);
    }
  }
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.filter((p) => p.sitemap !== false)
    .map((p) => `  <url><loc>${partials.pageUrl(p.file)}</loc><lastmod>${today}</lastmod><priority>${p.sitemap.toFixed(1)}</priority></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** robots.txt: everything public is crawlable, including AI answer engines. */
function robots() {
  return `# Earthens — all public pages may be crawled and cited, including by AI assistants.
User-agent: *
Allow: /
Disallow: /enquiry.html

# AI and answer-engine crawlers are explicitly welcome.
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /
Disallow: /enquiry.html

Sitemap: ${SITE.url}/sitemap.xml
`;
}

/**
 * llms.txt: a plain-language summary for AI assistants (AEO).
 * Spec: https://llmstxt.org — short facts first, then links to the key pages.
 */
function llms() {
  const a = SITE.address;
  const pages = PAGES.filter((p) => p.sitemap !== false)
    .map((p) => `- [${p.label}](${partials.pageUrl(p.file)}): ${p.description}`)
    .join('\n');
  const range = CATEGORIES.map((c) => {
    const names = PRODUCTS.filter((p) => p.category === c.id).map((p) => p.name);
    return names.length ? `- ${c.name}: ${names.join('; ')}` : null;
  }).filter(Boolean).join('\n');
  return `# ${SITE.name}

> ${SITE.description}

## Key facts
- What: premium single-use tableware pressed from naturally fallen Areca palm leaf sheaths. No pulp, starch, glue, chemicals or coatings.
- Properties: 100% natural, compostable and biodegradable, microwave and oven safe, natural beige colour.
- Where: ${a.street}, ${a.city}, ${a.region} ${a.postalCode}, ${a.countryName}.
- Founded: idea in 2012 by siblings-in-law Ashima and Nilesh; manufacturing unit in Tumkur since ${SITE.foundingYear}.
- People: 48 women artisans from nearby villages; team of ${SITE.employees}. CEO: ${SITE.ceo}.
- Markets: worldwide, including Europe and the US. Exports by ${SITE.exporter}.
- Consumer product: EcoBhoj Party Pack, complete tableware for 15 guests (round or square), MRP ₹1,500 inclusive of taxes.
${CONTACT.email ? `- Email: ${CONTACT.email}\n` : ''}
## Product range
${range}

## Pages
${pages}
`;
}

function manifest() {
  return `${JSON.stringify({
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: '#fbf5e6',
    theme_color: '#1f4a2c',
    icons: [
      { src: 'assets/img/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'assets/img/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'assets/img/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2)}\n`;
}

await buildPages();
await writeFile(path.join(ROOT, 'sitemap.xml'), sitemap());
await writeFile(path.join(ROOT, 'robots.txt'), robots());
await writeFile(path.join(ROOT, 'llms.txt'), llms());
await writeFile(path.join(ROOT, 'site.webmanifest'), manifest());
console.log('✓ sitemap.xml, robots.txt, llms.txt, site.webmanifest');
