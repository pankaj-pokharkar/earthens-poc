/**
 * main.js — the single script entry point, loaded on every page as:
 *   <script type="module" src="assets/js/main.js"></script>
 *
 * Modules are deferred by default, so the HTML renders first and this runs after
 * parsing. Each init function looks for its own markup and quietly does nothing
 * when it is not on the page, so the same script works everywhere.
 *
 * The site is fully usable without JavaScript; this only adds enhancements.
 */
import { initNav } from './modules/nav.js';
import { initFeatureFlags, isEnabled } from './modules/feature-flags.js';
import { initProductFilter } from './modules/product-filter.js';
import { initForms } from './modules/forms.js';
import { initEnquiry } from './modules/enquiry.js';

initNav();
initFeatureFlags();
initProductFilter();
initForms();

// The enquiry cart only runs when FEATURES.enquiryCart is true in config.js.
if (isEnabled('enquiryCart')) initEnquiry();
