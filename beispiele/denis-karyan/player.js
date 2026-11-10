/* Beispiel-Player: nur Anzeige, kein Ton */
(function () {
  var list = document.querySelector('[data-player]');
  if (!list) return;
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var on = b.getAttribute('aria-pressed') !== 'true';
    list.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
})();
