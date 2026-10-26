/**
 * nav.js — small enhancements for the mobile menu.
 *
 * The menu is a native <details>/<summary>, so it already opens and closes
 * without JavaScript. Here we only add the expected extras:
 *   - Escape closes it and returns focus to the toggle
 *   - clicking outside closes it
 *   - following a link closes it
 */
import { $$ } from './dom.js';

export function initNav() {
  const menus = $$('details.mobile-menu');
  if (!menus.length) return;

  const close = (menu, restoreFocus = false) => {
    if (!menu.open) return;
    menu.open = false;
    if (restoreFocus) menu.querySelector('summary')?.focus();
  };

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menus.forEach((menu) => close(menu, true));
  });

  document.addEventListener('click', (event) => {
    menus.forEach((menu) => {
      if (!menu.contains(event.target)) close(menu);
    });
  });

  menus.forEach((menu) => {
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) close(menu);
    });
  });
}
