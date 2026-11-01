/* STKom – Bühnen „Web & Marketing“: Trefferliste, KI-Antwort, Ads-Rechner. Ohne Abhängigkeiten. */
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sichtbar(el, fn) {
    if (!('IntersectionObserver' in window)) return fn();
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: 0.35 });
    io.observe(el);
  }

  // SEO: „Ihre Firma“ steigt von data-von auf data-nach (Positionen 1-basiert)
  document.querySelectorAll('.stage--serp .serp__list').forEach(function (ul) {
    var li = Array.prototype.slice.call(ul.children);
    var du = ul.querySelector('.is-you'); if (!du) return;
    var von = +ul.dataset.von || li.length, nach = +ul.dataset.nach || 2;
    function setze(pos) {
      var reihe = li.filter(function (x) { return x !== du; });
      reihe.splice(pos - 1, 0, du);
      var h = li[0].getBoundingClientRect().height;
      reihe.forEach(function (x, i) { x.style.transform = 'translateY(' + ((i - li.indexOf(x)) * h) + 'px)'; x.querySelector('.n').textContent = i + 1; });
    }
    if (still) { setze(nach); return; }
    setze(von);
    sichtbar(ul, function () { setTimeout(function () { setze(nach); }, 700); });
  });

  // GEO: Antwort tippt sich, danach erscheint die Quelle
  document.querySelectorAll('.stage--chat .bub--a').forEach(function (b) {
    var t = b.querySelector('[data-text]'), src = b.querySelector('.src');
    if (!t) return;
    var voll = t.getAttribute('data-text');
    if (still) { t.textContent = voll; return; }
    t.textContent = ''; if (src) src.style.opacity = 0;
    var caret = document.createElement('span'); caret.className = 'caret'; t.after(caret);
    sichtbar(b, function () {
      var i = 0;
      (function tipp() {
        i += Math.max(1, Math.round(voll.length / 140));
        t.textContent = voll.slice(0, i);
        if (i < voll.length) setTimeout(tipp, 18);
        else { caret.remove(); if (src) { src.style.transition = 'opacity .5s'; src.style.opacity = 1; } }
      })();
    });
  });

  // Google Ads: Rechner mit Beispielwerten
  document.querySelectorAll('.adcalc').forEach(function (f) {
    var fmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
    var fmt1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
    function v(n) { var e = f.querySelector('[name=' + n + ']'); return e ? +e.value : 0; }
    function r() {
      var budget = v('budget'), cpc = v('cpc'), quote = v('quote') / 100, absch = v('abschluss') / 100;
      var klicks = cpc ? budget / cpc : 0, anfr = klicks * quote, auftr = anfr * absch;
      f.querySelector('[data-o=budget]').textContent = fmt.format(budget) + '\u00a0€';
      f.querySelector('[data-o=klicks]').textContent = fmt.format(klicks);
      f.querySelector('[data-o=anfragen]').textContent = fmt1.format(anfr);
      f.querySelector('[data-o=auftraege]').textContent = fmt1.format(auftr);
      var o = f.querySelector('[data-o=cpc]'); if (o) o.textContent = fmt1.format(cpc) + '\u00a0€';
      var oq = f.querySelector('[data-o=quote]'); if (oq) oq.textContent = fmt1.format(v('quote')) + '\u00a0%';
      var oa = f.querySelector('[data-o=abschluss]'); if (oa) oa.textContent = fmt.format(v('abschluss')) + '\u00a0%';
    }
    f.addEventListener('input', r); r();
  });
})();

/*BX:basis*/
/* Bento-Grundbausteine STKom: Einblenden bei Sichtbarkeit, Scroll-Fortschritt, Sicherheitsnetz */
(function () {
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = [].slice.call(document.querySelectorAll('[data-bx], [data-bx-live]'));
  if (still || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); }
  else {
    document.documentElement.classList.add('bx-anim');
    var gesehen = false;
    var io = new IntersectionObserver(function (es) { gesehen = true; es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    els.forEach(function (e) { io.observe(e); });
    // Sicherheitsnetz: meldet der Beobachter gar nichts (Renderer ohne Beobachter-Rückmeldung), alles im Endzustand zeigen
    addEventListener('load', function () { setTimeout(function () { if (!gesehen) els.forEach(function (e) { e.classList.add('is-in'); }); }, 4000); });
  }
  var sc = [].slice.call(document.querySelectorAll('[data-bx-scroll]'));
  if (sc.length) {
    var tick = false;
    var upd = function () { tick = false; var h = innerHeight; sc.forEach(function (e) { var r = e.getBoundingClientRect(); var p = still ? 1 : (h * 0.85 - r.top) / (r.height * 0.9 + h * 0.35); e.style.setProperty('--bx-p', Math.max(0, Math.min(1, p)).toFixed(3)); }); };
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  }
})();
/*/BX:basis*/

/*BX:kennzahlen*/
/* Kennzahlen B: keine eigene Logik nötig. Hochfahren über data-bx-live (.is-in), Lichtreflex über data-bx-scroll (--bx-p) aus bx-basis.js. */
/*/BX:kennzahlen*/

/*BX:erklaer*/
/* erklaer A: Ablauf läuft über bx-basis (data-bx-live → .is-in), kein eigenes Skript nötig. */
/*/BX:erklaer*/

/*BX:leistung*/
/* Leistung A: keine eigene Logik nötig. Sichtbarkeit (.is-in) setzt bx-basis.js, die Bewegung läuft in style.css. */
/*/BX:leistung*/

/*BX:lokal*/
/* lokal B „Seitenbaum“: Startpunkt jeder Seitenkarte = ihr Abschnitt in der langen Startseite (nur CSS-Variablen, Bewegung per transform) */
(function () {
  var m = document.querySelector('.sk-lokal-map'); if (!m) return;
  function lage(el) { var x = 0, y = 0; while (el && el !== m) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; }
  function miss() {
    [].forEach.call(m.querySelectorAll('[data-src]'), function (n) {
      var s = m.querySelector('[data-k="' + n.getAttribute('data-src') + '"]'); if (!s || !n.offsetWidth) return;
      var a = lage(s), b = lage(n);
      n.style.setProperty('--fx', (a[0] + s.offsetWidth / 2 - b[0] - n.offsetWidth / 2).toFixed(1) + 'px');
      n.style.setProperty('--fy', (a[1] + s.offsetHeight / 2 - b[1] - n.offsetHeight / 2).toFixed(1) + 'px');
      n.style.setProperty('--fs', Math.min(1, s.offsetWidth / n.offsetWidth).toFixed(3));
    });
  }
  miss(); addEventListener('load', miss); addEventListener('resize', miss);
})();
/*/BX:lokal*/

/*BX:ablauf*/
/* Ablauf A: Lage jedes Ports auf der Leitung (0…1) als --x, damit LED und Paket zusammenpassen */
(function () {
  var g = document.querySelector('.sk-ablauf-grid'); if (!g) return;
  var cab = g.querySelector('.sk-ablauf-cable'), so = [].slice.call(g.querySelectorAll('.sk-ablauf-steps .sk-ablauf-sock'));
  function mess() {
    var c = cab.getBoundingClientRect(), v = c.height > c.width, L = v ? c.height : c.width; if (!L) return;
    so.forEach(function (s) {
      var r = s.getBoundingClientRect(), m = v ? r.top + r.height / 2 - c.top : r.left + r.width / 2 - c.left;
      s.style.setProperty('--x', Math.min(1, (m + 6) / L).toFixed(4));
    });
  }
  mess(); addEventListener('resize', mess); addEventListener('load', mess);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mess);
})();
/*/BX:ablauf*/

/*BX:vorort*/
/* vorort-A: Flugweg der Ansprechpartner-Marke von der Personenkarte zum Ticket (nur Variablen, Bewegung per CSS-transform) */
(function () {
  var c = document.querySelector('.sk-vorort-live'); if (!c) return;
  var home = c.querySelector('.sk-vorort-home'), fl = c.querySelectorAll('.sk-vorort-fly');
  if (!home) return;
  function pos(el) { var x = 0, y = 0; while (el && el !== c) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; }
  function mess() {
    var h = pos(home), hx = h[0] + home.offsetWidth / 2, hy = h[1] + home.offsetHeight / 2;
    [].forEach.call(fl, function (f) {
      var p = pos(f);
      f.style.setProperty('--fx', Math.round(hx - p[0] - f.offsetWidth / 2) + 'px');
      f.style.setProperty('--fy', Math.round(hy - p[1] - f.offsetHeight / 2) + 'px');
    });
  }
  mess(); addEventListener('load', mess); addEventListener('resize', mess);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mess);
})();
/*/BX:vorort*/

/*BX:faq*/
/* FAQ B „Ticket-Liste“: immer nur eine Frage offen; die angeklickte Zeile bleibt dabei an ihrer Stelle */
(function () {
  var l = document.querySelector('.sk-faq-list'); if (!l) return;
  var ds = [].slice.call(l.querySelectorAll('details'));
  l.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('summary'); if (!s || s.parentNode.parentNode !== l) return;
    var d = s.parentNode; if (d.open) return;
    var y = d.getBoundingClientRect().top;
    ds.forEach(function (x) { if (x !== d) x.open = false; });
    var dy = d.getBoundingClientRect().top - y;
    if (dy) window.scrollBy({ top: dy, left: 0, behavior: 'instant' });
  });
  // Fallback (z. B. Suche im Browser öffnet eine Antwort): andere schließen
  l.addEventListener('toggle', function (e) {
    var d = e.target; if (!d.open) return;
    ds.forEach(function (x) { if (x !== d && x.open) x.open = false; });
  }, true);
})();
/*/BX:faq*/

/*BX:kontakt*/
/* Kontakt B: Die Terminkarte übernimmt beim Tippen den Namen aus „Unternehmen“ statt „Ihre Firma“.
   Nur Anzeige im Beispiel (aria-hidden), nichts wird gespeichert oder gesendet. Bewegung läuft über CSS. */
(function () {
  var f = document.getElementById('f-company'), z = document.querySelector('.sk-kontakt-firma');
  if (!f || !z) return;
  var setze = function () { z.textContent = f.value.trim() || 'Ihre Firma'; };
  f.addEventListener('input', setze);
  if (f.form) f.form.addEventListener('reset', function () { setTimeout(setze, 0); });
})();
/*/BX:kontakt*/
