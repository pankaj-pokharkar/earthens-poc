---
name: earthens-site
description: Maintain the Earthens static website (plain HTML/CSS/JS on GitHub Pages). Use when adding products, pages or content, changing contacts or feature flags, or restyling the site.
---

# Earthens site maintenance

Follow `AGENTS.md` at the repo root. Key workflow:

1. Edit the source of truth, never generated blocks:
   - business facts, contacts, socials, flags, page meta → `assets/js/config.js`
   - products, prices, export terms → `assets/js/catalog.js`
   - awards, certificates, videos, reviews, FAQ → `assets/js/content.js`
   - shared header/footer/head/product grid → `scripts/partials.mjs`
   - styles → `assets/css/styles.css` (tokens at the top)
2. Run `npm run verify` (build + check). Fix every reported problem.
3. Preview with `npm run serve` at 390 px and 1440 px widths.
4. For a new page: copy an existing page, set `<body data-page="key">`, keep the partial markers, add the page to `PAGES`, then build.
5. Images: follow `docs/IMAGES.md` (WebP, sizes, file names).
6. Never invent facts. Use visible `[placeholders]` for unknown numbers, certificates, contacts.
