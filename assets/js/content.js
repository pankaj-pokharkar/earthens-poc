/**
 * content.js — trust content reused on several pages. Edit here, then `npm run build`.
 *
 *   AWARDS        → Home (snippet), Our Story, Certifications
 *   CERTIFICATES  → Certifications ("Seal of Trust")
 *   VIDEOS        → Home and Products (YouTube loads only when someone presses play)
 *   REVIEWS       → Home
 *   ECOBHOJ_FAQ   → EcoBhoj page (visible FAQ AND its FAQPage structured data)
 *
 * Only publish facts you can back up. Empty `file` / `url` = shown as "coming soon".
 */

export const AWARDS = Object.freeze([
  {
    title: 'Women Leader of the Year',
    by: 'BW Emerging Business Summit & Awards',
    where: 'New Delhi',
    when: 'February 2025',
    year: 2025,
    for: 'Deepti’s leadership of Earthens.',
  },
  {
    title: 'Empowerment Achievement Award',
    by: 'Karnataka MSME Awards, Global Investors Meet',
    where: 'Bengaluru',
    when: 'February 2025',
    year: 2025,
    for: 'Uplifting rural communities through women-led manufacturing.',
  },
  {
    title: 'Outstanding Entrepreneur Award',
    by: 'COSIDICI National Awards',
    where: 'Bengaluru',
    when: 'December 2023',
    year: 2023,
    for: 'Deepti and Ashish, for sustainable manufacturing and rural empowerment.',
  },
]);

/**
 * Seal of Trust documents. Put PDFs in assets/docs/ and set `file`
 * (e.g. 'assets/docs/sgs-8480002545-1.pdf'). Empty `file` shows "PDF coming soon".
 */
export const CERTIFICATES = Object.freeze([
  { title: 'SGS test report', ref: 'SGS 8480002545-1', issuer: 'SGS', note: 'Safety and quality tested to global standards.', file: '' },
  { title: 'SGS test report', ref: 'SGS 8480002971', issuer: 'SGS', note: 'Safety and quality tested to global standards.', file: '' },
  { title: 'Import Export Code (IEC)', ref: 'IEC registration', issuer: 'DGFT, Government of India', note: 'Registered to export from India.', file: '' },
  { title: 'Trademark certificate', ref: 'Earthens trademark', issuer: 'Trade Marks Registry, India', note: 'The Earthens brand is registered.', file: '' },
  { title: 'GST registration', ref: 'GST 29AKEPA2875R1ZK', issuer: 'Government of India', note: 'Registered business in Karnataka.', file: '' },
]);

/** YouTube videos. `id` is the part after watch?v= in the YouTube URL. */
export const VIDEOS = Object.freeze([
  { id: 'RHwUkMo978I', title: 'Earthens palm leaf plates up close', caption: 'Compartment plates, bowls and spoons' },
  { id: 'vuc5DWZP_mk', title: 'Square plates and deep bowls', caption: 'Square range, from 2.5 to 7 inch' },
]);

/** Buyer reviews. Use real reviews only, with the source. */
export const REVIEWS = Object.freeze({
  rating: 4.5,
  count: 30,
  source: 'ExportersIndia',
  sourceUrl: 'https://www.exportersindia.com/earthens-tumkur/',
  quotes: Object.freeze([
    { text: 'Highly recommend for anyone seeking top-notch products and reliability.', name: 'Jitfact', product: 'Areca leaf plates', date: 'January 2026' },
  ]),
});

/** EcoBhoj FAQ. Written answer-first so search engines and AI assistants can quote it. */
export const ECOBHOJ_FAQ = Object.freeze([
  { q: 'How many people does one EcoBhoj box serve?', a: 'One EcoBhoj Party Pack sets the table for 15 guests, with two plate sizes, two bowl sizes, a cup, a spoon and a napkin for each guest, plus 3 serving trays.' },
  { q: 'Can I heat food on EcoBhoj plates?', a: 'Yes. The palm leaf plates and bowls are microwave and oven safe, as printed on the box.' },
  { q: 'How do I dispose of everything after the party?', a: 'Collect the used tableware in the large compostable garbage bag included in the box, and add it to compost or wet waste.' },
  { q: 'What is the difference between the round and square EcoBhoj packs?', a: 'Only the shape of the plates and bowls. The serving trays, spoons, cups, napkins and garbage bag are the same in both.' },
  { q: 'Do you offer bulk orders or corporate gifting?', a: 'Yes. Send your quantity and dates through the Earthens contact page or WhatsApp and the team will get back to you.' },
]);
