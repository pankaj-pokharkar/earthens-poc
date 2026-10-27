# AGENTS.md — guide for AI coding assistants (and new developers)

Read this before changing the Earthens site. It is short on purpose.

## The files that own everything (single source of truth)
- `assets/js/config.js` — business facts, addresses, contacts, socials, feature flags, forms, pages.
- `assets/js/catalog.js` — categories, products, prices, export terms. Every product gets its own page, `products/<id>.html`.
- `assets/js/content.js` — awards, certificates, videos, reviews, EcoBhoj FAQ.
- `assets/css/styles.css` — all styling; design tokens at the top.
- `scripts/partials.mjs` — every shared HTML template (incl. product pages).

Generated, never edit by hand: `products/*.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `site.webmanifest`, and anything between partial markers.

## Golden rules
1. **Never hand-edit between `<!-- @partial X -->` markers.** Change `scripts/partials.mjs` or the config, then run `npm run build`.
2. **No inline `style=""` and no inline `<script>`** (except `application/ld+json`). The CSP blocks them. Add classes in `styles.css`.
3. **No `innerHTML` with data.** Build DOM with `el()` / `textContent` from `assets/js/modules/dom.js`.
4. **No new dependencies or CDNs** without a strong reason. Self-host fonts/images; update the CSP if you must add an origin.
5. **Progressive enhancement**: the page must work with JavaScript off.
6. **Accessibility**: one `<h1>`, ordered headings, labels on inputs, `alt` + `width` + `height` on every image, AA contrast (use tokens), focus visible.
7. **SEO**: if you add a page, add it to `PAGES` (title ≤ 60 chars, description 140–160 chars). Structured data is generated from the same data as the visible text, so edit the data, not the JSON-LD. The old earthens.in site is not supported: no redirects, no `.htm` pages, no legacy URLs (see `docs/DECISIONS.md`).
8. **Don't invent facts** (certificates, numbers, claims). Use a visible `[placeholder]` instead.

## Before you finish
```bash
npm run verify   # build + check; must print "✓ 44 pages passed" (9 pages + 35 product pages)
```
Then open the changed pages at 390 px and 1440 px wide.

## Brand voice
Warm, simple, specific. Short sentences. South Indian, nature-led, crayon-artistic. Handwritten accents (Kalam, terracotta) for feelings; Fraunces serif for headings; DM Sans for reading. Slogan: "Good Food. Great Company. Happier Planet."
