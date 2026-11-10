/* Terminwahl: die nächsten 6 Öffnungstage (Di–Sa) + Zusammenfassung */
(function () {
  var form = document.querySelector('[data-booking]');
  if (!form) return;
  var box = form.querySelector('[data-days]');
  var names = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var months = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
  var d = new Date();
  var n = 0;
  while (n < 6) {
    d.setDate(d.getDate() + 1);
    var wd = d.getDay();
    if (wd === 0 || wd === 1) continue;
    var label = names[wd] + ', ' + d.getDate() + '. ' + months[d.getMonth()];
    var l = document.createElement('label');
    l.innerHTML = '<input type="radio" name="tag" required><span><small></small><b></b></span>';
    l.querySelector('input').value = label;
    l.querySelector('small').textContent = names[wd];
    l.querySelector('b').textContent = d.getDate() + '. ' + months[d.getMonth()];
    box.appendChild(l);
    n++;
  }
  var out = form.querySelector('[data-summary]');
  function update() {
    var s = form.querySelector('input[name=leistung]:checked');
    var t = form.querySelector('input[name=tag]:checked');
    var z = form.querySelector('input[name=zeit]:checked');
    if (!s && !t && !z) { out.textContent = 'Wähl Leistung, Tag und Uhrzeit.'; return; }
    out.innerHTML = '';
    var parts = [s ? s.value : 'Leistung?', t ? t.value : 'Tag?', z ? z.value + ' Uhr' : 'Uhrzeit?'];
    var b = document.createElement('b');
    b.textContent = parts.join(', ');
    out.appendChild(document.createTextNode('Dein Wunsch: '));
    out.appendChild(b);
  }
  form.addEventListener('change', update);
  form.addEventListener('reset', function () { setTimeout(update, 0); });
})();
