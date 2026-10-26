# Earthens website

The official website of **Earthens**, makers of 100% natural Areca palm leaf tableware and the **EcoBhoj Party Pack**, from Tumkur, Karnataka.

It is a fast, accessible, plain **HTML + CSS + JavaScript** site with no framework and no runtime dependencies, built to be hosted on **GitHub Pages**.

| Lighthouse (local test) | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | 100 | 100 | 100 | 100 |
| Mobile (simulated slow 4G) | 90–98 | 100 | 100 | 100 |

---

## Quick start

```bash
# 1. Run locally (any static server works)
npm run serve            # → http://localhost:8080

# 2. After editing config, catalog or partials, regenerate the shared HTML
npm run build

# 3. Check everything before committing
npm run check            # or: npm run verify  (build + check)
```

Requirements: **Node 18+** for the build and check scripts, and Python 3 for `npm run serve` (or use any static server). Visitors only ever download the static files.

---

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (the files sit at the repo root).
2. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then `main` and `/ (root)`.
3. The site goes live at `https://<user>.github.io/<repo>/`.
4. **Custom domain** (for example `www.earthens.in`): add it under Settings → Pages, create a `CNAME` file containing `www.earthens.in`, point your DNS `CNAME` record to `<user>.github.io`, and tick **Enforce HTTPS**.
5. Make sure `SITE.url` in `assets/js/config.js` matches the live domain, then run `npm run build`. It drives canonical URLs, the sitemap and social previews.

> All links are relative, so the site also works under a `/<repo>/` sub-path. The only exception is `404.html` on deep URLs; using a custom domain avoids that.

---

## Project structure

```
.
├── index.html, products.html, ecobhoj.html, our-story.html,
│   sustainability.html, certifications.html, contact.html,
│   enquiry.html, 404.html          ← pages (hand-written content + generated blocks)
├── assets/
│   ├── css/styles.css              ← THE stylesheet (tokens at the top)
│   ├── js/
│   │   ├── config.js               ← THE constants: business facts, contacts, flags, pages
│   │   ├── catalog.js              ← THE product range
│   │   ├── main.js                 ← single entry point
│   │   └── modules/                ← nav, feature flags, product filter, forms, enquiry cart
│   ├── fonts/                      ← self-hosted woff2 (Fraunces, DM Sans, Kalam; SIL OFL)
│   └── img/                        ← WebP images, SVG decor, icon sprite, shapes, favicons
├── scripts/
│   ├── build.mjs                   ← injects partials, writes sitemap/robots/llms/manifest
│   ├── partials.mjs                ← <head>, header, footer, product grid, contact tiles
│   └── check.mjs                   ← quality gate (SEO tags, a11y basics, CSP, broken links)
├── sitemap.xml, robots.txt, llms.txt, site.webmanifest   ← generated, commit them
├── _headers                        ← security headers for Netlify / Cloudflare Pages
└── .github/workflows/ci.yml        ← runs build + check + Lighthouse on every PR
```

### How "reusable" works without a framework

Shared blocks live in **one place** (`scripts/partials.mjs`) and are copied into every page between markers:

```html
<!-- @partial header --> …generated… <!-- /@partial header -->
```

`npm run build` regenerates these blocks. **Do not hand-edit inside a marker**; it will be overwritten. Everything outside the markers is normal HTML you edit directly.

The generated output is committed, so GitHub Pages serves plain files and needs no build step on the server.

---

## Common tasks

| I want to… | Edit | Then |
| --- | --- | --- |
| Change phone, WhatsApp, email, socials | `CONTACT`, `SOCIAL` in `config.js` | `npm run build` |
| Add or edit a product | `PRODUCTS` in `catalog.js` | `npm run build` |
| Add a product category | `CATEGORIES` in `catalog.js` (+ a 240×240 WebP in `assets/img/categories/`) | `npm run build` |
| Change a page title or description | `PAGES` in `config.js` | `npm run build` |
| Change colours or fonts | tokens at the top of `styles.css` | — |
| Turn the enquiry cart on | `FEATURES.enquiryCart = true` in `config.js` | `npm run build` |
| Connect the forms to email | `FORMS.endpoint` (e.g. a Formspree URL) in `config.js` | `npm run build` (adds it to the CSP) |
| Add a new page | copy a page, give `<body data-page="key">`, add it to `PAGES` | `npm run build` |
| Replace an illustration with a photo | set `image: 'assets/img/…webp'` on the product | `npm run build` |

### Feature flag: enquiry cart

`FEATURES.enquiryCart` (default `false`) controls the "Add to enquiry" buttons, the header cart icon and `enquiry.html`. Visitors collect products and send **one** enquiry for a quote. There is no checkout and no payment. The cart is stored only in the visitor's browser (`localStorage`) and is validated on every read.

### Forms

Without a backend, forms fall back in this order: `FORMS.endpoint` (JSON POST) → WhatsApp (`CONTACT.whatsapp`) → email (`CONTACT.email`). Until one is set, submitting shows a friendly error. A free [Formspree](https://formspree.io) form is the quickest way to receive enquiries by email.

---

## Code conventions

- **HTML**: semantic landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page, headings in order, every `img` has `alt` + `width` + `height`.
- **CSS**: one file, mobile-first, tokens only (no hard-coded colours outside `:root`), BEM-ish class names (`block__element--modifier`). **No inline `style=""`**, because the Content-Security-Policy blocks it.
- **JS**: ES modules, no build step, no dependencies. Each module has one job and does nothing if its markup is absent. **Never use `innerHTML` with data**; use `el()` / `textContent` from `modules/dom.js`.
- **Progressive enhancement**: every page works without JavaScript. The menu is a native `<details>`, the product filter falls back to anchor links, and the Round/Square switch is pure CSS.
- **Comments** explain *why*, not *what*. Each file starts with a short header saying what it owns.

---

## Security

- **Content-Security-Policy** (in every `<head>`): only same-origin scripts, styles, fonts and images; no inline scripts or styles; no plugins; forms post only to the same origin (or the configured form endpoint).
- No third-party scripts, trackers, CDNs or cookies. Fonts are self-hosted, which also helps privacy and GDPR.
- External links use `rel="noopener noreferrer"`.
- Form input is length-capped, validated, sent with `credentials: 'omit'`, and protected by a honeypot field. Nothing user-supplied is ever inserted as HTML.
- GitHub Pages cannot set HTTP headers, so the CSP is a `<meta>` tag. If you move to **Netlify or Cloudflare Pages**, the included `_headers` file adds HSTS, `X-Content-Type-Options`, `frame-ancestors`, `Permissions-Policy` and more.

## Accessibility (WCAG 2.2 AA)

Skip link, visible focus rings, `aria-current` on the active page, labelled form fields with inline error messages, live-region announcements for filtering and cart changes, 44px+ touch targets, AA colour contrast, `prefers-reduced-motion` support, and decorative images hidden from screen readers.

## SEO and AEO (answer-engine optimisation)

- Unique `<title>`, meta description, canonical URL and Open Graph / Twitter tags per page (from `PAGES` in `config.js`).
- **Structured data (JSON-LD)**: `Organization` on every page, `WebSite` on home, `BreadcrumbList` on inner pages, `Product` + `Offer` + `FAQPage` on EcoBhoj.
- `sitemap.xml` and `robots.txt`, with AI crawlers (GPTBot, ClaudeBot, PerplexityBot and others) explicitly allowed.
- **`llms.txt`**: a plain-language fact sheet for AI assistants, generated from `config.js` and `catalog.js`.
- Content is written answer-first (FAQs, "How to compost", the comparison table) so search snippets and AI answers can quote it directly.
- Real HTML for every product (generated at build time, not rendered by JS), so crawlers see the full catalogue.

> The EcoBhoj `Product` / `FAQPage` JSON-LD lives in `ecobhoj.html`. If you change the FAQ text or price, update both the visible text and the JSON-LD.

## Performance

Self-hosted variable fonts with `font-display: swap` and preloading, WebP images with `srcset`, `width`/`height`, lazy loading below the fold, a high-priority preloaded hero image, a single small CSS file, and about 10 KB of deferred, module-based JS. GitHub Pages serves everything gzipped over HTTP/2 from a CDN.

---

## Before launch: placeholders to replace

- [ ] `CONTACT` (WhatsApp, phone, email) and `SOCIAL` links in `config.js`
- [ ] `FORMS.endpoint` (or a WhatsApp/email fallback)
- [ ] Amazon listing link for EcoBhoj (`ecobhoj.html#buy`)
- [ ] Certificates on `certifications.html` (only ones you actually hold, with PDFs in `assets/docs/`)
- [ ] Photos: artisans, family, the Tumkur unit (search the HTML for `[ Photo`)
- [ ] Impact numbers on `sustainability.html` (search for `[X]`)
- [ ] Roles on `our-story.html` (search for `[Role]`)
- [ ] **High-resolution artwork**: the hero scene and category circles were cut from a concept image (about 500 px wide). Ask your illustrator for the originals at 2× size and replace the WebP files with the same names.
- [ ] A transparent **SVG logo** (the current logo is a small 150 px image)
- [ ] Google Search Console + Bing Webmaster Tools: submit `sitemap.xml`

---

## Plain HTML or Astro?

**Plain HTML is a good fit today**: about 9 pages, a small catalogue, a small team, free GitHub Pages hosting, and top Lighthouse scores. The tiny build script gives you shared header/footer and a data-driven product list without a framework.

**Move to [Astro](https://astro.build) when** any of these become true:

- the catalogue grows to individual product pages (one URL per product is great for SEO),
- you add a blog, recipes or festival campaigns,
- you need multiple languages (Hindi, Kannada, German, French),
- non-developers should edit content through a CMS.

Astro outputs the same zero-JS static HTML (so the same Lighthouse scores), but adds components, content collections, automatic image optimisation (AVIF/WebP and resizing) and i18n routing. This codebase migrates cleanly: `styles.css` stays as is, `config.js` and `catalog.js` become content collections, `partials.mjs` becomes `Header.astro` and `Footer.astro`, and the JS modules are reused unchanged. Astro also deploys to GitHub Pages with an official Action.

---

## Licences

Fonts: Fraunces, DM Sans and Kalam, all under the SIL Open Font License 1.1. Illustrations, photos and the logo are © Earthens.
