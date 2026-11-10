/* Menü am Handy + Beispiel-Formulare (senden nichts) */
(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    header.querySelectorAll('nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      f.classList.add('is-done');
      var done = f.querySelector('.form-done');
      if (done) { done.setAttribute('tabindex', '-1'); done.focus(); }
    });
    var again = f.querySelector('[data-again]');
    if (again) again.addEventListener('click', function () { f.reset(); f.classList.remove('is-done'); });
  });
})();

/* Einblenden, Zähler */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Hero: sofort nacheinander einblenden
  requestAnimationFrame(function () {
    document.querySelectorAll('[data-anim="hero"]').forEach(function (el) { el.classList.add('in'); });
  });
  // Überschriften der Abschnitte automatisch mitnehmen
  document.querySelectorAll('main section:not(:first-child) h2').forEach(function (h) {
    if (!h.closest('[data-stagger]') && !h.closest('form') && !h.hasAttribute('data-anim')) h.setAttribute('data-anim', '');
  });

  function count(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var fmt = function (v) { return pre + v.toFixed(dec).replace('.', ',') + suf; };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }

  var targets = document.querySelectorAll('[data-anim]:not([data-anim="hero"]), [data-stagger], [data-count], [data-bars]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('in');
      if (el.hasAttribute('data-count')) count(el);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });
})();
