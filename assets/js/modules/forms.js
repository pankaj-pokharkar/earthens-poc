/**
 * forms.js — validation and submission for the contact and enquiry forms.
 *
 * Submission strategy (configured in config.js -> FORMS / CONTACT):
 *   1. FORMS.endpoint set   -> POST JSON to that backend (e.g. Formspree).
 *   2. else CONTACT.whatsapp -> open WhatsApp with the message pre-filled.
 *   3. else CONTACT.email    -> open the visitor's mail app (mailto:).
 *   4. else                  -> show a friendly "not connected yet" error.
 *
 * Security & robustness:
 *   - Native HTML validation (required, type=email, maxlength) + custom messages.
 *   - Honeypot field (`name="company_website"`) silently drops basic bots.
 *   - Values are trimmed and length-capped; output is only ever set via textContent.
 *   - Network calls time out (FORMS.timeoutMs) and the button is disabled while sending.
 *
 * Markup contract:
 *   <form data-form="contact|enquiry" novalidate>
 *     <div class="field"><label/><input class="input" .../><p class="field-error" hidden></p></div>
 *     <p class="form-status" role="status" data-form-status></p>
 *   </form>
 *   <div data-form-done hidden> ... thank-you message ... </div>   (next sibling of the form)
 */
import { CONTACT, FORMS } from '../config.js';
import { $, $$ } from './dom.js';
import { getEnquiryLines, clearEnquiry } from './enquiry.js';

const MESSAGES = {
  valueMissing: 'Please fill in this field.',
  typeMismatch: 'Please enter a valid email address.',
  tooLong: 'This is a little too long.',
  patternMismatch: 'Please check the format.',
};

/** Show or clear the error for one field. Returns true when valid. */
function validateField(input) {
  const field = input.closest('.field');
  const error = field && $('.field-error', field);
  const { validity } = input;
  const key = Object.keys(MESSAGES).find((k) => validity[k]);
  const message = key ? MESSAGES[key] : '';

  if (field) field.classList.toggle('is-invalid', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
  return !message;
}

/** Collect trimmed, length-capped form values into a plain object. */
function collect(form) {
  const data = {};
  for (const [name, value] of new FormData(form).entries()) {
    data[name] = String(value).trim().slice(0, FORMS.maxMessageLength);
  }
  return data;
}

/** Plain-text summary used for WhatsApp / email fallbacks. */
function toText(kind, data, lines) {
  const parts = [`New ${kind} from the Earthens website`];
  for (const [key, value] of Object.entries(data)) {
    if (value && key !== 'company_website') parts.push(`${key}: ${value}`);
  }
  if (lines.length) {
    parts.push('Products:');
    lines.forEach((line) => parts.push(`- ${line.name} × ${line.qty}`));
  }
  return parts.join('\n');
}

async function postJson(payload) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FORMS.timeoutMs);
  try {
    const response = await fetch(FORMS.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } finally {
    window.clearTimeout(timer);
  }
}

function setStatus(form, state, text) {
  const status = $('[data-form-status]', form);
  if (!status) return;
  status.dataset.state = state;
  status.textContent = text;
}

function showDone(form) {
  const done = form.nextElementSibling?.matches('[data-form-done]') ? form.nextElementSibling : null;
  if (!done) return;
  form.hidden = true;
  done.hidden = false;
  done.querySelector('h2, [tabindex]')?.focus();
}

async function onSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const kind = form.dataset.form;
  const inputs = $$('input, select, textarea', form).filter((i) => i.name && i.type !== 'hidden');

  const invalid = inputs.filter((input) => !validateField(input));
  if (invalid.length) {
    invalid[0].focus();
    setStatus(form, 'error', 'Please check the highlighted fields.');
    return;
  }

  const data = collect(form);
  if (data.company_website) { showDone(form); return; } // honeypot: pretend success for bots

  const lines = kind === 'enquiry' ? getEnquiryLines() : [];
  if (kind === 'enquiry' && !lines.length) {
    setStatus(form, 'error', 'Your enquiry cart is empty.');
    return;
  }

  const button = $('button[type="submit"]', form);
  button.disabled = true;
  setStatus(form, 'info', 'Sending…');

  try {
    if (FORMS.endpoint) {
      await postJson({ kind, ...data, products: lines, page: location.pathname });
    } else if (CONTACT.whatsapp) {
      const url = `https://wa.me/${encodeURIComponent(CONTACT.whatsapp)}?text=${encodeURIComponent(toText(kind, data, lines))}`;
      window.open(url, '_blank', 'noopener');
    } else if (CONTACT.email) {
      const subject = encodeURIComponent(`Website ${kind}`);
      window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${encodeURIComponent(toText(kind, data, lines))}`;
    } else {
      throw new Error('No form endpoint, WhatsApp or email configured in config.js');
    }
    if (kind === 'enquiry') clearEnquiry();
    form.reset();
    setStatus(form, 'success', 'Thank you! Your message is on its way.');
    showDone(form);
  } catch (error) {
    console.warn('[forms]', error);
    setStatus(form, 'error', 'Sorry, we could not send this right now. Please try again or reach us on WhatsApp.');
  } finally {
    button.disabled = false;
  }
}

export function initForms() {
  $$('form[data-form]').forEach((form) => {
    form.addEventListener('submit', onSubmit);
    // Validate a field when the visitor leaves it, and clear errors as they type.
    form.addEventListener('focusout', (event) => {
      if (event.target.matches('.input[required]')) validateField(event.target);
    });
    form.addEventListener('input', (event) => {
      if (event.target.closest('.field.is-invalid')) validateField(event.target);
    });
  });
}
