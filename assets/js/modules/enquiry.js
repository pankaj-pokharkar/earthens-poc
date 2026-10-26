/**
 * enquiry.js — the optional "enquiry cart" (behind FEATURES.enquiryCart).
 *
 * Visitors collect products they are interested in, then send ONE enquiry for a
 * quote. There is no checkout and no payment. Data lives only in the visitor's
 * own browser (localStorage) and is validated on every read.
 *
 * Markup contract:
 *   [data-enquiry-count]               text is set to the number of products
 *   button[data-enquiry-add="<id>"]    toggles that product in / out of the cart
 *   enquiry.html:
 *     [data-enquiry-list]              <ul> that receives one <li> per product
 *     template#enquiry-item            row template (cloned, filled with textContent)
 *     [data-enquiry-filled] / [data-enquiry-empty]   shown / hidden by item count
 */
import { STORAGE_KEYS } from '../config.js';
import { PRODUCTS_BY_ID } from '../catalog.js';
import { $, $$, announce } from './dom.js';

const MAX_QTY = 9999;

/* ---- Storage (defensive: storage can be full, blocked, or tampered with) ---- */

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.enquiry) || '{}');
    const clean = {};
    for (const [id, qty] of Object.entries(raw)) {
      const n = Number.parseInt(qty, 10);
      if (PRODUCTS_BY_ID[id] && Number.isFinite(n) && n > 0) clean[id] = Math.min(n, MAX_QTY);
    }
    return clean;
  } catch {
    return {};
  }
}

function write(cart) {
  try {
    localStorage.setItem(STORAGE_KEYS.enquiry, JSON.stringify(cart));
  } catch {
    // Storage unavailable (private mode, quota). The page still works for this visit.
  }
  render();
}

/* ---- Public API (also used by forms.js) ---- */

export function getEnquiryLines() {
  return Object.entries(read()).map(([id, qty]) => ({ id, qty, name: PRODUCTS_BY_ID[id].name }));
}

export function clearEnquiry() {
  write({});
}

function setQty(id, qty) {
  const cart = read();
  if (!PRODUCTS_BY_ID[id]) return;
  if (qty <= 0) delete cart[id];
  else cart[id] = Math.min(qty, MAX_QTY);
  write(cart);
}

/* ---- Rendering ---- */

function render() {
  const cart = read();
  const count = Object.keys(cart).length;

  $$('[data-enquiry-count]').forEach((node) => {
    node.textContent = String(count);
    // Hide the little header badge when the cart is empty.
    if (node.classList.contains('nav-count')) node.hidden = count === 0;
  });

  $$('button[data-enquiry-add]').forEach((button) => {
    const inCart = Boolean(cart[button.dataset.enquiryAdd]);
    button.setAttribute('aria-pressed', String(inCart));
    button.textContent = inCart ? 'Added to enquiry ✓' : 'Add to enquiry';
  });

  renderList(cart);
}

function renderList(cart) {
  const list = $('[data-enquiry-list]');
  const template = $('#enquiry-item');
  if (!list || !template) return;

  const ids = Object.keys(cart);
  $$('[data-enquiry-filled]').forEach((node) => { node.hidden = ids.length === 0; });
  $$('[data-enquiry-empty]').forEach((node) => { node.hidden = ids.length > 0; });

  list.replaceChildren(
    ...ids.map((id) => {
      const product = PRODUCTS_BY_ID[id];
      const row = template.content.firstElementChild.cloneNode(true);
      row.dataset.id = id;
      $('[data-field="category"]', row).textContent = product.category;
      $('[data-field="name"]', row).textContent = product.name;
      $('[data-field="size"]', row).textContent = product.price ?? `${product.size} · price on quote`;
      $('[data-field="qty"]', row).textContent = String(cart[id]);
      const img = $('img', row);
      img.src = product.image ?? `assets/img/shapes/${product.shape}.svg`;
      img.classList.toggle('is-photo', Boolean(product.image));
      $$('button', row).forEach((b) => b.setAttribute('aria-label', `${b.dataset.action} ${product.name}`));
      return row;
    }),
  );
}

/* ---- Events ---- */

function onClick(event) {
  const add = event.target.closest('button[data-enquiry-add]');
  if (add) {
    const id = add.dataset.enquiryAdd;
    const inCart = Boolean(read()[id]);
    setQty(id, inCart ? 0 : 1);
    announce(`${PRODUCTS_BY_ID[id]?.name ?? 'Product'} ${inCart ? 'removed from' : 'added to'} your enquiry.`);
    return;
  }

  const action = event.target.closest('[data-enquiry-list] button[data-action]');
  if (action) {
    const id = action.closest('[data-id]').dataset.id;
    const qty = read()[id] ?? 0;
    const next = { Increase: qty + 1, Decrease: Math.max(1, qty - 1), Remove: 0 }[action.dataset.action];
    setQty(id, next);
    if (action.dataset.action === 'Remove') announce(`${PRODUCTS_BY_ID[id].name} removed.`);
  }
}

export function initEnquiry() {
  document.addEventListener('click', onClick);
  // Keep several open tabs in sync.
  window.addEventListener('storage', (event) => { if (event.key === STORAGE_KEYS.enquiry) render(); });
  render();
}
