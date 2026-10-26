/**
 * dom.js — tiny, safe DOM helpers shared by every module.
 *
 * Security note: never build HTML from strings that contain data (user input,
 * localStorage, URL params). Use `el()` + `textContent` instead of innerHTML,
 * so nothing can be injected into the page.
 */

/** querySelector shorthand. */
export const $ = (selector, root = document) => root.querySelector(selector);

/** querySelectorAll as a real array. */
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/**
 * Create an element safely.
 * @param {string} tag
 * @param {Record<string, string|boolean>} [attrs]  attributes; `true` sets an empty attribute
 * @param {string} [text]  plain text content (never parsed as HTML)
 */
export function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    node.setAttribute(name, value === true ? '' : String(value));
  }
  if (text != null) node.textContent = text;
  return node;
}

/** Build an <svg><use></svg> icon from the sprite. */
export function icon(id) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', `assets/img/icons.svg#${id}`);
  svg.append(use);
  return svg;
}

/** Announce a message to screen readers via a polite live region. */
export function announce(message) {
  let region = $('#sr-announcer');
  if (!region) {
    region = el('div', { id: 'sr-announcer', class: 'sr-only', 'aria-live': 'polite', role: 'status' });
    document.body.append(region);
  }
  region.textContent = '';
  // Small delay so repeated identical messages are still announced.
  window.setTimeout(() => { region.textContent = message; }, 50);
}
