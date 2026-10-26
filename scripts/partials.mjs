/**
 * partials.mjs — reusable HTML blocks, generated from config.js and catalog.js.
 *
 * Each export returns an HTML string. scripts/build.mjs injects them into every
 * page between markers like:
 *     <!-- @partial header -->  ...generated...  <!-- /@partial header -->
 *
 * To change the header, footer, nav or <head> for ALL pages, edit this file and
 * run `npm run build`. Never hand-edit the generated block inside a page: it is
 * overwritten on the next build.
 *
 * Every value from config/catalog goes through esc() before it reaches HTML.
 */
import { SITE, CONTACT, SOCIAL, PAGES, FEATURES, FORMS } from '../assets/js/config.js';
import { CATEGORIES, PRODUCTS, COMMON_SPECS } from '../assets/js/catalog.js';

/** Escape text for safe use in HTML text and attribute values. */
export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="assets/img/icons.svg#${id}"></use></svg>`;

/** Absolute URL for a page file ("index.html" maps to the site root). */
export const pageUrl = (file) => `${SITE.url}/${file === 'index.html' ? '' : file}`;

/** Visible nav items: in nav, and their feature flag (if any) is respected at runtime. */
const navPages = () => PAGES.filter((p) => p.nav);

/** WhatsApp / phone / email links with safe fallbacks to the contact page. */
export const contactLinks = () => ({
  whatsapp: CONTACT.whatsapp ? `https://wa.me/${CONTACT.whatsapp}` : 'contact.html#message',
  whatsappLabel: CONTACT.whatsapp ? `+${CONTACT.whatsapp}` : 'Message us',
  phone: CONTACT.phone ? `tel:${CONTACT.phone.replace(/[^+\d]/g, '')}` : 'contact.html#message',
  phoneLabel: CONTACT.phone || 'Request a call back',
  email: CONTACT.email ? `mailto:${CONTACT.email}` : 'contact.html#message',
  emailLabel: CONTACT.email || 'Write to us',
});

/* -------------------------------------------------------------------------- */
/* <head>                                                                      */
/* -------------------------------------------------------------------------- */

/** Content-Security-Policy. Add origins here if you embed third-party content. */
function csp() {
  const formOrigin = FORMS.endpoint ? new URL(FORMS.endpoint).origin : '';
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${formOrigin ? ` ${formOrigin}` : ''}`,
    "frame-src https://www.google.com",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/** Organization structured data (every page) — helps search and AI answer engines. */
function organizationLd() {
  const sameAs = Object.values(SOCIAL).filter(Boolean);
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
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.countryCode,
    },
    ...(CONTACT.email ? { email: CONTACT.email } : {}),
    ...(CONTACT.phone ? { telephone: CONTACT.phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: ['Areca palm leaf tableware', 'Compostable plates', 'Biodegradable dinnerware', 'Eco-friendly party supplies'],
  };
}

function structuredData(page) {
  const graph = [organizationLd()];
  if (page.key === 'home') {
    graph.push({ '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name, publisher: { '@id': `${SITE.url}/#organization` }, inLanguage: 'en-IN' });
  } else if (page.sitemap !== false) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: page.label, item: pageUrl(page.file) },
      ],
    });
  }
  // JSON in <script> needs "<" escaped so a value can never close the tag.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

export function head(page) {
  const url = pageUrl(page.file);
  const indexable = page.sitemap !== false;
  return `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${esc(csp())}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${indexable ? `<link rel="canonical" href="${esc(url)}">` : '<meta name="robots" content="noindex, follow">'}
<meta name="theme-color" content="#1f4a2c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="${esc(SITE.locale)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(SITE.url)}/assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Earthens logo beside a hand-painted South Indian temple scene">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" href="assets/img/icons/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/img/icons/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/dm-sans-var.woff2" as="font" type="font/woff2" crossorigin>
${page.preload ? `<link rel="preload" href="${esc(page.preload)}" as="image" type="image/webp" fetchpriority="high">\n` : ''}<link rel="stylesheet" href="assets/css/styles.css">
<script type="module" src="assets/js/main.js"></script>
${structuredData(page)}
`;
}

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

function navItem(p, current, variant) {
  const isCurrent = p.key === current;
  const feature = p.feature ? ` data-feature="${esc(p.feature)}"${FEATURES[p.feature] ? '' : ' hidden'}` : '';
  const count = p.key === 'enquiry' ? '<span class="nav-count" data-enquiry-count>0</span>' : '';
  const label = p.key === 'enquiry' ? `${esc(p.label)}<span class="sr-only"> cart</span>` : esc(p.label);
  return `<li${feature}><a class="nav-link" href="${esc(p.file)}"${isCurrent ? ' aria-current="page"' : ''}><span class="nav-bubble tint-${esc(p.tint)}">${icon(p.icon)}${variant === 'desktop' ? count : ''}</span><span class="nav-label">${label}</span></a></li>`;
}

export function header(page) {
  const items = navPages();
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="index.html"${page.key === 'home' ? ' aria-current="page"' : ''}>
      <img src="assets/img/logo.webp" alt="${esc(SITE.name)}, ${esc(SITE.tagline)}" width="150" height="124">
    </a>
    <nav class="primary-nav" aria-label="Main">
      <ul>${items.map((p) => navItem(p, page.key, 'desktop')).join('')}</ul>
    </nav>
    <details class="mobile-menu">
      <summary aria-label="Menu">${icon('menu')}</summary>
      <nav class="mobile-menu__panel" aria-label="Main">
        <ul>${items.map((p) => navItem(p, page.key, 'mobile')).join('')}</ul>
      </nav>
    </details>
  </div>
</header>
`;
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

export function footer() {
  const links = contactLinks();
  const explore = ['products', 'ecobhoj', 'story', 'sustainability', 'certifications'].map((k) => PAGES.find((p) => p.key === k));
  const social = Object.entries(SOCIAL).filter(([, url]) => url);
  const a = SITE.address;
  return `
<footer class="site-footer">
  <div class="crayon-band" role="presentation"></div>
  <div class="container footer-grid">
    <div class="footer-brand">
      <span class="logo-chip"><img src="assets/img/logo.webp" alt="${esc(SITE.name)}" width="150" height="124" loading="lazy"></span>
      <p class="script">${esc(SITE.slogan)}</p>
    </div>
    <nav aria-labelledby="footer-explore">
      <h2 id="footer-explore">Explore</h2>
      <ul>${explore.map((p) => `<li><a href="${esc(p.file)}">${esc(p.label === 'EcoBhoj' ? 'EcoBhoj Party Pack' : p.label)}</a></li>`).join('')}</ul>
    </nav>
    <div>
      <h2>Visit us</h2>
      <address class="stack">
        <span>${esc(a.street)}, ${esc(a.city)}, ${esc(a.region)} ${esc(a.postalCode)}, ${esc(a.countryName)}</span>
        <a href="contact.html">Contact us</a>
      </address>
    </div>
    <div>
      <h2>Talk to us</h2>
      <ul>
        <li><a href="${esc(links.whatsapp)}">WhatsApp: ${esc(links.whatsappLabel)}</a></li>
        <li><a href="${esc(links.email)}">Email: ${esc(links.emailLabel)}</a></li>
      </ul>
      ${social.length ? `<div class="footer-social">${social.map(([name, url]) => `<a href="${esc(url)}" rel="noopener noreferrer me" target="_blank" aria-label="${esc(name)} (opens in a new tab)">${icon(name)}</a>`).join('')}</div>` : ''}
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© ${new Date().getFullYear()} ${esc(SITE.name)}. Exported by ${esc(SITE.exporter)}.</span>
    <span>GST ${esc(SITE.gst)}</span>
  </div>
</footer>
${CONTACT.whatsapp ? `<a class="wa-float" href="${esc(links.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp (opens in a new tab)">${icon('whatsapp')}</a>` : ''}
`;
}

/* -------------------------------------------------------------------------- */
/* Home: category circles                                                      */
/* -------------------------------------------------------------------------- */

export function categories() {
  return `
<ul class="category-grid" role="list">
${CATEGORIES.map((c) => `  <li><a class="category-card" href="${c.id === 'ecobhoj' ? 'ecobhoj.html' : `products.html#${esc(c.id)}`}"><img src="${esc(c.image)}" alt="" width="240" height="240" loading="lazy" decoding="async"><strong>${esc(c.name)}</strong><span>${esc(c.blurb)}</span></a></li>`).join('\n')}
</ul>
`;
}

/* -------------------------------------------------------------------------- */
/* Products page: filter chips + grouped product grid                          */
/* -------------------------------------------------------------------------- */

const TINT_BY_CATEGORY = { plates: 'pink', bowls: 'green', cups: 'yellow', cutlery: 'blue', trays: 'lilac', specialty: 'peach', ecobhoj: 'green' };

function productCard(p) {
  const tint = TINT_BY_CATEGORY[p.category] ?? 'yellow';
  const img = p.image
    ? `<img class="is-photo" src="${esc(p.image)}" alt="${esc(p.name)} box" width="640" height="427" loading="lazy" decoding="async">`
    : `<img src="assets/img/shapes/${esc(p.shape)}.svg" alt="Illustration of a ${esc(p.size.toLowerCase())} palm leaf ${esc(p.category.replace(/s$/, ''))}" width="400" height="400" loading="lazy" decoding="async">`;
  const specs = [['Size', p.size], ...(p.specs ?? []), ...(p.category === 'ecobhoj' ? [] : COMMON_SPECS)];
  return `
  <li data-product="${esc(p.id)}">
    <article class="product-card" aria-labelledby="p-${esc(p.id)}">
      <div class="product-card__media tint-${tint}">${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}${img}</div>
      <div class="product-card__body">
        <span class="eyebrow">${esc(CATEGORIES.find((c) => c.id === p.category)?.name ?? p.category)}</span>
        <h3 id="p-${esc(p.id)}">${esc(p.name)}</h3>
        <span class="size">${esc(p.size)}</span>
        ${p.price ? `<span class="price-tag">${esc(p.price)}</span>` : ''}
      </div>
      <details>
        <summary>Specifications</summary>
        <dl class="spec-list">${specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      </details>
      <div class="product-card__actions">
        ${p.url ? `<a class="btn btn--outline btn--small" href="${esc(p.url)}">See what's inside</a>` : `<a class="btn btn--outline btn--small" href="contact.html#message">Ask for a quote</a>`}
        <button type="button" class="btn btn--primary btn--small added-state" data-enquiry-add="${esc(p.id)}" aria-pressed="false" data-feature="enquiryCart"${FEATURES.enquiryCart ? '' : ' hidden'}>Add to enquiry</button>
      </div>
    </article>
  </li>`;
}

export function productFilter() {
  return `
<nav class="filter-bar" aria-label="Product categories" data-filter-bar>
  <a class="chip" href="products.html" data-filter="all">All products</a>
${CATEGORIES.map((c) => `  <a class="chip chip--image" href="#${esc(c.id)}" data-filter="${esc(c.id)}"><img src="${esc(c.image)}" alt="" width="42" height="42" loading="lazy">${esc(c.name)}</a>`).join('\n')}
</nav>
`;
}

export function productGroups() {
  return CATEGORIES.map((c) => {
    const items = PRODUCTS.filter((p) => p.category === c.id);
    const body = items.length
      ? `<ul class="product-grid" role="list">${items.map(productCard).join('')}\n</ul>`
      : `<div class="empty-note"><p class="script">New ${esc(c.name.toLowerCase())} are on the way</p><p class="muted">Tell us the size and quantity you need and we will see what we can press for you.</p><a class="btn btn--primary" href="contact.html#message">Ask us</a></div>`;
    return `
<section class="product-group" id="${esc(c.id)}" data-product-group="${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
  <h2 id="h-${esc(c.id)}" tabindex="-1">${esc(c.name)}</h2>
  ${body}
</section>`;
  }).join('\n');
}

/** Contact tiles (contact page). */
export function contactTiles() {
  const l = contactLinks();
  const ext = (href) => (href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : '');
  return `
<ul class="contact-tiles" role="list">
  <li><a class="contact-tile tint-green" href="${esc(l.whatsapp)}"${ext(l.whatsapp)}><span class="disc">${icon('whatsapp')}</span><span><strong>WhatsApp</strong>${esc(l.whatsappLabel)}</span></a></li>
  <li><a class="contact-tile tint-yellow" href="${esc(l.phone)}"><span class="disc">${icon('phone')}</span><span><strong>Call us</strong>${esc(l.phoneLabel)}</span></a></li>
  <li><a class="contact-tile tint-pink" href="${esc(l.email)}"><span class="disc">${icon('mail')}</span><span><strong>Email</strong>${esc(l.emailLabel)}</span></a></li>
</ul>
`;
}
