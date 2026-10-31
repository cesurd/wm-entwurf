(function () {
  // Hero-Video nur auf großen Bildschirmen und ohne Datensparmodus laden
  var hv = document.querySelector('video[data-src]');
  if (hv) {
    var save = navigator.connection && navigator.connection.saveData;
    if (window.matchMedia('(min-width: 861px)').matches && !save && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hv.src = hv.getAttribute('data-src'); hv.play && hv.play().catch(function () {});
    }
  }

  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = hdr.querySelector('.burger');
    burger && burger.addEventListener('click', function () {
      var open = hdr.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Mega-Menüs: Klick + Hover (Desktop), Escape schließt
    var items = hdr.querySelectorAll('.nav__item[data-mega]');
    var closeAll = function (except) {
      items.forEach(function (it) {
        if (it !== except) { it.classList.remove('is-open'); it.querySelector('.nav__link').setAttribute('aria-expanded', 'false'); }
      });
    };
    var desktop = window.matchMedia('(min-width: 1081px)');
    items.forEach(function (it) {
      var btn = it.querySelector('.nav__link'), t;
      btn.addEventListener('click', function () {
        var open = !it.classList.contains('is-open');
        closeAll(it); it.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open);
      });
      it.addEventListener('mouseenter', function () { if (!desktop.matches) return; clearTimeout(t); closeAll(it); it.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); });
      it.addEventListener('mouseleave', function () { if (!desktop.matches) return; t = setTimeout(function () { it.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }, 160); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav__item')) closeAll(); });
  }

  // Interaktiver Leitungsplan: Klick auf ein System zeigt seine Verbindungen + ein Beispiel
  var circ = document.querySelector('[data-circuit]');
  if (circ) {
    var ex = JSON.parse(circ.getAttribute('data-circuit'));
    var cap = circ.querySelector('.circuit__cap');
    var nodes = circ.querySelectorAll('.c-node');
    var pick = function (id) {
      nodes.forEach(function (n) { n.classList.toggle('is-on', n.dataset.n === id); });
      circ.querySelectorAll('.c-wire').forEach(function (w) { w.classList.toggle('is-on', w.dataset.n === id); });
      var x = ex[id]; if (x) cap.innerHTML = '<b>' + x[0] + '</b><span>' + x[1] + '</span>';
    };
    nodes.forEach(function (n) {
      n.addEventListener('click', function () { auto && clearInterval(auto); pick(n.dataset.n); });
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); auto && clearInterval(auto); pick(n.dataset.n); } });
    });
    var ids = Object.keys(ex), k = 0, auto = null;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      auto = setInterval(function () { pick(ids[k++ % ids.length]); }, 3200);
    }
  }

  // System-Konfigurator: gewählte Systeme -> passende Automatisierungen
  var cfg = document.querySelector('[data-cfg-rules]');
  if (cfg) {
    var rules = JSON.parse(cfg.getAttribute('data-cfg-rules'));
    var list = cfg.querySelector('[data-cfg-list]'), empty = cfg.querySelector('[data-cfg-empty]'), count = cfg.querySelector('[data-cfg-count]');
    var sel = function () { return Array.prototype.map.call(cfg.querySelectorAll('.chip[aria-pressed="true"]'), function (c) { return c.dataset.sys; }); };
    var hits = [];
    var update = function () {
      var s = sel();
      hits = rules.filter(function (r) { return r[0].every(function (x) { return s.indexOf(x) > -1; }); });
      count.firstChild.nodeValue = hits.length;
      list.innerHTML = hits.map(function (r) { return '<li><span>' + r[0].join(' + ') + '</span>' + r[1] + '</li>'; }).join('');
      list.hidden = !hits.length; empty.hidden = !!hits.length;
      empty.textContent = s.length < 2 ? 'Wählen Sie mindestens zwei Systeme, die Sie heute nutzen.' : 'Für diese Kombination beraten wir Sie gern individuell.';
    };
    cfg.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); update(); });
    });
    cfg.querySelector('[data-cfg-cta]').addEventListener('click', function () {
      var msg = document.querySelector('#f-msg');
      if (msg && sel().length) msg.value = 'Wir nutzen: ' + sel().join(', ') + '.\n' + (hits.length ? 'Interessant fänden wir:\n- ' + hits.map(function (r) { return r[1]; }).join('\n- ') : '');
      var topic = document.querySelector('#f-topic'); if (topic) topic.value = 'Automatisierung & Schnittstellen';
    });
  }


  // KI-Telefonat (Beispiel): Zeilen erscheinen nacheinander, danach Ergebnis, dann nächstes Szenario
  var call = document.querySelector('[data-call]');
  if (call) {
    var scs = JSON.parse(call.getAttribute('data-call'));
    var body = call.querySelector('[data-call-body]'), res = call.querySelector('[data-call-result]');
    var who = call.querySelector('[data-call-who]'), sit = call.querySelector('[data-call-sit]'), clock = call.querySelector('[data-call-time]');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var idx = 0, timers = [], sec = 0, tick = null;
    var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
    var clear = function () { timers.forEach(clearTimeout); timers = []; clearInterval(tick); };
    var play = function (n) {
      clear();
      var sc = scs[n % scs.length]; who.textContent = sc.who; sit.textContent = sc.situation;
      body.innerHTML = sc.lines.map(function (l) {
        return '<p class="msg msg--' + (l[0] === 'ai' ? 'ai' : 'caller') + '"><small>' + (l[0] === 'ai' ? 'KI-Assistent' : 'Anrufer') + '</small>' + esc(l[1]) + '</p>';
      }).join('');
      res.innerHTML = sc.result.map(function (r) { return '<span>✓ ' + esc(r) + '</span>'; }).join('');
      var msgs = body.querySelectorAll('.msg'), chips = res.querySelectorAll('span');
      if (reduce) { msgs.forEach(function (m) { m.classList.add('is-in'); }); chips.forEach(function (c) { c.classList.add('is-in'); }); return; }
      sec = 0; clock.textContent = '00:00';
      tick = setInterval(function () { sec++; clock.textContent = ('0' + Math.floor(sec / 60)).slice(-2) + ':' + ('0' + sec % 60).slice(-2); }, 1000);
      var t = 400;
      msgs.forEach(function (m) { timers.push(setTimeout(function () { m.classList.add('is-in'); }, t)); t += 1300 + m.textContent.length * 22; });
      chips.forEach(function (c) { timers.push(setTimeout(function () { c.classList.add('is-in'); }, t)); t += 450; });
      timers.push(setTimeout(function () { clearInterval(tick); }, t));
      timers.push(setTimeout(function () { play(++idx); }, t + 4200));
    };
    call.querySelector('[data-call-next]').addEventListener('click', function () { play(++idx); });
    var started = false;
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting && !started) { started = true; play(0); } });
    io.observe(call);
  }

  // Erreichbarkeits-Rechner (bewusst ohne Preis – Preise sind individuell)
  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var get = function (k) { return parseFloat(calc.querySelector('[data-k="' + k + '"]').value); };
    var int = function (v) { return Math.round(v).toLocaleString('de-DE'); };
    var upd = function () {
      calc.querySelectorAll('input[type=range]').forEach(function (r) {
        r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
        calc.querySelector('#o-' + r.dataset.k).textContent = r.value + r.dataset.unit;
      });
      var calls = get('calls'), miss = get('miss'), missed = calls * 21 * miss / 100;
      calc.querySelector('[data-c="missed"]').textContent = int(missed) + ' / Monat';
      calc.querySelector('[data-c="missed-txt"]').textContent = 'bei ' + calls + ' Anrufen pro Tag, 21 Arbeitstagen und ' + miss + ' % Anrufen ohne Annahme';
      calc.querySelector('[data-c="year"]').textContent = int(missed * 12);
      calc.querySelector('[data-c="ai"]').textContent = int(missed);
    };
    calc.addEventListener('input', upd); upd();
    calc.querySelector('[data-calc-cta]').addEventListener('click', function () {
      var msg = document.querySelector('#f-msg'), topic = document.querySelector('#f-topic');
      if (msg) msg.value = 'Erreichbarkeits-Rechner: ca. ' + get('calls') + ' Anrufe pro Tag, ca. ' + get('miss') + ' % werden heute nicht angenommen. Wir interessieren uns für den KI-Telefonassistenten und die Cloud-Telefonie.';
      if (topic) topic.value = 'KI-Telefonassistent / WhatsApp';
    });
  }


  // Ansagetext-Generator
  var an = document.querySelector('[data-ansage]');
  if (an) {
    var out = document.querySelector('[data-ansage-out]'), meta = document.querySelector('[data-ansage-meta]');
    var g = function (id) { var el = document.getElementById(id); return el.type === 'checkbox' ? el.checked : el.value.trim(); };
    var T = {
      formal: {
        hello: function (f) { return 'Guten Tag und herzlich willkommen bei ' + f + '.'; },
        closed: function (z) { return 'Sie rufen außerhalb unserer Geschäftszeiten an. Wir sind ' + z + ' für Sie erreichbar.'; },
        lunch: function (z) { return 'Wir sind gerade in der Mittagspause und ab 13 Uhr wieder persönlich für Sie da. Unsere Geschäftszeiten: ' + z + '.'; },
        busy: function () { return 'Im Moment sind leider alle Kolleginnen und Kollegen im Gespräch.'; },
        holiday: function (v, b) { return 'Unser Büro ist ' + (v ? 'ab dem ' + v + ' ' : '') + 'wegen Betriebsferien geschlossen' + (b ? '. Ab dem ' + b + ' sind wir wieder für Sie da' : '') + '.'; },
        feiertag: function (z) { return 'Heute ist Feiertag, unser Büro ist geschlossen. Ab dem nächsten Werktag sind wir ' + z + ' wieder für Sie da.'; },
        welcome: function () { return 'Ihr Anruf wird gleich entgegengenommen. Bitte haben Sie einen Moment Geduld.'; },
        cb: 'Bitte hinterlassen Sie nach dem Signalton Ihren Namen, Ihre Telefonnummer und Ihr Anliegen. Wir rufen Sie schnellstmöglich zurück.',
        mail: function (m) { return 'Sie erreichen uns auch unter ' + m + '.'; },
        em: function (n) { return 'In dringenden Fällen wählen Sie bitte ' + n + '.'; },
        bye: 'Vielen Dank für Ihren Anruf.'
      },
      warm: {
        hello: function (f) { return 'Hallo und schön, dass Sie bei ' + f + ' anrufen!'; },
        closed: function (z) { return 'Gerade ist niemand im Büro – Sie erreichen uns ' + z + '.'; },
        lunch: function (z) { return 'Wir machen kurz Mittagspause und sind ab 13 Uhr wieder für Sie da. Ansonsten erreichen Sie uns ' + z + '.'; },
        busy: function () { return 'Gerade sind alle von uns im Gespräch – wir möchten Sie aber nicht verpassen.'; },
        holiday: function (v, b) { return 'Wir tanken gerade Energie' + (v ? ' und sind ab dem ' + v + ' im Urlaub' : '') + (b ? '. Ab dem ' + b + ' sind wir wieder für Sie da' : '') + '.'; },
        feiertag: function (z) { return 'Heute ist Feiertag und wir genießen den freien Tag. Ab dem nächsten Werktag sind wir ' + z + ' wieder da.'; },
        welcome: function () { return 'Einen kleinen Moment bitte – gleich ist jemand für Sie da.'; },
        cb: 'Sprechen Sie uns gern nach dem Signalton Ihren Namen, Ihre Nummer und Ihr Anliegen aufs Band – wir melden uns so schnell wie möglich.',
        mail: function (m) { return 'Schreiben Sie uns auch gern an ' + m + '.'; },
        em: function (n) { return 'Wenn es wirklich dringend ist, erreichen Sie uns unter ' + n + '.'; },
        bye: 'Danke für Ihren Anruf und bis bald!'
      }
    };
    var gen = function () {
      var t = T[g('a-ton')], occ = g('a-anlass'), f = g('a-firma') || 'unserem Unternehmen', z = g('a-zeiten') || 'zu unseren Geschäftszeiten';
      an.querySelectorAll('[data-show]').forEach(function (el) { el.hidden = el.getAttribute('data-show') !== occ; });
      var parts = [t.hello(f)];
      if (occ === 'holiday') parts.push(t.holiday(g('a-von'), g('a-bis'))); else parts.push(t[occ](z));
      if (g('a-rueckruf') && occ !== 'welcome') parts.push(t.cb);
      if (g('a-notfall') && occ !== 'welcome' && occ !== 'busy') parts.push(t.em(g('a-notfall')));
      if (g('a-mail') && occ !== 'welcome') parts.push(t.mail(g('a-mail')));
      parts.push(t.bye);
      var txt = parts.join(' ');
      out.textContent = txt;
      var words = txt.split(/\s+/).length;
      meta.textContent = words + ' Wörter · gesprochen ca. ' + Math.round(words / 2.3) + ' Sekunden' + (words / 2.3 > 30 ? ' – eher kürzen, ideal sind 20 bis 30 Sekunden' : '');
    };
    an.addEventListener('input', gen); an.addEventListener('change', gen); gen();
    document.querySelector('[data-ansage-copy]').addEventListener('click', function (ev) {
      var b = ev.currentTarget;
      (navigator.clipboard ? navigator.clipboard.writeText(out.textContent) : Promise.reject()).then(function () { b.textContent = 'Kopiert'; }, function () {
        var r = document.createRange(); r.selectNodeContents(out); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); b.textContent = 'Markiert – jetzt kopieren';
      });
      setTimeout(function () { b.textContent = 'Text kopieren'; }, 2500);
    });
  }

  // VoIP-Bandbreitenrechner
  var bw = document.querySelector('[data-bw]');
  if (bw) {
    var bwu = function () {
      var c = +document.getElementById('bw-calls').value, k = +document.getElementById('bw-codec').value, r = +document.getElementById('bw-res').value;
      bw.querySelectorAll('input[type=range]').forEach(function (x) { x.style.setProperty('--p', ((x.value - x.min) / (x.max - x.min) * 100) + '%'); });
      document.getElementById('bw-o-calls').textContent = c; document.getElementById('bw-o-res').textContent = r + ' %';
      var voice = c * k, total = voice * (1 + r / 100);
      var fmt = function (v) { return v >= 1000 ? (v / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Mbit/s' : Math.round(v) + ' kbit/s'; };
      document.querySelector('[data-bw-voice]').textContent = fmt(voice);
      document.querySelector('[data-bw-total]').textContent = fmt(total);
    };
    bw.addEventListener('input', bwu); bwu();
  }


  // Multistep-Funnel (Einsparungsrechner)
  var fn = document.querySelector('[data-funnel]');
  if (fn) {
    var cfg = JSON.parse(fn.getAttribute('data-funnel'));
    var steps = Array.prototype.slice.call(fn.querySelectorAll('.fn__step'));
    var nQ = fn.querySelectorAll('.fn__step[data-key]').length;
    var ans = {}, labels = {}, cur = 0, hist = [];
    var bar = fn.querySelector('[data-fn-bar]'), back = fn.querySelector('[data-fn-back]'), count = fn.querySelector('[data-fn-count]');
    var num = function (v) { return Math.round(v).toLocaleString('de-DE'); };
    var calc = function () {
      var calls = +ans.calls, miss = +ans.miss / 100, val = +ans.value;
      var missed = calls * cfg.workdays * miss;
      var jobs = missed * cfg.jobRate;
      return { missed: missed, jobs: jobs, lostyear: jobs * val * 12, hours: calls * cfg.workdays * cfg.routineShare * cfg.minutes / 60 };
    };
    var paint = function () {
      var r = calc();
      fn.querySelectorAll('[data-r="missed"]').forEach(function (el) { el.textContent = num(r.missed); });
      fn.querySelectorAll('[data-r="jobs"]').forEach(function (el) { el.textContent = num(r.jobs); });
      fn.querySelectorAll('.fn__result [data-r="lostyear"]').forEach(function (el) { el.textContent = num(r.lostyear) + ' €'; });
      fn.querySelectorAll('[data-r="hours"]').forEach(function (el) { el.textContent = num(r.hours) + ' Std.'; });
      fn.querySelector('[data-r="assume"]').textContent = 'Schätzung auf Basis Ihrer Angaben: ' + ans.calls + ' Anrufe pro Tag, ' + ans.miss + ' % ohne Annahme, ' +
        cfg.workdays + ' Arbeitstage pro Monat, durchschnittlicher Auftragswert ' + num(+ans.value) + ' €. Annahmen: Jeder ' +
        Math.round(1 / cfg.jobRate) + '. verpasste Anruf wäre ein Auftrag geworden; die Hälfte der Anrufe sind Routinefragen von rund ' + cfg.minutes + ' Minuten.';
      return r;
    };
    var show = function (i, push) {
      if (push !== false && i !== cur) hist.push(cur);
      steps.forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== i; });
      cur = i;
      bar.style.width = Math.min(100, Math.round(i / (nQ + 1) * 100)) + '%';
      back.hidden = !hist.length || i > nQ;
      count.textContent = i < nQ ? 'Frage ' + (i + 1) + ' von ' + nQ : (i === nQ ? 'Fast geschafft' : 'Ihr Ergebnis');
      if (i >= nQ) paint();
      var top = fn.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * .6) fn.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    fn.querySelectorAll('.fn__step[data-key]').forEach(function (st) {
      st.querySelectorAll('.fn__opt').forEach(function (b) {
        b.addEventListener('click', function () {
          st.querySelectorAll('.fn__opt').forEach(function (x) { x.classList.toggle('is-picked', x === b); });
          ans[st.getAttribute('data-key')] = b.getAttribute('data-v');
          labels[st.getAttribute('data-key')] = st.querySelector('.fn__q').textContent + ' ' + b.querySelector('b').textContent;
          setTimeout(function () { show(+st.getAttribute('data-step') + 1); }, 220);
        });
      });
    });
    back.addEventListener('click', function () { if (hist.length) show(hist.pop(), false); });
    show(0, false);

    var form = fn.querySelector('[data-fn-form]'), status = form.querySelector('.form__status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { var el = form.elements[n]; return el.type === 'checkbox' ? el.checked : el.value.trim(); };
      if (!v('name') || !v('company') || !v('phone')) { status.className = 'form__status is-err'; status.textContent = 'Bitte Name, Kfz-Werkstatt und Telefonnummer angeben.'; return; }
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v('email'))) { status.className = 'form__status is-err'; status.textContent = 'Bitte eine gültige E-Mail-Adresse angeben – dorthin schicken wir Ihre Auswertung.'; return; }
      if (!v('privacy')) { status.className = 'form__status is-err'; status.textContent = 'Bitte stimmen Sie der Verarbeitung zu, damit wir Sie anrufen dürfen.'; return; }
      var r = paint(), btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Wird gesendet …';
      var msg = 'Einsparungsrechner ' + fn.getAttribute('data-source') + '\n' + Object.keys(labels).map(function (k) { return '- ' + labels[k]; }).join('\n') +
        '\nErgebnis: ' + num(r.missed) + ' verpasste Anrufe/Monat, ' + num(r.jobs) + ' mögliche Aufträge, ' + num(r.lostyear) + ' € Umsatz/Jahr, ' + num(r.hours) + ' Std. Routine-Telefonzeit/Monat';
      var done = function (ok) {
        fn.querySelector('.fn__done').innerHTML = fn.querySelector('.fn__done').innerHTML.replace('{name}', v('name').split(' ')[0].replace(/[<>&]/g, ''));
        if (!ok) fn.querySelector('.fn__done').innerHTML = '<b>Ihre Anfrage konnte leider nicht übertragen werden.</b> Rufen Sie uns bitte direkt an: 05308 935030.';
        show(nQ + 1);
      };
      fetch('/vorschau-ohne-versand', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: v('name'), company: v('company'), email: v('email'), phone: v('phone'), topic: 'KI-Telefonassistent / Werkstatt-Funnel',
          message: msg, consent: true, source: 'funnel-' + fn.getAttribute('data-source'), hp: v('hp'), answers: ans, meta: window.stkMeta ? window.stkMeta('funnel') : null,
          result: { missed: Math.round(r.missed), jobs: Math.round(r.jobs), lostyear: Math.round(r.lostyear), hours: Math.round(r.hours) }, submitted_at: new Date().toISOString() })
      }).then(function (res) { done(res.ok); }).catch(function () { done(false); });
    });
  }

  // Kontaktformular → n8n (gleicher Endpunkt wie bisher)
  document.querySelectorAll('form[data-contact]').forEach(function (form) {
    var status = form.querySelector('.form__status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { var el = form.elements[n]; return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
      if (!v('privacy')) { status.className = 'form__status is-err'; status.textContent = 'Bitte stimmen Sie der Datenschutzerklärung zu, damit wir antworten dürfen.'; return; }
      // Pflichtfelder (z. B. KI-Check): erst prüfen, dann senden
      var missing = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (el) { return el.type !== 'checkbox' && !el.value.trim(); });
      if (missing.length) { status.className = 'form__status is-err'; status.textContent = 'Bitte füllen Sie alle Pflichtfelder (*) aus.'; missing[0].focus(); return; }
      if (form.elements.email && form.elements.email.value && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v('email'))) { status.className = 'form__status is-err'; status.textContent = 'Bitte eine gültige E-Mail-Adresse angeben.'; return; }
      var btn = form.querySelector('button[type="submit"]'), label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Wird gesendet …';
      fetch('/vorschau-ohne-versand', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: v('name'), company: v('company'), email: v('email'), phone: v('phone'), topic: v('interest'),
          message: v('message'), consent: true, source: form.getAttribute('data-contact'), hp: v('hp'), meta: window.stkMeta ? window.stkMeta('contact') : null,
          website: v('website') || undefined, branche: v('branche') || undefined, ort: v('ort') || undefined, submitted_at: new Date().toISOString() })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); status.className = 'form__status is-ok';
        status.textContent = form.getAttribute('data-ok') || 'Danke, Ihre Nachricht ist angekommen. Wir melden uns zu unseren Geschäftszeiten bei Ihnen.';
      }).catch(function () {
        status.className = 'form__status is-err';
        status.textContent = 'Die Nachricht konnte nicht gesendet werden. Rufen Sie uns an: 05308 935030 oder schreiben Sie an info@stkom.de.';
      }).finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();
