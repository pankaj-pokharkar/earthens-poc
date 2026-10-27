#!/usr/bin/env node
/**
 * build.mjs — regenerates everything that comes from the data files. Zero dependencies.
 *
 *   1. Pages: replaces <!-- @partial NAME --> … <!-- /@partial NAME --> blocks in every
 *      root *.html file with output from scripts/partials.mjs.
 *   2. Product pages: writes products/<id>.html for every product in catalog.js.
 *   3. sitemap.xml, robots.txt, llms.txt, site.webmanifest.
 *
 * Output is committed, so the host serves plain files. Run after any data change:
 *     npm run build
 */
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, PAGES, CONTACT, OFFICES, FEATURES } from '../assets/js/config.js';
import { CATEGORIES, PRODUCTS, EXPORT, productPath } from '../assets/js/catalog.js';
import { AWARDS } from '../assets/js/content.js';
import * as partials from './partials.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = /(<!-- @partial ([\w:-]+) -->)[\s\S]*?(<!-- \/@partial \2 -->)/g;

/** Partial name used in HTML → renderer. */
const RENDERERS = {
  head: (page) => partials.head(page),
  header: (page) => partials.header(page),
  footer: () => partials.footer(),
  categories: () => partials.categories(),
  'product-filter': () => partials.productFilter(),
  'product-groups': () => partials.productGroups(),
  'product-datalist': () => partials.productDatalist(),
  'contact-tiles': () => partials.contactTiles(),
  'visit-card': () => partials.visitCard(),
  'awards:strip': () => partials.awards('strip'),
  'awards:cards': () => partials.awards('cards'),
  certificates: () => partials.certificates(),
  'company-facts': () => partials.companyFacts(),
  videos: () => partials.videos(),
  reviews: () => partials.reviews(),
  'ecobhoj-buy': () => partials.ecobhojBuy(),
  'ecobhoj-faq': () => partials.ecobhojFaq(),
};

const write = async (rel, content) => {
  await mkdir(path.dirname(path.join(ROOT, rel)), { recursive: true });
  await writeFile(path.join(ROOT, rel), content);
};

/* 1. Hand-written pages with partial markers */
async function buildPages() {
  const files = (await readdir(ROOT)).filter((f) => f.endsWith('.html'));
  for (const file of files) {
    const page = PAGES.find((p) => p.file === file);
    if (!page) { console.warn(`! ${file} is not listed in PAGES (config.js); skipped.`); continue; }
    const source = await readFile(path.join(ROOT, file), 'utf8');
    const output = source.replace(MARKER, (match, open, name, close) => {
      const render = RENDERERS[name];
      if (!render) throw new Error(`${file}: unknown partial "${name}"`);
      return `${open}${render(page)}${close}`;
    });
    if (output !== source) { await writeFile(path.join(ROOT, file), output); console.log(`✓ ${file}`); }
  }
}

/* 2. One page per product (EcoBhoj packs use ecobhoj.html instead) */
async function buildProductPages() {
  const dir = path.join(ROOT, 'products');
  if (existsSync(dir)) await rm(dir, { recursive: true }); // removes pages of deleted products
  const own = PRODUCTS.filter((p) => !p.url);
  for (const p of own) await write(productPath(p), partials.productPage(p));
  console.log(`✓ products/ (${own.length} product pages)`);
}

/* 3. Crawl & app files */
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    ...PAGES.filter((p) => p.sitemap !== false).map((p) => [p.file, p.sitemap]),
    ...PRODUCTS.filter((p) => !p.url).map((p) => [productPath(p), 0.7]),
  ];
  const urls = entries.map(([file, pr]) => `  <url><loc>${partials.pageUrl(file)}</loc><lastmod>${today}</lastmod><priority>${pr.toFixed(1)}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

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

/** llms.txt — plain-language fact sheet for AI assistants (https://llmstxt.org). */
function llms() {
  const o = OFFICES[0];
  const price = (p) => (p.mrp ? `MRP ₹${p.mrp}` : FEATURES.showPrices && p.price ? `about ₹${p.price}/piece` : 'price on request');
  const range = CATEGORIES.map((c) => {
    const items = PRODUCTS.filter((p) => p.category === c.id);
    return items.length ? `### ${c.name}\n${items.map((p) => `- [${p.name}](${partials.pageUrl(productPath(p))}): ${price(p)}`).join('\n')}` : null;
  }).filter(Boolean).join('\n\n');
  const pages = PAGES.filter((p) => p.sitemap !== false).map((p) => `- [${p.label}](${partials.pageUrl(p.file)}): ${p.description}`).join('\n');
  return `# ${SITE.name}

> ${SITE.description}

## Key facts
- What: premium single-use tableware pressed from naturally fallen Areca palm leaf sheaths. No pulp, starch, glue, chemicals or coatings.
- Properties: 100% natural, compostable, leak proof, microwave safe, freezer-ready, natural beige colour. Shelf life ${EXPORT.shelfLife}.
- Factory: ${o.street}, ${o.city}, ${o.region} ${o.postalCode}, ${o.countryName}.
- Founded: idea in 2012 by siblings-in-law Ashima and Nilesh; manufacturing unit in Tumkur since ${SITE.foundingYear}.
- People: ${SITE.artisans} women artisans from nearby villages; team of ${SITE.employees}. CEO: ${SITE.ceo}.
- Awards: ${AWARDS.map((a) => `${a.title} (${a.by}, ${a.when})`).join('; ')}.
- Quality: safety and quality tested by SGS to global standards; every piece inspected.
- Export: markets ${SITE.markets}. MOQ ${EXPORT.moq}. Port ${EXPORT.port}. Payment ${EXPORT.payment}. ${EXPORT.packaging}. ${EXPORT.privateLabel}. Exports by ${SITE.exporter}.
- Consumer product: EcoBhoj Party Pack, complete tableware for 15 guests (round or square), MRP ₹1,500 inclusive of taxes.
- Contact: ${CONTACT.email}${CONTACT.whatsapp ? `, WhatsApp +${CONTACT.whatsapp}` : ''}${CONTACT.phones.length ? `, phone ${CONTACT.phones.map((p) => p.number).join(' / ')}` : ''}.

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
await buildProductPages();
await write('sitemap.xml', sitemap());
await write('robots.txt', robots());
await write('llms.txt', llms());
await write('site.webmanifest', manifest());
console.log('✓ sitemap.xml, robots.txt, llms.txt, site.webmanifest');
