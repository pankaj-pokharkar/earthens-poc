/**
 * catalog.js — the ONE place for the product range.
 *
 * Drives: the products page grid, one detail page per product (products/<id>.html),
 * the enquiry cart, structured data and llms.txt.
 * After editing, run `npm run build`.
 *
 * Product fields
 *   id        URL-safe and permanent (it becomes products/<id>.html and is stored in carts)
 *   category  a CATEGORIES id
 *   name      display name
 *   size      e.g. '10 inch'; shape: e.g. 'Round'
 *   art       illustration in assets/img/shapes/<art>.svg (until real photos arrive)
 *   image     optional real photo (.webp) — overrides `art`
 *   price     indicative price per piece in INR (number), or null for "price on request"
 *   moq       optional; defaults to EXPORT.moq
 *   note      optional one-line highlight shown on the product page
 */

/** Export terms shared by every leaf product (from the existing product listings). */
export const EXPORT = Object.freeze({
  currency: 'INR',
  currencySymbol: '₹',
  priceUnit: 'piece',
  priceNote: 'Indicative price per piece. Your final quote depends on quantity, packing and destination.',
  moq: '1,000 boxes',
  shelfLife: '2 years',
  port: 'Tuticorin, India',
  payment: 'T/T (bank transfer)',
  origin: 'India',
  packaging: 'Export-grade 5-ply corrugated cartons, POF shrink wrap and a silica gel pouch',
  privateLabel: 'Custom packaging and private labelling on request',
  material: 'Areca palm leaf sheath',
  colour: 'Natural beige',
});

/** "Good to know" badges shown on every leaf product page (icon ids from icons.svg). */
export const PRODUCT_PERKS = Object.freeze([
  { icon: 'leaf', label: '100% natural', tint: 'green' },
  { icon: 'no-chemicals', label: 'No chemicals', tint: 'yellow' },
  { icon: 'droplet', label: 'Leak proof', tint: 'blue' },
  { icon: 'microwave', label: 'Microwave safe', tint: 'pink' },
  { icon: 'snowflake', label: 'Freezer-ready', tint: 'lilac' },
  { icon: 'sprout', label: 'Home compostable', tint: 'peach' },
]);

/** Typical uses, shown as chips on product pages. */
export const USES = Object.freeze(['Catering', 'Hotels & restaurants', 'Weddings & events', 'Prasadam', 'Parties at home']);

export const CATEGORIES = Object.freeze([
  {
    id: 'plates', name: 'Plates', blurb: 'All shapes & sizes', image: 'assets/img/categories/plates.webp', tint: 'pink',
    intro: 'Round, square and rectangular plates, from 2.5 inch tasting plates to 12 inch dinner plates.',
  },
  {
    id: 'bowls', name: 'Bowls', blurb: 'All shapes & sizes', image: 'assets/img/categories/bowls.webp', tint: 'green',
    intro: 'Shallow and deep bowls for curries, desserts, salads and soups.',
  },
  {
    id: 'compartment', name: 'Compartment Plates', blurb: 'For thalis & combos', image: 'assets/img/categories/trays.webp', tint: 'lilac',
    intro: 'Three- and four-section plates that keep every dish in its place.',
  },
  {
    id: 'specialty', name: 'Specialty Shapes', blurb: 'Hearts, ovals & more', image: 'assets/img/categories/specialty.webp', tint: 'peach',
    intro: 'Hearts, ovals, a leaf-pattern plate and a wine plate that holds your glass.',
  },
  {
    id: 'cutlery', name: 'Cutlery', blurb: 'Natural & sturdy', image: 'assets/img/categories/cutlery.webp', tint: 'blue',
    intro: 'Palm leaf spoons, pressed from the same fallen sheaths.',
  },
  {
    id: 'cups', name: 'Cups', blurb: 'For hot & cold drinks', image: 'assets/img/categories/cups.webp', tint: 'yellow',
    intro: 'Coming soon.',
  },
  {
    id: 'ecobhoj', name: 'EcoBhoj', blurb: 'Complete party pack', image: 'assets/img/categories/ecobhoj.webp', tint: 'green',
    intro: 'Everything for 15 guests in one box.',
  },
]);

export const PRODUCTS = Object.freeze([
  /* EcoBhoj party packs (consumer product with an MRP) */
  { id: 'ecobhoj-party-pack-round', category: 'ecobhoj', name: 'EcoBhoj Party Pack (Round)', size: 'For 15 guests', shape: 'Round plates', image: 'assets/img/ecobhoj-box-640.webp', badge: 'New', mrp: 1500, url: 'ecobhoj.html' },
  { id: 'ecobhoj-party-pack-square', category: 'ecobhoj', name: 'EcoBhoj Party Pack (Square)', size: 'For 15 guests', shape: 'Square plates', image: 'assets/img/ecobhoj-box-640.webp', badge: 'New', mrp: 1500, url: 'ecobhoj.html' },

  /* Plates */
  { id: '12-inch-round-plate', category: 'plates', name: '12 inch Round Plate', size: '12 inch', shape: 'Round', art: 'round', price: 15 },
  { id: '9-inch-round-plate', category: 'plates', name: '9 inch Round Plate', size: '9 inch', shape: 'Round', art: 'round', price: 11, note: 'A favourite for idli and South Indian breakfasts.' },
  { id: '7-inch-round-plate', category: 'plates', name: '7 inch Round Plate', size: '7 inch', shape: 'Round', art: 'round', price: 8 },
  { id: '10-inch-deep-square-plate', category: 'plates', name: '10 inch Deep Square Plate', size: '10 inch', shape: 'Deep square', art: 'square', price: 13 },
  { id: '7-inch-deep-square-plate', category: 'plates', name: '7 inch Deep Square Plate', size: '7 inch', shape: 'Deep square', art: 'square', price: 9 },
  { id: '6-inch-square-plate', category: 'plates', name: '6 inch Square Plate', size: '6 inch', shape: 'Square', art: 'square', price: 8 },
  { id: '4-5-inch-square-plate', category: 'plates', name: '4.5 inch Square Plate', size: '4.5 inch', shape: 'Square', art: 'square', price: 5 },
  { id: '2-5-inch-square-plate', category: 'plates', name: '2.5 inch Square Plate', size: '2.5 inch', shape: 'Square', art: 'square', price: 3, note: 'Bite-size: perfect for tasting menus and canapés.' },
  { id: '13x3-inch-rectangular-plate', category: 'plates', name: '13 × 3 inch Rectangular Plate', size: '13 × 3 inch', shape: 'Rectangle', art: 'rectangle', price: 9, note: 'Long and slim, made for sushi, kebabs and snack platters.' },
  { id: '9x6-inch-rectangular-plate', category: 'plates', name: '9 × 6 inch Rectangular Plate', size: '9 × 6 inch', shape: 'Rectangle', art: 'rectangle', price: 9 },
  { id: '6x5-inch-deep-rectangular-plate', category: 'plates', name: '6 × 5 inch Deep Rectangular Plate', size: '6 × 5 inch', shape: 'Deep rectangle', art: 'rectangle', price: 7 },

  /* Bowls */
  { id: '12-inch-deep-round-bowl', category: 'bowls', name: '12 inch Deep Round Bowl', size: '12 inch', shape: 'Deep round', art: 'bowl', price: 16, note: 'Big enough for salads and sharing bowls.' },
  { id: '8-inch-deep-round-bowl', category: 'bowls', name: '8 inch Deep Round Bowl', size: '8 inch', shape: 'Deep round', art: 'bowl', price: 10 },
  { id: '6-5-inch-round-bowl', category: 'bowls', name: '6.5 inch Round Bowl', size: '6.5 inch', shape: 'Round', art: 'bowl', price: 9 },
  { id: '6-inch-deep-round-bowl', category: 'bowls', name: '6 inch Deep Round Bowl', size: '6 inch', shape: 'Deep round', art: 'bowl', price: 9 },
  { id: '5-inch-deep-round-bowl', category: 'bowls', name: '5 inch Deep Round Bowl', size: '5 inch', shape: 'Deep round', art: 'bowl', price: 6 },
  { id: '4-5-inch-round-bowl', category: 'bowls', name: '4.5 inch Round Bowl', size: '4.5 inch', shape: 'Round', art: 'bowl', price: 5 },
  { id: '4-inch-deep-round-bowl', category: 'bowls', name: '4 inch Deep Round Bowl', size: '4 inch', shape: 'Deep round', art: 'bowl', price: 6 },
  { id: '3-inch-round-bowl', category: 'bowls', name: '3 inch Round Bowl', size: '3 inch', shape: 'Round', art: 'bowl', price: 4 },
  { id: '7-inch-deep-square-bowl', category: 'bowls', name: '7 inch Deep Square Bowl', size: '7 inch', shape: 'Deep square', art: 'square', price: 11 },
  { id: '5-5-inch-deep-square-bowl', category: 'bowls', name: '5.5 inch Deep Square Bowl', size: '5.5 inch', shape: 'Deep square', art: 'square', price: 10 },
  { id: '4-inch-square-bowl', category: 'bowls', name: '4 inch Square Bowl', size: '4 inch', shape: 'Square', art: 'square', price: 5 },
  { id: '2-5-inch-square-bowl', category: 'bowls', name: '2.5 inch Square Bowl', size: '2.5 inch', shape: 'Square', art: 'square', price: 3 },
  { id: '3-5x2-25-inch-rectangular-bowl', category: 'bowls', name: '3.5 × 2.25 inch Rectangular Bowl', size: '3.5 × 2.25 inch', shape: 'Rectangle', art: 'rectangle', price: 5 },

  /* Compartment plates */
  { id: '12-inch-round-4-compartment-plate', category: 'compartment', name: '12 inch Round 4 Compartment Plate', size: '12 inch', shape: 'Round, 4 sections', art: 'compartment-round', price: 16, note: 'A full thali on one plate.' },
  { id: '10-inch-round-3-compartment-plate', category: 'compartment', name: '10 inch Round 3 Compartment Plate', size: '10 inch', shape: 'Round, 3 sections', art: 'compartment-round', price: 12, note: 'Made for thalis, combos and buffets.' },
  { id: '9-inch-square-3-compartment-plate', category: 'compartment', name: '9 inch Square 3 Compartment Plate', size: '9 inch', shape: 'Square, 3 sections', art: 'compartment', price: 12 },

  /* Specialty shapes */
  { id: '8-inch-square-wine-plate', category: 'specialty', name: '8 inch Square Wine Plate', size: '8 inch', shape: 'Square with glass holder', art: 'wine', price: 11, badge: 'Clever', note: 'A notch holds your wine glass stem, so plate and drink fit in one hand.' },
  { id: '6-5-inch-heart-plate', category: 'specialty', name: '6.5 inch Heart Plate', size: '6.5 inch', shape: 'Heart', art: 'heart', price: 9, note: 'Loved for weddings, anniversaries and Valentine’s menus.' },
  { id: '4-inch-heart-plate', category: 'specialty', name: '4 inch Heart Plate', size: '4 inch', shape: 'Heart', art: 'heart', price: 6 },
  { id: '10x6-inch-oval-plate', category: 'specialty', name: '10 × 6 inch Oval Plate', size: '10 × 6 inch', shape: 'Oval', art: 'oval', price: 9 },
  { id: '3x2-inch-oval-plate', category: 'specialty', name: '3 × 2 inch Oval Plate', size: '3 × 2 inch', shape: 'Oval', art: 'oval', price: 4 },
  { id: '6-5-inch-square-leaf-design-plate', category: 'specialty', name: '6.5 inch Square Leaf Design Plate', size: '6.5 inch', shape: 'Square, leaf pattern', art: 'leaf-square', price: 8 },

  /* Cutlery */
  { id: '14cm-spoon', category: 'cutlery', name: '14 cm Spoon', size: '14 cm', shape: 'Classic', art: 'spoon', price: 3 },
  { id: '14cm-teardrop-spoon', category: 'cutlery', name: '14 cm Teardrop Spoon', size: '14 cm', shape: 'Teardrop', art: 'spoon', price: 3 },
]);

/** Fast lookups. */
export const PRODUCTS_BY_ID = Object.freeze(Object.fromEntries(PRODUCTS.map((p) => [p.id, p])));
export const CATEGORIES_BY_ID = Object.freeze(Object.fromEntries(CATEGORIES.map((c) => [c.id, c])));

/** Where a product lives on the site. EcoBhoj packs point to their own page. */
export const productPath = (p) => p.url ?? `products/${p.id}.html`;
