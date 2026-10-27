# Decisions log

Short records of choices that change how the site is built. Newest first.

## 2026-10-27 — No support for the old earthens.in website

**Decision:** The new site is a clean start. We do not redirect or keep any URL from the old ExportersIndia-style site.

**Why:** The website owner confirmed they don't want to carry over the old site's SEO. The focus is the new site and its own product pages.

**What changed:**
- Removed the 50 generated `.htm` redirect pages and the `_redirects` file.
- Removed `REDIRECTS` from `assets/js/config.js` and the `legacy` URL from every product and category in `assets/js/catalog.js`.
- Removed the redirect step from `scripts/build.mjs` and the redirect template from `scripts/partials.mjs`.
- Every product still has its own page at `products/<id>.html`, generated from `catalog.js`.

**Consequence:** After go-live, old links such as `about-us.htm` will show the site's `404.html`, which links back to the main pages. Submit `sitemap.xml` in Google Search Console so the new pages are indexed quickly.
