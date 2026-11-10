/* Kontaktformular der Startseite: sendet über Web3Forms im Hintergrund */
(function () {
  var f = document.getElementById('kontaktformular');
  if (!f) return;
  var err = f.querySelector('.form-error');
  var btn = f.querySelector('button[type=submit]');
  function fail(msg) { err.textContent = msg; f.classList.add('has-error'); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    f.classList.remove('has-error');
    var q = function (n) { return f.querySelector('[name="' + n + '"]'); };
    if (q('botcheck').checked) return;
    if (!q('telefon').value.trim() && !q('email').value.trim()) return fail('Bitte gib eine Telefonnummer oder E-Mail an, damit ich dich erreichen kann.');
    if (!q('einwilligung').checked) return fail('Bitte bestätige kurz die Einwilligung.');
    var data = {};
    new FormData(f).forEach(function (v, k) { data[k] = v; });
    if (data.email) data.replyto = data.email;
    btn.disabled = true;
    btn.textContent = 'Wird gesendet …';
    fetch(f.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.success) throw new Error();
        f.classList.add('is-done');
      })
      .catch(function () { fail('Senden hat nicht geklappt. Schreib mir bitte direkt an mail@allesodernetz.de.'); })
      .then(function () { btn.disabled = false; btn.textContent = 'Anfrage senden'; });
  });
})();
