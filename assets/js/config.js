/**
 * config.js — the ONE place for site-wide settings and business facts.
 *
 * Change a value here, run `npm run build`, and it updates everywhere:
 * header, footer, contact page, WhatsApp button, forms, structured data (SEO),
 * llms.txt and sitemap. Nothing here is repeated in the HTML.
 *
 * Companion files (also single sources of truth):
 *   catalog.js  → product categories, products, prices, export terms
 *   content.js  → awards, certificates, videos, reviews, FAQs
 *
 * Rules:
 *   - Plain data only (no DOM), so both the browser and Node can import it.
 *   - Empty string = "not set yet": that link/button is hidden or falls back gracefully.
 */

/* ------------------------------------------------------------------ */
/* 1. Business facts                                                   */
/* ------------------------------------------------------------------ */
export const SITE = Object.freeze({
  name: 'Earthens',
  tagline: 'foodware for nature lovers',
  slogan: 'Good Food. Great Company. Happier Planet.',
  description:
    'Earthens makes premium, 100% natural Areca palm leaf plates, bowls and party packs in Tumkur, Karnataka. Compostable, chemical-free tableware, exported worldwide.',
  /** Production origin, no trailing slash. Drives canonical URLs, sitemap and Open Graph. */
  url: 'https://www.earthens.in',
  locale: 'en_IN',
  foundingYear: 2016,
  employees: '51-100',
  artisans: 48,
  ceo: 'Ms. Dipti Goyal',
  exporter: 'Engee Incorporated',
  gst: '29AKEPA2875R1ZK',
  businessType: 'Manufacturer, exporter & supplier',
  legalStatus: 'Sole proprietorship',
  markets: 'Worldwide, including the USA, Europe and Russia',
});

/** Addresses. The first one is the main address used in structured data and the footer. */
export const OFFICES = Object.freeze([
  {
    label: 'Factory',
    name: 'Earthens',
    street: '39C-2, Hirehalli Industrial Area, Manchakalkuppe, Hirehalli',
    city: 'Tumkur',
    region: 'Karnataka',
    postalCode: '572168',
    countryCode: 'IN',
    countryName: 'India',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Earthens+Hirehalli+Industrial+Area+Tumkur+572168',
  },
  {
    label: 'Corporate office',
    name: 'Engee Incorporated',
    street: 'B-170, Shahpura',
    city: 'Bhopal',
    region: 'Madhya Pradesh',
    postalCode: '462039',
    countryCode: 'IN',
    countryName: 'India',
    mapsUrl: '',
  },
]);

/* ------------------------------------------------------------------ */
/* 2. Contact channels                                                  */
/* ------------------------------------------------------------------ */
/**
 *   whatsapp: international format, digits only, no "+" (turns on the floating
 *             WhatsApp button, WhatsApp tiles and the form fallback)
 *   phones:   shown in order; the first one is the main "Call us" number
 */
export const CONTACT = Object.freeze({
  person: 'Mr. Nilesh Goyal',
  whatsapp: '919827009796',
  whatsappGreeting: 'Hello Earthens! I found your website and I am interested in your products.',
  phones: Object.freeze([
    { label: 'Sales', number: '+91 98270 09796' },
    { label: 'Sales', number: '+91 88793 41461' },
    { label: 'Sales', number: '+91 99679 77943' },
  ]),
  email: 'sales@earthens.in',
  /** Printed on the EcoBhoj box for feedback and complaints. */
  supportEmail: 'info@earthens.in',
});

/* ------------------------------------------------------------------ */
/* 3. Social profiles & listings                                        */
/* ------------------------------------------------------------------ */
/**
 * Add any network here. Empty `url` = hidden. `icon` must exist in assets/img/icons.svg.
 * Every filled URL is also added to the Organization `sameAs` structured data,
 * which helps Google and AI assistants recognise the company.
 */
export const SOCIAL = Object.freeze([
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/earthens_foodware' },
  { name: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/@Earthens_foodware' },
  { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/share/1WVrUJqKCJ/' },
  { name: 'LinkedIn', icon: 'linkedin', url: '' },
  { name: 'X (Twitter)', icon: 'x', url: '' },
  { name: 'Pinterest', icon: 'pinterest', url: '' },
  { name: 'Threads', icon: 'threads', url: '' },
]);

/** Business directory listings (not shown as icons; used in structured data `sameAs`). */
export const LISTINGS = Object.freeze([
  'https://www.exportersindia.com/earthens-tumkur/',
  'https://www.indianyellowpages.com/tumkur/earthens-hirehalli-tumkur-3543166/',
]);

/** External store links. Empty = the "Order" button goes to the contact form instead. */
export const STORES = Object.freeze({
  amazonEcoBhoj: '',
});

/* ------------------------------------------------------------------ */
/* 4. Feature flags                                                     */
/* ------------------------------------------------------------------ */
/**
 *   enquiryCart: "Add to enquiry" buttons, the header cart icon and enquiry.html
 *   showPrices:  indicative per-piece prices on product cards and pages
 */
export const FEATURES = Object.freeze({
  enquiryCart: false,
  showPrices: true,
});

/* ------------------------------------------------------------------ */
/* 5. Forms                                                             */
/* ------------------------------------------------------------------ */
/**
 *   endpoint: a backend accepting JSON POST (e.g. Formspree 'https://formspree.io/f/abcdwxyz').
 *             Empty → forms open WhatsApp (CONTACT.whatsapp), else email (CONTACT.email).
 *             The build adds the endpoint's origin to the Content-Security-Policy automatically.
 */
export const FORMS = Object.freeze({
  endpoint: '',
  timeoutMs: 10000,
  maxMessageLength: 2000,
});

/** localStorage keys. Bump the version suffix if the stored shape changes. */
export const STORAGE_KEYS = Object.freeze({
  enquiry: 'earthens.enquiry.v1',
});

/* ------------------------------------------------------------------ */
/* 6. Pages                                                             */
/* ------------------------------------------------------------------ */
/**
 * In navigation order. Drives the nav, <head> tags, breadcrumbs and sitemap.
 *   key          matches <body data-page="..."> on the page
 *   title        ≤ 60 characters, most important words first
 *   description  140–160 characters, written as a direct answer
 *   icon / tint  nav bubble icon (icons.svg) and colour (.tint-* in styles.css)
 *   sitemap      priority 0–1, or false to exclude (adds noindex)
 *   feature      only shown when that FEATURES flag is on
 *   preload      LCP image: { src, srcset, sizes }
 * Product detail pages (products/*.html) are generated from catalog.js, not listed here.
 */
export const PAGES = Object.freeze([
  {
    key: 'home', file: 'index.html', label: 'Home', icon: 'home', tint: 'green', nav: true, sitemap: 1.0,
    title: 'Earthens | Natural Areca Palm Leaf Plates & Bowls from India',
    description: 'Premium, 100% natural Areca palm leaf plates, bowls and party packs, made from fallen leaves by 48 women artisans in Tumkur, India. Compostable and chemical-free.',
    preload: {
      src: 'assets/img/hero-scene-1000.webp',
      srcset: 'assets/img/hero-scene-640.webp 640w, assets/img/hero-scene-800.webp 800w, assets/img/hero-scene-1000.webp 1000w, assets/img/hero-scene-1600.webp 1600w',
      sizes: '(min-width: 70em) 56vw, calc(100vw - 2.5rem)',
    },
  },
  {
    key: 'story', file: 'our-story.html', label: 'Our Story', icon: 'leaf', tint: 'peach', nav: true, sitemap: 0.7,
    title: 'Our Story | Earthens Palm Leaf Tableware',
    description: 'How a family memory of meals served on leaves became Earthens: an award-winning, women-led palm leaf tableware maker in Tumkur, Karnataka, exporting worldwide.',
  },
  {
    key: 'products', file: 'products.html', label: 'Products', icon: 'plates', tint: 'blue', nav: true, sitemap: 0.9,
    title: 'Areca Palm Leaf Plates, Bowls & Spoons | Earthens',
    description: 'Browse 35 Earthens Areca palm leaf plates, bowls, compartment plates, heart and oval shapes and spoons, with sizes, prices and export details. Compostable.',
  },
  {
    key: 'ecobhoj', file: 'ecobhoj.html', label: 'EcoBhoj', icon: 'gift', tint: 'pink', nav: true, sitemap: 0.9,
    title: 'EcoBhoj Party Pack: Palm Leaf Tableware for 15 Guests',
    description: 'EcoBhoj is a complete party pack for 15 guests: palm leaf plates, bowls, trays, spoons, cups, napkins and a compostable garbage bag in one box. MRP ₹1,500.',
  },
  {
    key: 'sustainability', file: 'sustainability.html', label: 'Sustainability', icon: 'globe', tint: 'mint', nav: true, sitemap: 0.6,
    title: 'Sustainability: Compostable Palm Leaf Tableware | Earthens',
    description: 'Earthens plates are pressed from naturally fallen Areca leaves with no chemicals, glue or coatings, and compost back into soil. See the full life cycle.',
  },
  {
    key: 'certifications', file: 'certifications.html', label: 'Certifications', icon: 'certificate', tint: 'lilac', nav: true, sitemap: 0.6,
    title: 'Certifications, SGS Tests & Awards | Earthens',
    description: 'Earthens palm leaf tableware is tested by SGS to global standards and checked piece by piece for export. See our certificates, awards and company details.',
  },
  {
    key: 'contact', file: 'contact.html', label: 'Contact Us', icon: 'mail', tint: 'yellow', nav: true, sitemap: 0.8,
    title: 'Contact Earthens | Bulk Orders, Export & EcoBhoj',
    description: 'Contact Earthens in Tumkur, Karnataka on WhatsApp, phone or email for bulk palm leaf tableware, export quotes, private label and EcoBhoj party packs.',
  },
  {
    key: 'enquiry', file: 'enquiry.html', label: 'Enquiry', icon: 'bag', tint: 'dark', nav: true, sitemap: false, feature: 'enquiryCart',
    title: 'Your Enquiry | Earthens',
    description: 'Review the products in your enquiry and request a quote from Earthens.',
  },
  {
    key: 'notfound', file: '404.html', label: 'Not found', nav: false, sitemap: false,
    title: 'Page not found | Earthens',
    description: 'This page could not be found. Explore Earthens palm leaf tableware instead.',
  },
]);
