/**
 * feature-flags.js — show or hide flagged UI based on FEATURES in config.js.
 *
 * Markup contract: any element with `data-feature="<flagName>"` ships with the
 * `hidden` attribute in HTML (so it stays hidden if JS fails). It is revealed
 * here only when FEATURES[flagName] is true.
 *
 * Pages that only make sense with a flag on (e.g. enquiry.html) can add
 * `data-requires-feature="<flagName>"` on <body>; when the flag is off the
 * page shows its `[data-feature-off]` message instead.
 */
import { FEATURES } from '../config.js';
import { $$ } from './dom.js';

/** Returns true if the named flag is enabled. */
export const isEnabled = (name) => Boolean(FEATURES[name]);

export function initFeatureFlags() {
  $$('[data-feature]').forEach((node) => {
    node.hidden = !isEnabled(node.dataset.feature);
  });

  const required = document.body.dataset.requiresFeature;
  if (required && !isEnabled(required)) {
    $$('[data-feature-off]').forEach((node) => { node.hidden = false; });
  }
}
