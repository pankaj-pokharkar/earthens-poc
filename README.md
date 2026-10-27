# Earthens website

The official website of **Earthens**, makers of 100% natural Areca palm leaf tableware and the **EcoBhoj Party Pack**, from Tumkur, Karnataka.

A fast, accessible, plain **HTML + CSS + JavaScript** site. It has no framework and no runtime dependencies, and is built to be hosted on **GitHub Pages** (or Cloudflare Pages / Netlify).

| Lighthouse (local, gzip) | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | 99–100 | 100 | 100 | 100 |
| Mobile (simulated slow 4G) | 90–99 | 100 | 100 | 100 |

---

## Quick start

```bash
npm run serve     # preview at http://localhost:8080
npm run build     # regenerate everything that comes from the data files
npm run check     # quality gate (SEO tags, a11y basics, CSP, broken links)
npm run verify    # build + check — run this before every commit
```

Requires **Node 18+** for the build, check and preview scripts (no other tools). `npm run serve` behaves like the live host: clean URLs such as `/our-story` work, and unknown paths show our `404.html`. Visitors only ever download static files.

---

## Where to change things (single source of truth)

You never edit the same fact in two places. Change it in **one** file, run `npm run build`, and every page updates.

| File | Owns |
| --- | --- |
| `assets/js/config.js` | Business facts, **addresses**, **phones / WhatsApp / email**, **social links**, feature flags, forms, page titles & descriptions |
| `assets/js/catalog.js` | Categories, **all 35 products + 2 EcoBhoj packs**, **prices**, **export terms** (MOQ, port, payment, packing, shelf life) |
| `assets/js/content.js` | **Awards**, **certificates (Seal of Trust)**, **videos**, **reviews**, EcoBhoj FAQ |
| `assets/css/styles.css` | All styling; design tokens (colours, fonts, spacing) at the top |
| `scripts/partials.mjs` | HTML templates: head, header, footer, product cards, product pages, awards, videos… |

### Common tasks

| I want to… | Edit | Then |
| --- | --- | --- |
| Change a phone number, WhatsApp, email | `CONTACT` in `config.js` | `npm run build` |
| Add a social network (LinkedIn, X, Pinterest…) | fill its `url` in `SOCIAL` (`config.js`) | `npm run build` |
| Add or edit a product, its price or size | `PRODUCTS` in `catalog.js` | `npm run build` |
| Change MOQ / port / payment / packing for all products | `EXPORT` in `catalog.js` | `npm run build` |
| Hide all prices | `FEATURES.showPrices = false` in `config.js` | `npm run build` |
| Turn on the enquiry cart | `FEATURES.enquiryCart = true` in `config.js` | `npm run build` |
| Add a certificate PDF | put it in `assets/docs/`, set `file` in `CERTIFICATES` (`content.js`) | `npm run build` |
| Add an award, video or review | `AWARDS` / `VIDEOS` / `REVIEWS` in `content.js` | `npm run build` |
| Put the EcoBhoj Amazon link live | `STORES.amazonEcoBhoj` in `config.js` | `npm run build` |
| Connect forms to email | `FORMS.endpoint` (e.g. a Formspree URL) | `npm run build` (CSP updates automatically) |
| Replace an illustration with a product photo | set `image: 'assets/img/products/…webp'` on the product | `npm run build` |
| Add a new page | copy a page, set `<body data-page="key">`, add it to `PAGES` | `npm run build` |

See **`docs/IMAGES.md`** for which photo goes where, at what size.

---

## Project structure

```
.
├── index.html … contact.html, enquiry.html, 404.html   ← pages (your content + generated blocks)
├── products/<id>.html        ← GENERATED: one page per product (don't edit)
├── sitemap.xml, robots.txt, llms.txt, site.webmanifest   ← GENERATED
├── assets/
│   ├── css/styles.css
│   ├── js/  config.js · catalog.js · content.js · main.js · modules/
│   ├── img/ logo.svg (master) · logo.webp · hero-scene-*.webp · shapes/ · categories/ · decor/ · icons.svg
│   ├── fonts/  (self-hosted, SIL OFL)
│   └── docs/   (certificate PDFs go here)
├── scripts/  build.mjs · partials.mjs · check.mjs
├── docs/  IMAGES.md · DECISIONS.md
└── .github/workflows/ci.yml  ← build + check + Lighthouse on every push/PR
```

### How "reusable" works without a framework

Shared blocks are copied into pages between markers:

```html
<!-- @partial header --> …generated… <!-- /@partial header -->
```

`npm run build` regenerates them. **Never hand-edit inside a marker.** Everything outside the markers is normal HTML you edit directly. The generated output is committed, so the host serves plain files with no build step.

---

## Deploy

### GitHub Pages (current)
1. Push to GitHub, then go to **Settings → Pages → Deploy from a branch → `main` / root**.
2. **Custom domain** `www.earthens.in`: add it in Settings → Pages, add a `CNAME` file containing `www.earthens.in`, point your DNS `CNAME` to `<user>.github.io`, and tick **Enforce HTTPS**.
3. Keep `SITE.url` in `config.js` equal to the live domain (it drives canonical URLs and the sitemap).

### A fresh start for SEO
The new site does not redirect old earthens.in URLs; the owner chose a clean start (see `docs/DECISIONS.md`). When it goes live, submit `sitemap.xml` in Google Search Console so the new pages are indexed quickly.

---

## Features

- **Products**: 7 categories, filterable without reloading (it still works without JS, as anchor links). Every product has its own page with size, shape, indicative price, a **"Good to know"** perk row, a shipping-label style **export panel** (MOQ, port, payment, shelf life, origin, packing, private label), related products, and **Get a quote** (pre-fills the contact form) / **WhatsApp** (pre-filled message) buttons.
- **Enquiry cart** (feature flag): "Add to enquiry" on cards and product pages, a header badge, and one enquiry for many products. Stored only in the visitor's browser.
- **Videos**: thumbnail-only "facade". The YouTube player (~1 MB) loads only when someone presses play, using `youtube-nocookie.com`. Responsive 16:9, keyboard accessible, and it pre-connects on hover so playback starts fast.
- **Trust**: SGS test reports, IEC, trademark and GST certificates; 3 awards (Home strip, Our Story, Certifications); a 4.5★ rating and quotes.
- **Contact**: WhatsApp, call and email tiles; both offices; all phone numbers; a floating WhatsApp button; a form with a product picker.

## Security
- A strict **Content-Security-Policy** in every page: same-origin scripts, styles and fonts only, no inline scripts or styles. The only third parties allowed are YouTube thumbnails and the player, and Google Maps. Set `FORMS.endpoint` and its origin is added automatically.
- No trackers, cookies or CDNs. Fonts are self-hosted.
- External links use `rel="noopener noreferrer"`. Nothing a visitor types (or puts in a URL) is ever inserted as HTML: the product pre-fill looks the id up in the catalog, and video ids are validated.
- `_headers` adds HSTS, `frame-ancestors`, `Permissions-Policy` and more on Cloudflare Pages / Netlify.

## Accessibility (WCAG 2.2 AA)
Skip link, visible focus, `aria-current`, labelled fields with inline errors, live announcements (filter, cart), 44px+ targets, AA contrast, `prefers-reduced-motion`, decorative images hidden from screen readers, and whole-card links that keep a single clear link name.

## SEO & AEO (answer-engine optimisation)
- Unique titles and descriptions (from `PAGES`, and auto-written for product pages), canonical URLs, Open Graph and Twitter cards.
- JSON-LD: `Organization` (with awards, contact point, `sameAs` socials and listings), `WebSite`, `BreadcrumbList`, a `Product` + `Offer` on every product page, and `Product` + `FAQPage` on EcoBhoj. All of it is generated from the same data as the visible page, so the two never disagree.
- `sitemap.xml` (44 URLs), `robots.txt` that welcomes AI crawlers, and **`llms.txt`**: a fact sheet with every product, price and export term for AI assistants.

## Performance
Self-hosted variable fonts (preloaded, `font-display: swap`), responsive WebP with `srcset` (640/800/1000/1600), a preloaded hero image, lazy loading below the fold, one CSS file, and ~12 KB of deferred module JS. GitHub Pages serves everything gzipped from a CDN.

---

## Plain HTML or Astro?

Plain HTML is still a good fit. The build script already gives you shared templates, data-driven product pages and SEO files, with zero dependencies. **Move to Astro** when you add multiple languages, a blog or festival campaigns, or a CMS for non-developers. `styles.css` and the data files carry over unchanged, `partials.mjs` becomes `.astro` components, and the JS modules are reused as is.

## Licences
Fonts: Fraunces, DM Sans and Kalam (SIL Open Font License 1.1). Illustrations, photos and logos © Earthens.
