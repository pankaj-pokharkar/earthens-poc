/**
 * partials.mjs — every reusable HTML block, generated from the data files:
 *   assets/js/config.js   (site, contacts, socials, flags, pages)
 *   assets/js/catalog.js  (categories, products, export terms)
 *   assets/js/content.js  (awards, certificates, videos, reviews, FAQs)
 *
 * scripts/build.mjs injects these into pages between markers such as
 *     <!-- @partial header --> … <!-- /@partial header -->
 * and writes whole files for product pages.
 *
 * `r` is the path prefix back to the site root: '' for root pages, '../' for
 * products/*.html. Every link and asset path goes through it, so the site works
 * on a custom domain AND under a GitHub Pages sub-folder.
 *
 * Every value from the data files passes through esc() before it reaches HTML.
 */
import { SITE, OFFICES, CONTACT, SOCIAL, LISTINGS, STORES, PAGES, FEATURES, FORMS } from '../assets/js/config.js';
import { CATEGORIES, CATEGORIES_BY_ID, PRODUCTS, EXPORT, PRODUCT_PERKS, USES, productPath } from '../assets/js/catalog.js';
import { AWARDS, CERTIFICATES, VIDEOS, REVIEWS, ECOBHOJ_FAQ } from '../assets/js/content.js';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Escape text for HTML text and attribute values. */
export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const icon = (id, r = '', cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="${r}assets/img/icons.svg#${id}"></use></svg>`;

/** Absolute URL of a site path ("index.html" maps to the root). */
export const pageUrl = (file) => `${SITE.url}/${file === 'index.html' ? '' : file}`;

const MAIN_OFFICE = OFFICES[0];
const fullAddress = (o) => `${o.street}, ${o.city}, ${o.region} ${o.postalCode}, ${o.countryName}`;
const telHref = (n) => `tel:${n.replace(/[^+\d]/g, '')}`;
const money = (n) => `${EXPORT.currencySymbol}${Number(n).toLocaleString('en-IN')}`;
const ext = ' target="_blank" rel="noopener noreferrer"';
const newTab = '<span class="sr-only"> (opens in a new tab)</span>';

/** WhatsApp link with a pre-filled message, or the contact form if no number is set. */
export const whatsappHref = (text = CONTACT.whatsappGreeting, r = '') =>
  CONTACT.whatsapp ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}` : `${r}contact.html#message`;

const activeSocial = () => SOCIAL.filter((s) => s.url);

/* -------------------------------------------------------------------------- */
/* <head>                                                                      */
/* -------------------------------------------------------------------------- */

/** Content-Security-Policy. Add an origin here if you embed new third-party content. */
function csp() {
  const formOrigin = FORMS.endpoint ? ` ${new URL(FORMS.endpoint).origin}` : '';
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data: https://i.ytimg.com",
    "font-src 'self'",
    `connect-src 'self'${formOrigin}`,
    'frame-src https://www.youtube-nocookie.com https://www.google.com',
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    slogan: SITE.slogan,
    description: SITE.description,
    url: `${SITE.url}/`,
    logo: `${SITE.url}/assets/img/logo.png`,
    foundingDate: String(SITE.foundingYear),
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 51, maxValue: 100 },
    address: {
      '@type': 'PostalAddress',
      streetAddress: MAIN_OFFICE.street,
      addressLocality: MAIN_OFFICE.city,
      addressRegion: MAIN_OFFICE.region,
      postalCode: MAIN_OFFICE.postalCode,
      addressCountry: MAIN_OFFICE.countryCode,
    },
    ...(CONTACT.email ? { email: CONTACT.email } : {}),
    ...(CONTACT.phones[0] ? { telephone: CONTACT.phones[0].number } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(CONTACT.phones[0] ? { telephone: CONTACT.phones[0].number } : {}),
      ...(CONTACT.email ? { email: CONTACT.email } : {}),
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Hindi'],
    },
    award: AWARDS.map((a) => `${a.title}, ${a.by} (${a.year})`),
    sameAs: [...activeSocial().map((s) => s.url), ...LISTINGS],
    knowsAbout: ['Areca palm leaf tableware', 'Compostable plates', 'Biodegradable dinnerware', 'Eco-friendly party supplies'],
  };
}

const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, file], i) => ({ '@type': 'ListItem', position: i + 1, name, item: pageUrl(file) })),
});

function productLd(p) {
  const cat = CATEGORIES_BY_ID[p.category];
  const price = p.mrp ?? (FEATURES.showPrices ? p.price : null);
  return {
    '@type': 'Product',
    '@id': `${pageUrl(productPath(p))}#product`,
    name: p.name,
    description: productDescription(p),
    image: `${SITE.url}/${p.image ?? 'assets/img/og-image.jpg'}`,
    brand: { '@type': 'Brand', name: SITE.name },
    manufacturer: { '@id': `${SITE.url}/#organization` },
    category: cat?.name,
    material: EXPORT.material,
    color: EXPORT.colour,
    countryOfOrigin: EXPORT.origin,
    ...(price ? {
      offers: {
        '@type': 'Offer',
        price: String(price),
        priceCurrency: EXPORT.currency,
        availability: 'https://schema.org/InStock',
        url: pageUrl(productPath(p)),
        seller: { '@id': `${SITE.url}/#organization` },
      },
    } : {}),
  };
}

function structuredData(page, extra = []) {
  const graph = [organizationLd(), ...extra];
  if (page.key === 'home') {
    graph.push({ '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name, publisher: { '@id': `${SITE.url}/#organization` }, inLanguage: 'en-IN' });
  } else if (page.sitemap !== false && !page.breadcrumb) {
    graph.push(breadcrumbLd([['Home', 'index.html'], [page.label, page.file]]));
  }
  if (page.breadcrumb) graph.push(breadcrumbLd(page.breadcrumb));
  if (page.key === 'ecobhoj') {
    graph.push(...PRODUCTS.filter((p) => p.category === 'ecobhoj').map(productLd));
    graph.push({
      '@type': 'FAQPage',
      mainEntity: ECOBHOJ_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  // "<" is escaped so data can never close the <script> tag.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

export function head(page, r = '', extraLd = []) {
  const url = pageUrl(page.file);
  const indexable = page.sitemap !== false;
  const pre = page.preload;
  return `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${esc(csp())}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${indexable ? `<link rel="canonical" href="${esc(url)}">` : '<meta name="robots" content="noindex, follow">'}
<meta name="theme-color" content="#1f4a2c">
<meta property="og:type" content="${page.ogType ?? 'website'}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="${esc(SITE.locale)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(SITE.url)}/assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Nature's Table. Naturally. Earthens Areca palm leaf tableware beside a South Indian temple scene">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}favicon.ico" sizes="48x48">
<link rel="icon" href="${r}assets/img/icons/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="${r}assets/img/icons/apple-touch-icon.png">
<link rel="manifest" href="${r}site.webmanifest">
<link rel="preload" href="${r}assets/fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${r}assets/fonts/dm-sans-var.woff2" as="font" type="font/woff2" crossorigin>
${pre ? `<link rel="preload" as="image" type="image/webp" href="${r}${esc(pre.src)}"${pre.srcset ? ` imagesrcset="${esc(pre.srcset.replace(/assets\//g, `${r}assets/`))}" imagesizes="${esc(pre.sizes)}"` : ''} fetchpriority="high">\n` : ''}<link rel="stylesheet" href="${r}assets/css/styles.css">
<script type="module" src="${r}assets/js/main.js"></script>
${structuredData(page, extraLd)}
`;
}

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

function navItem(p, current, variant, r) {
  const isCurrent = p.key === current;
  const feature = p.feature ? ` data-feature="${esc(p.feature)}"${FEATURES[p.feature] ? '' : ' hidden'}` : '';
  const count = p.key === 'enquiry' && variant === 'desktop' ? '<span class="nav-count" data-enquiry-count hidden>0</span>' : '';
  const label = p.key === 'enquiry' ? `${esc(p.label)}<span class="sr-only"> cart</span>` : esc(p.label);
  return `<li${feature}><a class="nav-link" href="${r}${esc(p.file)}"${isCurrent ? ' aria-current="page"' : ''}><span class="nav-bubble tint-${esc(p.tint)}">${icon(p.icon, r)}${count}</span><span class="nav-label">${label}</span></a></li>`;
}

export function header(page, r = '') {
  const items = PAGES.filter((p) => p.nav);
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${r}index.html"${page.key === 'home' ? ' aria-current="page"' : ''}>
      <img src="${r}assets/img/logo.webp" alt="${esc(SITE.name)}, ${esc(SITE.tagline)}" width="420" height="350">
    </a>
    <nav class="primary-nav" aria-label="Main">
      <ul>${items.map((p) => navItem(p, page.key, 'desktop', r)).join('')}</ul>
    </nav>
    <details class="mobile-menu">
      <summary aria-label="Menu">${icon('menu', r)}</summary>
      <nav class="mobile-menu__panel" aria-label="Main menu">
        <ul>${items.map((p) => navItem(p, page.key, 'mobile', r)).join('')}</ul>
      </nav>
    </details>
  </div>
</header>
`;
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

export function footer(r = '') {
  const explore = ['products', 'ecobhoj', 'story', 'sustainability', 'certifications'].map((k) => PAGES.find((p) => p.key === k));
  const phone = CONTACT.phones[0];
  return `
<footer class="site-footer">
  <div class="crayon-band" role="presentation"></div>
  <div class="container footer-grid">
    <div class="footer-brand">
      <span class="logo-chip"><img src="${r}assets/img/logo.webp" alt="${esc(SITE.name)}" width="420" height="350" loading="lazy"></span>
      <p class="script">${esc(SITE.slogan)}</p>
      ${activeSocial().length ? `<ul class="footer-social" role="list">${activeSocial().map((s) => `<li><a href="${esc(s.url)}"${ext} aria-label="${esc(s.name)} (opens in a new tab)">${icon(s.icon, r)}</a></li>`).join('')}</ul>` : ''}
    </div>
    <nav aria-labelledby="footer-explore">
      <h2 id="footer-explore">Explore</h2>
      <ul>${explore.map((p) => `<li><a href="${r}${esc(p.file)}">${esc(p.label === 'EcoBhoj' ? 'EcoBhoj Party Pack' : p.label)}</a></li>`).join('')}</ul>
    </nav>
    <div>
      <h2>Visit us</h2>
      <address class="stack">
        <span>${esc(fullAddress(MAIN_OFFICE))}</span>
        <a href="${r}contact.html">All addresses &amp; directions</a>
      </address>
    </div>
    <div>
      <h2>Talk to us</h2>
      <ul>
        ${CONTACT.whatsapp ? `<li><a href="${esc(whatsappHref(undefined, r))}"${ext}>WhatsApp ${esc(CONTACT.phones.find((p) => p.number.replace(/\D/g, '') === CONTACT.whatsapp)?.number ?? '')}${newTab}</a></li>` : ''}
        ${phone ? `<li><a href="${esc(telHref(phone.number))}">Call ${esc(phone.number)}</a></li>` : ''}
        ${CONTACT.email ? `<li><a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></li>` : ''}
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© ${new Date().getFullYear()} ${esc(SITE.name)}. Exported by ${esc(SITE.exporter)}.</span>
    <span>GST ${esc(SITE.gst)}</span>
  </div>
</footer>
${CONTACT.whatsapp ? `<a class="wa-float" href="${esc(whatsappHref(undefined, r))}"${ext} aria-label="Chat with us on WhatsApp (opens in a new tab)">${icon('whatsapp', r)}</a>` : ''}
`;
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

/** Product image: real photo if set, else the shape illustration. */
function productImage(p, r, { large = false } = {}) {
  if (p.image) {
    return `<img class="is-photo" src="${r}${esc(p.image)}" alt="${esc(p.name)}" width="640" height="427" ${large ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  }
  const what = CATEGORIES_BY_ID[p.category]?.name.toLowerCase().replace(/s$/, '') ?? 'piece';
  return `<img src="${r}assets/img/shapes/${esc(p.art)}.svg" alt="Illustration of the ${esc(p.size)} ${esc(p.shape.toLowerCase())} palm leaf ${esc(what)}" width="400" height="400" ${large ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

const priceHtml = (p, cls = 'price-chip') => {
  if (p.mrp) return `<p class="${cls}"><strong>${money(p.mrp)}</strong> <span>MRP</span></p>`;
  if (FEATURES.showPrices && p.price) return `<p class="${cls}"><strong>${money(p.price)}</strong> <span>/ ${esc(EXPORT.priceUnit)}</span></p>`;
  return `<p class="${cls} ${cls}--ask"><span>Price on request</span></p>`;
};

const enquiryButton = (p) =>
  `<button type="button" class="btn btn--primary btn--small added-state" data-enquiry-add="${esc(p.id)}" aria-pressed="false" data-feature="enquiryCart"${FEATURES.enquiryCart ? '' : ' hidden'}>Add to enquiry</button>`;

export function productCard(p, r = '') {
  const cat = CATEGORIES_BY_ID[p.category];
  return `
  <li data-product="${esc(p.id)}">
    <article class="product-card">
      <div class="product-card__media tint-${esc(cat?.tint ?? 'yellow')}">${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}${productImage(p, r)}</div>
      <div class="product-card__body">
        <span class="eyebrow">${esc(cat?.name ?? '')}</span>
        <h3><a class="product-card__link" href="${r}${esc(productPath(p))}">${esc(p.name)}</a></h3>
        <p class="tag-row"><span>${esc(p.size)}</span><span>${esc(p.shape)}</span></p>
        ${priceHtml(p)}
      </div>
      <div class="product-card__actions">
        <span class="product-card__more" aria-hidden="true">${p.url ? 'See what’s inside' : 'Details & export info'} ${icon('arrow-right', r)}</span>
        ${enquiryButton(p)}
      </div>
    </article>
  </li>`;
}

export function productFilter() {
  return `
<nav class="filter-bar" aria-label="Product categories" data-filter-bar>
  <a class="chip" href="products.html" data-filter="all">All products <span class="chip__count">${PRODUCTS.length}</span></a>
${CATEGORIES.map((c) => `  <a class="chip chip--image" href="#${esc(c.id)}" data-filter="${esc(c.id)}"><img src="${esc(c.image)}" alt="" width="42" height="42" loading="lazy">${esc(c.name)}</a>`).join('\n')}
</nav>
`;
}

export function productGroups() {
  return CATEGORIES.map((c) => {
    const items = PRODUCTS.filter((p) => p.category === c.id);
    const body = items.length
      ? `<ul class="product-grid" role="list">${items.map((p) => productCard(p)).join('')}\n</ul>`
      : `<div class="empty-note"><p class="script">New ${esc(c.name.toLowerCase())} are on the way</p><p class="muted">Tell us the size and quantity you need and we will see what we can press for you.</p><a class="btn btn--primary" href="contact.html#message">Ask us</a></div>`;
    return `
<section class="product-group" id="${esc(c.id)}" data-product-group="${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
  <div class="product-group__head"><h2 id="h-${esc(c.id)}" tabindex="-1">${esc(c.name)}</h2><p class="muted">${esc(c.intro)}</p></div>
  ${body}
</section>`;
  }).join('\n');
}

/** Description used on product pages and in structured data. */
function productDescription(p) {
  if (p.category === 'ecobhoj') return 'Complete Areca palm leaf tableware for 15 guests: plates, bowls, serving trays, spoons, paper cups, napkins and a compostable garbage bag in one carry box.';
  return `The ${p.name.toLowerCase()} is pressed from a single, naturally fallen Areca palm leaf sheath, with no chemicals, glue or coating. ${p.note ?? ''} Sturdy, leak proof and fully compostable.`.replace(/\s+/g, ' ').trim();
}

/** A full product detail page. */
export function productPage(p) {
  const r = '../';
  const cat = CATEGORIES_BY_ID[p.category];
  const file = productPath(p);
  const page = {
    key: 'product', file, label: p.name, sitemap: 0.7, ogType: 'product',
    title: `${p.name} | Areca Palm Leaf ${cat.name} | Earthens`.slice(0, 70),
    description: `${p.name}: 100% natural Areca palm leaf, ${p.size.toLowerCase()}, ${p.shape.toLowerCase()}. ${FEATURES.showPrices && p.price ? `From ${money(p.price)} per piece, ` : ''}MOQ ${EXPORT.moq}. Compostable, leak proof, microwave safe. Exported from India.`,
    breadcrumb: [['Home', 'index.html'], ['Products', 'products.html'], [cat.name, `products.html#${cat.id}`], [p.name, file]],
  };
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const waText = `Hello Earthens! I am interested in the ${p.name} (${pageUrl(file)}). Please share a quote.`;
  const quoteHref = `${r}contact.html?product=${encodeURIComponent(p.id)}#message`;
  const terms = [
    ['tag', 'Price', FEATURES.showPrices && p.price ? `${money(p.price)} per ${EXPORT.priceUnit} (indicative)` : 'On request'],
    ['box', 'Minimum order', p.moq ?? EXPORT.moq],
    ['ship', 'Port', EXPORT.port],
    ['cash', 'Payment', EXPORT.payment],
    ['clock', 'Shelf life', EXPORT.shelfLife],
    ['globe', 'Origin', EXPORT.origin],
  ];

  return `<!doctype html>
<html lang="en-IN">
<head>
<!-- Generated by scripts/build.mjs from assets/js/catalog.js. Do not edit by hand. -->
${head(page, r, [productLd(p)])}
</head>
<body data-page="product">
${header(page, r)}
<main id="main" tabindex="-1">

  <nav class="breadcrumb container" aria-label="Breadcrumb">
    <ol>
      <li><a href="${r}index.html">Home</a></li>
      <li><a href="${r}products.html">Products</a></li>
      <li><a href="${r}products.html#${esc(cat.id)}">${esc(cat.name)}</a></li>
      <li><span aria-current="page">${esc(p.name)}</span></li>
    </ol>
  </nav>

  <section class="section section--tight" aria-labelledby="product-title">
    <div class="container split product-hero">
      <div class="product-visual tint-${esc(cat.tint)}">
        <span class="sticker" aria-hidden="true">100%<br>natural</span>
        ${productImage(p, r, { large: true })}
      </div>
      <div class="stack">
        <a class="eyebrow" href="${r}products.html#${esc(cat.id)}">${esc(cat.name)}</a>
        <h1 id="product-title" class="h2">${esc(p.name)}</h1>
        <p class="script">${esc(p.note ?? cat.intro)}</p>
        <ul class="spec-pills" role="list">
          <li>${icon('ruler', r)}<span><small>Size</small>${esc(p.size)}</span></li>
          <li>${icon('leaf', r)}<span><small>Shape</small>${esc(p.shape)}</span></li>
          <li><span class="swatch" aria-hidden="true"></span><span><small>Colour</small>${esc(EXPORT.colour)}</span></li>
        </ul>
        <div class="price-box">
          ${priceHtml(p, 'price-big')}
          <p class="small muted">${FEATURES.showPrices && p.price ? `${esc(EXPORT.priceNote)} ` : ''}Minimum order ${esc(p.moq ?? EXPORT.moq)}.</p>
        </div>
        <div class="cluster cluster--stack-sm">
          <a class="btn btn--primary" href="${esc(quoteHref)}">Get a quote ${icon('arrow-right', r)}</a>
          ${CONTACT.whatsapp ? `<a class="btn btn--outline" href="${esc(whatsappHref(waText))}"${ext}>${icon('whatsapp', r)} WhatsApp us${newTab}</a>` : ''}
          ${enquiryButton(p)}
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="perks-title">
    <div class="container">
      <h2 id="perks-title" class="h3 script script--bold">Good to know</h2>
      <ul class="perk-grid" role="list">
        ${PRODUCT_PERKS.map((k) => `<li><span class="perk-icon tint-${k.tint}">${icon(k.icon, r)}</span>${esc(k.label)}</li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="export-title">
    <div class="container">
      <div class="export-ticket">
        <div class="export-ticket__head">
          <p class="script">For importers &amp; distributors</p>
          <h2 id="export-title" class="h3">Export details at a glance</h2>
        </div>
        <dl class="export-terms">
          ${terms.map(([ic, k, v]) => `<div><dt>${icon(ic, r)}${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n          ')}
        </dl>
        <p class="export-ticket__pack"><strong>Packing:</strong> ${esc(EXPORT.packaging)}. ${esc(EXPORT.privateLabel)}.</p>
        <span class="export-ticket__stamp" aria-hidden="true">Made in<br>India</span>
      </div>
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="about-title">
    <div class="container container--narrow stack">
      <h2 id="about-title" class="h3">About this ${esc(cat.name.toLowerCase().replace(/s$/, ''))}</h2>
      <p class="lead">${esc(productDescription(p))}</p>
      <h3 class="small eyebrow">Perfect for</h3>
      <ul class="tag-cloud tag-cloud--small" role="list">${USES.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
    </div>
  </section>

  ${related.length ? `<section class="section section--paper" aria-labelledby="related-title">
    <div class="container">
      <h2 id="related-title" class="h2 section-head">More ${esc(cat.name.toLowerCase())}</h2>
      <ul class="product-grid" role="list">${related.map((x) => productCard(x, r)).join('')}
      </ul>
    </div>
  </section>` : ''}

</main>
${footer(r)}
</body>
</html>
`;
}

/* -------------------------------------------------------------------------- */
/* Home: categories, awards strip, videos, reviews                             */
/* -------------------------------------------------------------------------- */

export function categories() {
  return `
<ul class="category-grid" role="list">
${CATEGORIES.map((c) => `  <li><a class="category-card" href="${c.id === 'ecobhoj' ? 'ecobhoj.html' : `products.html#${esc(c.id)}`}"><img src="${esc(c.image)}" alt="" width="240" height="240" loading="lazy" decoding="async"><strong>${esc(c.name)}</strong><span>${esc(c.blurb)}</span></a></li>`).join('\n')}
</ul>
`;
}

/** Awards. variant 'strip' = compact row (home), 'cards' = full cards. */
export function awards(variant = 'cards') {
  if (variant === 'strip') {
    return `
<ul class="award-strip" role="list">
${AWARDS.map((a) => `  <li><span class="laurel">${icon('award')}</span><span><strong>${esc(a.title)}</strong><small>${esc(a.by)} · ${esc(a.when)}</small></span></li>`).join('\n')}
</ul>
`;
  }
  return `
<ul class="award-grid" role="list">
${AWARDS.map((a, i) => `  <li class="award-card tint-${['yellow', 'pink', 'green'][i % 3]}">
    <span class="award-card__ribbon" aria-hidden="true">${a.year}</span>
    <span class="laurel laurel--big">${icon('award')}</span>
    <h3>${esc(a.title)}</h3>
    <p class="award-card__by">${esc(a.by)}</p>
    <p class="small muted">${esc(a.where)} · ${esc(a.when)}</p>
    <p>${esc(a.for)}</p>
  </li>`).join('\n')}
</ul>
`;
}

/**
 * Videos: a lightweight "facade". Only a thumbnail loads; the YouTube player
 * (≈1 MB) loads when someone presses play (assets/js/modules/video.js).
 * Without JavaScript the link simply opens the video on YouTube.
 */
export function videos() {
  return `
<ul class="video-grid" role="list">
${VIDEOS.map((v) => `  <li>
    <figure class="video">
      <a class="video__facade" href="https://www.youtube.com/watch?v=${esc(v.id)}" data-video-id="${esc(v.id)}" data-video-title="${esc(v.title)}">
        <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async">
        <span class="video__play" aria-hidden="true">${icon('play')}</span>
        <span class="sr-only">Play video: ${esc(v.title)}</span>
      </a>
      <figcaption><strong>${esc(v.title)}</strong>${esc(v.caption)}</figcaption>
    </figure>
  </li>`).join('\n')}
</ul>
`;
}

export function reviews() {
  const stars = Array.from({ length: 5 }, (_, i) => `<span class="star${i < Math.floor(REVIEWS.rating) || i < REVIEWS.rating ? '' : ' star--off'}">${icon(i + 1 > REVIEWS.rating && i < REVIEWS.rating ? 'star-half' : 'star')}</span>`).join('');
  return `
<div class="review-wrap">
  <div class="rating-card">
    <p class="rating-card__score"><strong>${REVIEWS.rating}</strong><span>out of 5</span></p>
    <p class="stars" role="img" aria-label="Rated ${REVIEWS.rating} out of 5">${stars}</p>
    <p class="small">${REVIEWS.count} buyer ratings on <a href="${esc(REVIEWS.sourceUrl)}"${ext}>${esc(REVIEWS.source)}${newTab}</a></p>
  </div>
  <ul class="quote-list" role="list">
${REVIEWS.quotes.map((q) => `    <li><blockquote class="quote-card"><p>“${esc(q.text)}”</p><footer>${esc(q.name)} · ${esc(q.product)} · ${esc(q.date)}</footer></blockquote></li>`).join('\n')}
  </ul>
</div>
`;
}

/* -------------------------------------------------------------------------- */
/* Certifications                                                              */
/* -------------------------------------------------------------------------- */

export function certificates() {
  return `
<ul class="grid-auto" role="list">
${CERTIFICATES.map((c) => `  <li class="cert-card">
    <span class="seal">${icon('seal')}</span>
    <h3>${esc(c.title)}</h3>
    <dl><dt>Reference</dt><dd>${esc(c.ref)}</dd><dt>Issued by</dt><dd>${esc(c.issuer)}</dd></dl>
    <p class="small muted">${esc(c.note)}</p>
    ${c.file ? `<a class="btn btn--outline btn--small" href="${esc(c.file)}"${ext}>${icon('download')} View PDF${newTab}</a>` : '<span class="soon-pill">PDF coming soon</span>'}
  </li>`).join('\n')}
</ul>
`;
}

export function companyFacts() {
  const rows = [
    ['Nature of business', SITE.businessType],
    ['Established', SITE.foundingYear],
    ['Team size', SITE.employees.replace('-', '–')],
    ['Women artisans', SITE.artisans],
    ['Markets', SITE.markets],
    ['CEO', SITE.ceo],
    ['Legal status', SITE.legalStatus],
    ['Exported by', SITE.exporter],
    ['GST', SITE.gst],
  ];
  return `
<dl class="facts">
${rows.map(([k, v]) => `  <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}
</dl>
`;
}

/* -------------------------------------------------------------------------- */
/* Contact                                                                     */
/* -------------------------------------------------------------------------- */

export function contactTiles() {
  const phone = CONTACT.phones[0];
  return `
<ul class="contact-tiles" role="list">
  <li><a class="contact-tile tint-green" href="${esc(whatsappHref())}"${CONTACT.whatsapp ? ext : ''}><span class="disc">${icon('whatsapp')}</span><span><strong>WhatsApp</strong>${CONTACT.whatsapp ? 'Fastest reply' : 'Message us'}${CONTACT.whatsapp ? newTab : ''}</span></a></li>
  <li><a class="contact-tile tint-yellow" href="${phone ? esc(telHref(phone.number)) : 'contact.html#message'}"><span class="disc">${icon('phone')}</span><span><strong>Call us</strong>${esc(phone?.number ?? 'Request a call back')}</span></a></li>
  <li><a class="contact-tile tint-pink" href="${CONTACT.email ? `mailto:${esc(CONTACT.email)}` : 'contact.html#message'}"><span class="disc">${icon('mail')}</span><span><strong>Email</strong>${esc(CONTACT.email || 'Write to us')}</span></a></li>
</ul>
`;
}

export function visitCard() {
  return `
<div class="dark-panel stack">
  <p class="script">Where the leaves become plates</p>
  <h2 class="h3">Visit or call us</h2>
  ${CONTACT.person ? `<p>Ask for <strong>${esc(CONTACT.person)}</strong></p>` : ''}
  ${OFFICES.map((o) => `<div class="office">
    <h3 class="eyebrow">${esc(o.label)}</h3>
    <address>${esc(o.name)}<br>${esc(o.street)},<br>${esc(o.city)}, ${esc(o.region)} ${esc(o.postalCode)}, ${esc(o.countryName)}</address>
    ${o.mapsUrl ? `<a class="btn btn--gold btn--small" href="${esc(o.mapsUrl)}"${ext}>${icon('pin')} Get directions${newTab}</a>` : ''}
  </div>`).join('\n  ')}
  <div class="office">
    <h3 class="eyebrow">Phone</h3>
    <ul class="phone-list" role="list">${CONTACT.phones.map((p) => `<li><a href="${esc(telHref(p.number))}">${esc(p.number)}</a></li>`).join('')}</ul>
    ${CONTACT.supportEmail ? `<p class="small">Feedback &amp; complaints: <a href="mailto:${esc(CONTACT.supportEmail)}">${esc(CONTACT.supportEmail)}</a></p>` : ''}
  </div>
</div>
`;
}

/** <datalist> of product names for the contact form's product field. */
export function productDatalist() {
  return `<datalist id="product-options">${PRODUCTS.map((p) => `<option value="${esc(p.name)}"></option>`).join('')}</datalist>`;
}

/* -------------------------------------------------------------------------- */
/* EcoBhoj                                                                     */
/* -------------------------------------------------------------------------- */

export function ecobhojBuy() {
  const amazon = STORES.amazonEcoBhoj;
  return `
<div class="cluster cluster--stack-sm" id="buy">
  ${amazon ? `<a class="btn btn--primary" href="${esc(amazon)}"${ext}>Buy on Amazon${newTab}</a>` : `<a class="btn btn--primary" href="contact.html?product=ecobhoj-party-pack-round#message">Order EcoBhoj</a>`}
  ${CONTACT.whatsapp ? `<a class="btn btn--outline" href="${esc(whatsappHref('Hello Earthens! I would like to order the EcoBhoj Party Pack.'))}"${ext}>${icon('whatsapp')} Order on WhatsApp${newTab}</a>` : `<a class="btn btn--outline" href="contact.html#message">Bulk &amp; gifting enquiry</a>`}
  ${enquiryButton(PRODUCTS.find((p) => p.category === 'ecobhoj'))}
</div>
`;
}

export function ecobhojFaq() {
  return `
<div class="faq">
${ECOBHOJ_FAQ.map((f) => `  <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}
</div>
`;
}
