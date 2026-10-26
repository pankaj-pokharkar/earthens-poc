/**
 * product-filter.js — category filter on products.html.
 *
 * Progressive enhancement:
 *   - Without JS, the chips are plain links to #category anchors and every
 *     product group is visible, so the page is fully usable and crawlable.
 *   - With JS, the chips become toggle buttons that show one group at a time,
 *     keep the URL hash in sync (shareable links like products.html#bowls)
 *     and announce the result to screen readers.
 *
 * Markup contract:
 *   <nav data-filter-bar> containing <a class="chip" data-filter="all|<id>" href="#<id>">
 *   <section data-product-group="<id>"> for each category
 */
import { $, $$, announce } from './dom.js';

export function initProductFilter() {
  const bar = $('[data-filter-bar]');
  if (!bar) return;

  const chips = $$('[data-filter]', bar);
  const groups = $$('[data-product-group]');
  const ids = new Set(groups.map((group) => group.dataset.productGroup));

  // Turn link-chips into toggle buttons (keeps the href for middle-click / copy link).
  chips.forEach((chip) => chip.setAttribute('role', 'button'));

  const apply = (id) => {
    const active = ids.has(id) ? id : 'all';
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === active)));
    groups.forEach((group) => { group.hidden = active !== 'all' && group.dataset.productGroup !== active; });

    const visible = groups.filter((group) => !group.hidden);
    const count = visible.reduce((sum, group) => sum + $$('[data-product]', group).length, 0);
    const label = active === 'all' ? 'all categories' : $('h2', visible[0])?.textContent ?? active;
    announce(`Showing ${count} products in ${label}.`);
  };

  bar.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    event.preventDefault();
    const id = chip.dataset.filter;
    history.replaceState(null, '', id === 'all' ? location.pathname : `#${id}`);
    apply(id);
  });

  // Space activates role="button" links, like a real button.
  bar.addEventListener('keydown', (event) => {
    if (event.key === ' ' && event.target.matches('[data-filter]')) {
      event.preventDefault();
      event.target.click();
    }
  });

  window.addEventListener('hashchange', () => apply(location.hash.slice(1)));
  apply(location.hash.slice(1));
}
