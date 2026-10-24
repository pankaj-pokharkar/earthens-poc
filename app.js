/* Earthens - shared behaviour: enquiry cart (localStorage), catalog rendering, forms. */
(function () {
  'use strict';

  var PRODUCTS = [
    { id: 1, name: '4 Inch Square Areca Palm Leaf Bowl', cat: 'Bowls', shape: 'square', badge: 'Popular' },
    { id: 2, name: '4.5 Inch Square Areca Palm Leaf Plate', cat: 'Plates', shape: 'square', badge: 'Popular' },
    { id: 3, name: '7 Inch Square Palm Leaf Deep Bowl', cat: 'Bowls', shape: 'square', badge: '' },
    { id: 4, name: '8 Inch Deep Round Areca Palm Leaf Bowl', cat: 'Bowls', shape: 'round', badge: 'Popular' },
    { id: 5, name: '10 Inch Deep Square Areca Palm Leaf Plate', cat: 'Plates', shape: 'square', badge: '' },
    { id: 6, name: '3.5 x 2.25 Inch Rectangular Areca Palm Leaf Bowl', cat: 'Bowls', shape: 'rect', badge: '' },
    { id: 7, name: '3 Compartment Round Areca Palm Leaf Plate', cat: 'Compartment plates', shape: 'comp', badge: '' },
    { id: 8, name: '4 Compartment Square Areca Palm Leaf Plate', cat: 'Compartment plates', shape: 'comp', badge: '' },
    { id: 9, name: '14 cm Areca Palm Leaf Spoon', cat: 'Spoons', shape: 'spoon', badge: '' },
    { id: 10, name: '14 cm Teardrop Areca Palm Leaf Spoon', cat: 'Spoons', shape: 'spoon', badge: '' }
  ];
  var TILE = { 'Bowls': 't1', 'Plates': 't2', 'Compartment plates': 't3', 'Spoons': 't4' };
  var FILTERS = ['All', 'Bowls', 'Plates', 'Compartment plates', 'Spoons'];
  var FEATURED = [1, 2, 3, 4, 5, 6];
  var KEY = 'earthens-cart-v1';

  var SHAPES = {
    round: '<circle cx="50" cy="50" r="44" fill="#B89E70"/><circle cx="50" cy="50" r="34" fill="#CDB68C"/><circle cx="50" cy="50" r="20" fill="#D9C59F"/>',
    square: '<rect x="8" y="8" width="84" height="84" rx="16" fill="#B89E70"/><rect x="18" y="18" width="64" height="64" rx="10" fill="#CDB68C"/><rect x="30" y="30" width="40" height="40" rx="5" fill="#D9C59F"/>',
    rect: '<rect x="6" y="24" width="88" height="52" rx="14" fill="#B89E70"/><rect x="16" y="33" width="68" height="34" rx="8" fill="#CDB68C"/>',
    comp: '<rect x="8" y="8" width="84" height="84" rx="16" fill="#B89E70"/><rect x="18" y="18" width="64" height="64" rx="10" fill="#CDB68C"/><path d="M50 18v64M18 50h64" stroke="#A98F62" stroke-width="3"/>',
    spoon: '<ellipse cx="50" cy="30" rx="18" ry="22" fill="#CDB68C"/><rect x="45" y="48" width="10" height="44" rx="5" fill="#B89E70"/>'
  };
  function shapeSVG(s) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + SHAPES[s] + '</svg>';
  }
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- cart store ---------- */
  var Cart = {
    read: function () {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    },
    write: function (c) {
      try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* storage unavailable */ }
      document.dispatchEvent(new CustomEvent('cart:change'));
    },
    qty: function (id) { return this.read()[id] || 0; },
    set: function (id, q) {
      var c = this.read();
      if (q <= 0) delete c[id]; else c[id] = Math.min(q, 999);
      this.write(c);
    },
    lines: function () { return Object.keys(this.read()).length; },
    total: function () {
      var c = this.read();
      return Object.keys(c).reduce(function (a, k) { return a + c[k]; }, 0);
    },
    clear: function () { this.write({}); }
  };

  function updateCount() {
    var n = Cart.lines();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; });
    $$('[data-cart-link]').forEach(function (el) {
      el.setAttribute('aria-label', 'Enquiry cart, ' + n + (n === 1 ? ' item' : ' items'));
    });
  }

  /* ---------- shared rendering ---------- */
  function actionHTML(id, variant) {
    var q = Cart.qty(id);
    if (q > 0) {
      return '<div class="stepper' + (variant === 'full' ? ' full' : '') + '">' +
        '<button type="button" data-act="dec" data-id="' + id + '" aria-label="Fewer cartons">−</button>' +
        '<span aria-live="polite">' + q + ' ctn</span>' +
        '<button type="button" data-act="inc" data-id="' + id + '" aria-label="More cartons">+</button></div>';
    }
    if (variant === 'full') {
      return '<button type="button" class="add-btn" data-act="add" data-id="' + id + '">Add to enquiry</button>';
    }
    return '<button type="button" class="btn btn-ghost btn-sm" data-act="add" data-id="' + id + '">Add to enquiry</button>';
  }

  function cardHTML(p) {
    return '<article class="pcard"><div class="tile ' + TILE[p.cat] + '">' +
      (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') + shapeSVG(p.shape) + '</div>' +
      '<div class="meta"><h2>' + esc(p.name) + '</h2><span>' + esc(p.cat) + ' · Natural beige</span></div>' +
      actionHTML(p.id, 'full') + '</article>';
  }

  function rowHTML(p) {
    return '<div class="prow"><div class="tile ' + TILE[p.cat] + '">' + shapeSVG(p.shape) + '</div>' +
      '<div class="info"><h3>' + esc(p.name) + '</h3><span>' + esc(p.cat) + ' · Natural beige</span></div>' +
      '<div>' + actionHTML(p.id, 'compact') + '</div></div>';
  }

  /* ---------- pages ---------- */
  function initHome() {
    var host = $('[data-featured]');
    if (!host) return;
    function render() {
      host.innerHTML = FEATURED.map(function (id) { return rowHTML(byId(id)); }).join('');
    }
    render();
    document.addEventListener('cart:change', render);
  }

  function initStore() {
    var grid = $('[data-grid]');
    if (!grid) return;
    var chips = $('[data-chips]');
    var count = $('[data-shown]');
    var bar = $('[data-cartbar]');
    var params = new URLSearchParams(location.search);
    var filter = FILTERS.indexOf(params.get('cat')) > -1 ? params.get('cat') : 'All';

    chips.innerHTML = FILTERS.map(function (f) {
      return '<button type="button" class="chip" data-filter="' + esc(f) + '">' + esc(f) + '</button>';
    }).join('');
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      filter = b.getAttribute('data-filter');
      render();
    });

    function render() {
      var list = PRODUCTS.filter(function (p) { return filter === 'All' || p.cat === filter; });
      $$('.chip', chips).forEach(function (c) {
        c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === filter));
      });
      count.textContent = list.length + ' products';
      grid.innerHTML = list.map(cardHTML).join('');
      var n = Cart.lines();
      bar.hidden = n === 0;
      $('[data-bar-count]', bar).textContent = n + (n === 1 ? ' item' : ' items');
    }
    render();
    document.addEventListener('cart:change', render);
  }

  function initCart() {
    var list = $('[data-cart-list]');
    if (!list) return;
    var cartView = $('[data-cart-view]');
    var emptyView = $('[data-empty-view]');
    var doneView = $('[data-done-view]');
    var form = $('[data-cart-form]');

    function render() {
      if (doneView && !doneView.hidden) return;
      var c = Cart.read();
      var ids = Object.keys(c).map(Number).filter(byId);
      cartView.hidden = ids.length === 0;
      emptyView.hidden = ids.length !== 0;
      list.innerHTML = ids.map(function (id) {
        var p = byId(id);
        return '<div class="crow"><div class="tile ' + TILE[p.cat] + '">' + shapeSVG(p.shape) + '</div>' +
          '<div class="info"><h2>' + esc(p.name) + '</h2><span>' + esc(p.cat) + ' · Natural beige · Export carton</span>' +
          '<button type="button" class="link-btn" data-act="remove" data-id="' + id + '">Remove</button></div>' +
          '<div class="qtycol">' + actionHTML(id, 'compact') + '<small>Price on quote</small></div></div>';
      }).join('');
      $('[data-sum-lines]').textContent = ids.length;
      $('[data-sum-cartons]').textContent = Cart.total();
    }
    render();
    document.addEventListener('cart:change', render);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      Cart.clear();
      cartView.hidden = true;
      emptyView.hidden = true;
      doneView.hidden = false;
      doneView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function initContact() {
    var form = $('[data-contact-form]');
    if (!form) return;
    $$('[data-toggle]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      form.hidden = true;
      var done = $('[data-contact-done]');
      done.hidden = false;
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* minimal validation: fields marked data-required */
  function validate(form) {
    var ok = true;
    $$('[data-required]', form).forEach(function (input) {
      var field = input.closest('.field');
      var v = input.value.trim();
      var bad = !v || (input.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
      field.classList.toggle('invalid', bad);
      if (bad && ok) { input.focus(); }
      if (bad) ok = false;
    });
    return ok;
  }

  /* ---------- global events ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var id = Number(b.getAttribute('data-id'));
    var q = Cart.qty(id);
    var act = b.getAttribute('data-act');
    if (act === 'add') Cart.set(id, 1);
    if (act === 'inc') Cart.set(id, q + 1);
    if (act === 'dec') Cart.set(id, q - 1);
    if (act === 'remove') Cart.set(id, 0);
  });
  document.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f) f.classList.remove('invalid');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $$('details.mob-menu[open]').forEach(function (d) { d.removeAttribute('open'); });
  });
  document.addEventListener('cart:change', updateCount);
  window.addEventListener('storage', function () { updateCount(); document.dispatchEvent(new CustomEvent('cart:change')); });

  document.addEventListener('DOMContentLoaded', function () {
    updateCount();
    initHome();
    initStore();
    initCart();
    initContact();
  });
})();
