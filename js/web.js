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
