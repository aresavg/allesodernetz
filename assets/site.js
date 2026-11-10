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
