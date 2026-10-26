/**
 * catalog.js — product categories and products. The ONE place to edit the range.
 *
 * Used by:
 *   - scripts/build.mjs to generate the product grid inside products.html (good for SEO: real HTML).
 *   - assets/js/modules/enquiry.js to show product names in the enquiry cart.
 *
 * After editing, run `npm run build` to regenerate products.html.
 *
 * Field notes:
 *   id        stable, URL-safe, never reuse. Stored in visitors' enquiry carts.
 *   category  must match a CATEGORIES id.
 *   shape     picks the illustration in assets/img/shapes/<shape>.svg
 *             (replace with real photos later: set `image` to a .webp path to override).
 *   specs     extra rows shown in the product's "Specifications" panel.
 */

/** Spec rows shared by every leaf product. */
export const COMMON_SPECS = Object.freeze([
  ['Material', 'Areca palm leaf sheath'],
  ['Colour', 'Natural beige'],
  ['Finish', 'No chemicals, no coatings'],
  ['Use', 'Microwave & oven safe'],
  ['Packaging', 'Export-grade corrugated cartons'],
]);

export const CATEGORIES = Object.freeze([
  { id: 'plates', name: 'Plates', blurb: 'All shapes & sizes', image: 'assets/img/categories/plates.webp' },
  { id: 'bowls', name: 'Bowls', blurb: 'All shapes & sizes', image: 'assets/img/categories/bowls.webp' },
  { id: 'cups', name: 'Cups', blurb: 'For hot & cold beverages', image: 'assets/img/categories/cups.webp' },
  { id: 'cutlery', name: 'Cutlery', blurb: 'Natural & sturdy', image: 'assets/img/categories/cutlery.webp' },
  { id: 'trays', name: 'Trays', blurb: 'For serving & events', image: 'assets/img/categories/trays.webp' },
  { id: 'specialty', name: 'Specialty Shapes', blurb: 'Unique designs', image: 'assets/img/categories/specialty.webp' },
  { id: 'ecobhoj', name: 'EcoBhoj', blurb: 'Complete party pack', image: 'assets/img/categories/ecobhoj.webp' },
]);

export const PRODUCTS = Object.freeze([
  // EcoBhoj party packs (consumer product, has an MRP)
  { id: 'ecobhoj-round', category: 'ecobhoj', name: 'EcoBhoj Party Pack (Round)', size: 'Complete tableware for 15 guests', image: 'assets/img/ecobhoj-box-640.webp', badge: 'New', price: '₹1,500 MRP', url: 'ecobhoj.html', specs: [['Serves', '15 guests'], ['Plate style', 'Round']] },
  { id: 'ecobhoj-square', category: 'ecobhoj', name: 'EcoBhoj Party Pack (Square)', size: 'Complete tableware for 15 guests', image: 'assets/img/ecobhoj-box-640.webp', badge: 'New', price: '₹1,500 MRP', url: 'ecobhoj.html', specs: [['Serves', '15 guests'], ['Plate style', 'Square']] },

  // Plates
  { id: 'plate-round-10', category: 'plates', name: '10 inch Round Plate', size: '10 in · Round', shape: 'round' },
  { id: 'plate-round-7', category: 'plates', name: '7 inch Round Plate', size: '7 in · Round', shape: 'round' },
  { id: 'plate-square-10', category: 'plates', name: '10 inch Square Plate', size: '10 in · Square', shape: 'square' },
  { id: 'plate-square-7', category: 'plates', name: '7 inch Square Plate', size: '7 in · Square', shape: 'square' },
  { id: 'plate-deep-square-10', category: 'plates', name: '10 inch Deep Square Plate', size: '10 in · Deep square', shape: 'square' },
  { id: 'plate-square-4-5', category: 'plates', name: '4.5 inch Square Plate', size: '4.5 in · Square', shape: 'square' },

  // Bowls
  { id: 'bowl-round-curry-4-5', category: 'bowls', name: '4.5 inch Round Curry Bowl', size: '4.5 in · Round', shape: 'round' },
  { id: 'bowl-round-dessert-3-5', category: 'bowls', name: '3.5 inch Round Dessert Bowl', size: '3.5 in · Round', shape: 'round' },
  { id: 'bowl-deep-round-8', category: 'bowls', name: '8 inch Deep Round Bowl', size: '8 in · Deep round', shape: 'round' },
  { id: 'bowl-square-curry-4', category: 'bowls', name: '4 inch Square Curry Bowl', size: '4 in · Square', shape: 'square' },
  { id: 'bowl-square-dessert-3', category: 'bowls', name: '3 inch Square Dessert Bowl', size: '3 in · Square', shape: 'square' },
  { id: 'bowl-deep-square-7', category: 'bowls', name: '7 inch Deep Square Bowl', size: '7 in · Deep square', shape: 'square' },
  { id: 'bowl-rectangular', category: 'bowls', name: 'Rectangular Bowl', size: '3.5 × 2.25 in · Rectangle', shape: 'rectangle' },

  // Trays
  { id: 'tray-serving-13', category: 'trays', name: 'Serving Tray', size: '13 × 10.5 in · Rectangle', shape: 'tray' },
  { id: 'tray-3-compartment-round', category: 'trays', name: '3 Compartment Round Plate', size: 'Round · 3 sections', shape: 'compartment' },
  { id: 'tray-4-compartment-square', category: 'trays', name: '4 Compartment Square Plate', size: 'Square · 4 sections', shape: 'compartment' },

  // Cutlery
  { id: 'spoon-14', category: 'cutlery', name: 'Areca Spoon', size: '14 cm', shape: 'spoon' },
  { id: 'spoon-teardrop-14', category: 'cutlery', name: 'Teardrop Areca Spoon', size: '14 cm', shape: 'spoon' },
]);

/** Fast lookup by id (used by the enquiry cart). */
export const PRODUCTS_BY_ID = Object.freeze(Object.fromEntries(PRODUCTS.map((p) => [p.id, p])));
