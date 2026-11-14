// La casa siempre gana: interactive pieces. No dependencies, no network.
// Safety rules from UX research (see BUILDLOG): the slot never celebrates a
// win, never stages near-misses, always shows the net result, and offers a
// 10,000-spin run so the point is the math, not the thrill.
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var $ = function (id) { return document.getElementById(id); };
  function fmt(n) { return Math.round(n).toLocaleString('es-AR'); }
  function signed(n) { return (n > 0 ? '+' : '') + fmt(n); }
  function later(ms, fn) { if (reduceMotion) fn(); else setTimeout(fn, ms); }

  // ================= 1. SLOT =================
  // Honest paytable on a 5-chip spin. Expected return 92%:
  // 0.004*25 + 0.012*10 + 0.03*5 + 0.05*3 + 0.2*2 = 0.92
  var SYMBOLS = ['7', '★', 'BAR', '♥', '◆'];
  var PAYS = [
    { sym: '7', mult: 25, p: 0.004 },
    { sym: '★', mult: 10, p: 0.012 },
    { sym: 'BAR', mult: 5, p: 0.03 },
    { sym: '♥', mult: 3, p: 0.05 },
    { sym: '◆', mult: 2, p: 0.2 },
  ];
  var BET = 5, START = 100, SESSION_SPINS = 20, BIG_RUN = 10000;
  var slot = { chips: START, spinsLeft: SESSION_SPINS, played: 0, busy: false, ended: false };
  var reels = [$('reel0'), $('reel1'), $('reel2')];

  function randomSpin() {
    var u = Math.random(), acc = 0;
    for (var i = 0; i < PAYS.length; i++) {
      acc += PAYS[i].p;
      if (u < acc) return { reels: [PAYS[i].sym, PAYS[i].sym, PAYS[i].sym], win: BET * PAYS[i].mult };
    }
    // Losing spin: uniformly random non-matching reels. No near-miss staging.
    var r;
    do {
      r = [0, 0, 0].map(function () { return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; });
    } while (r[0] === r[1] && r[1] === r[2]);
    return { reels: r, win: 0 };
  }

  function bigRun(n) {
    var out = 0;
    for (var i = 0; i < n; i++) out += randomSpin().win;
    return { put: n * BET, out: out };
  }

  function paintMeters() {
    $('chips').textContent = fmt(slot.chips);
    var net = slot.chips - START;
    $('net').textContent = signed(net);
    $('net').className = net < 0 ? 'neg' : '';
    $('spins-left').textContent = String(slot.spinsLeft);
  }

  function setBusy(b) {
    slot.busy = b;
    $('spin').disabled = b || slot.ended;
    $('spin1000').disabled = b || slot.ended;
  }

  function spin() {
    if (slot.busy || slot.ended || slot.spinsLeft <= 0 || slot.chips < BET) return;
    setBusy(true);
    slot.chips -= BET;
    slot.spinsLeft -= 1;
    slot.played += 1;
    paintMeters();
    var res = randomSpin();
    var finish = function () {
      reels.forEach(function (r, i) { r.textContent = res.reels[i]; r.classList.remove('spinning'); });
      slot.chips += res.win;
      paintMeters();
      // Deliberately flat copy for wins: no lights, no sound, no "!!!".
      $('slot-msg').textContent = res.win > 0
        ? 'Te devolvió ' + res.win + ' fichas. Resultado total: ' + signed(slot.chips - START) + '.'
        : 'Nada. Resultado total: ' + signed(slot.chips - START) + '.';
      setBusy(false);
      if (slot.spinsLeft <= 0 || slot.chips < BET) endSession('session');
    };
    if (reduceMotion) return finish();
    reels.forEach(function (r) { r.classList.add('spinning'); });
    var start = Date.now();
    (function tick() {
      var t = Date.now() - start;
      reels.forEach(function (r, i) {
        if (t < 350 + i * 200) r.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        else { r.textContent = res.reels[i]; r.classList.remove('spinning'); }
      });
      if (t < 350 + 2 * 200 + 60) setTimeout(tick, 60); else finish();
    })();
  }

  function endSession(source) {
    if (slot.ended) return;
    slot.ended = true;
    setBusy(false);
    var run = bigRun(BIG_RUN);
    var net = slot.chips - START;
    var lead;
    if (source === 'skip') {
      lead = 'No jugaste, y está perfecto. Esto es lo que pasaría si alguien jugara ' + fmt(BIG_RUN) + ' tiradas en esta máquina:';
    } else if (source === 'big') {
      lead = 'Así se ven ' + fmt(BIG_RUN) + ' tiradas de una. Una sola tirada se siente como suerte. Muchas tiradas se ven como lo que son: una cuenta.';
    } else if (net > 0) {
      lead = 'En tus ' + slot.played + ' tiradas saliste ganando ' + fmt(net) + ' fichas. Pasa, y es justo lo que hace que la gente siga. Mirá qué pasaría si siguieras hasta ' + fmt(BIG_RUN) + ':';
    } else if (net === 0) {
      lead = 'En tus ' + slot.played + ' tiradas quedaste igual. Mirá qué pasaría si siguieras hasta ' + fmt(BIG_RUN) + ':';
    } else {
      lead = 'En tus ' + slot.played + ' tiradas perdiste ' + fmt(-net) + ' fichas. Y no fue mala suerte. Mirá qué pasaría si siguieras hasta ' + fmt(BIG_RUN) + ':';
    }
    $('reveal-body').textContent = lead;
    $('reveal-in').textContent = fmt(run.put);
    $('reveal-out').textContent = fmt(run.out);
    $('reveal-kept').textContent = fmt(run.put - run.out);
    $('slot-msg').textContent = 'Se apagaron las luces.';
    $('casino').classList.add('off');
    later(650, function () {
      var panel = $('reveal');
      panel.hidden = false;
      if (panel.scrollIntoView) panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  $('spin').addEventListener('click', spin);
  $('spin1000').addEventListener('click', function () { if (!slot.busy) endSession('big'); });
  $('skip').addEventListener('click', function () { endSession('skip'); });
  paintMeters();

  // ================= 2. ROULETTE STRIP =================
  var WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  var REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  var strip = $('strip');
  var cells = WHEEL.map(function (n) {
    var c = document.createElement('div');
    c.className = 'cell' + (n === 0 ? ' green' : REDS.indexOf(n) === -1 ? ' black' : '');
    c.title = String(n);
    strip.appendChild(c);
    return c;
  });
  var rolling = false, pulsedZero = false;

  function colorOf(n) { return n === 0 ? 'green' : REDS.indexOf(n) !== -1 ? 'red' : 'black'; }

  $('roll').addEventListener('click', function () {
    if (rolling) return;
    rolling = true;
    var target = Math.floor(Math.random() * 37);
    var steps = reduceMotion ? 0 : 37 + target;
    var i = 0, delay = 25;
    cells.forEach(function (c) { c.classList.remove('hit'); });
    function land() {
      var n = WHEEL[target];
      var col = colorOf(n);
      cells.forEach(function (c, k) { c.classList.toggle('hit', k === target); });
      var msg = col === 'red' ? 'Salió rojo (' + n + '). Esta la ganaste.'
        : col === 'black' ? 'Salió negro (' + n + '). Perdiste.'
        : 'Salió el 0. Perdieron todos, también los que jugaron al negro.';
      if (!pulsedZero && col !== 'green') {
        msg += ' Mirá el verde: está en todas las vueltas.';
        cells[0].classList.add('pulse');
        pulsedZero = true;
      }
      $('roll-msg').textContent = msg;
      rolling = false;
    }
    if (!steps) return land();
    (function step() {
      cells.forEach(function (c, k) { c.classList.toggle('hit', k === i % 37); });
      i += 1;
      if (i <= steps) { delay = 25 + Math.pow(i / steps, 3) * 160; setTimeout(step, delay); } else land();
    })();
  });

  // ================= 3. SIMULATOR =================
  var PLAYERS = 100, P_RED = 18 / 37;
  var bal = new Int32Array(PLAYERS);
  var simDone = 0, simBusy = false;
  var dotsEl = $('dots');
  var dots = [];
  for (var d = 0; d < PLAYERS; d++) {
    var dot = document.createElement('span');
    dot.className = 'dot';
    dotsEl.appendChild(dot);
    dots.push(dot);
  }

  function paintDots() {
    var ahead = 0;
    for (var k = 0; k < PLAYERS; k++) {
      var b = bal[k];
      dots[k].className = 'dot' + (b > 0 ? ' up' : b < 0 ? ' down' : '');
      if (b > 0) ahead += 1;
    }
    return ahead;
  }

  var simButtons = Array.prototype.slice.call(document.querySelectorAll('.sim-btn'));

  function simulateTo(target, btn) {
    if (simBusy) return;
    simBusy = true;
    if (target < simDone) { bal = new Int32Array(PLAYERS); simDone = 0; }
    var remaining = target - simDone;
    var frames = reduceMotion ? 1 : Math.min(40, Math.max(8, Math.ceil(remaining / 100)));
    var perFrame = Math.ceil(remaining / frames);
    simButtons.forEach(function (b) { b.disabled = true; });
    (function frame() {
      var n = Math.min(perFrame, target - simDone);
      for (var k = 0; k < PLAYERS; k++) {
        var b = bal[k];
        for (var s = 0; s < n; s++) b += Math.random() < P_RED ? 1 : -1;
        bal[k] = b;
      }
      simDone += n;
      var ahead = paintDots();
      $('sim-ahead').textContent = String(ahead);
      $('sim-after').textContent = 'después de ' + fmt(simDone) + ' apuestas cada uno';
      if (simDone < target) raf(frame);
      else {
        simBusy = false;
        if (btn) btn.classList.add('done');
        simButtons.forEach(function (b) { b.disabled = false; });
      }
    })();
  }

  simButtons.forEach(function (b) {
    b.addEventListener('click', function () { simulateTo(parseInt(b.getAttribute('data-n'), 10), b); });
  });

  // ================= 4. FOOTBALL ODDS (predict, then reveal) =================
  var PICKS = [
    'Elegiste a los Halcones, los favoritos. Tiene sentido.',
    'Elegiste el empate. Valiente.',
    'Elegiste a los Pumas. Te la jugaste.',
  ];
  Array.prototype.forEach.call(document.querySelectorAll('.odd'), function (b) {
    b.addEventListener('click', function () {
      var pick = parseInt(b.getAttribute('data-pick'), 10);
      Array.prototype.forEach.call(document.querySelectorAll('.odd'), function (o) { o.disabled = true; });
      b.classList.add('picked');
      // No match result is ever simulated: the payoff is the hidden margin, not a win.
      $('odds-pick').textContent = PICKS[pick] + ' Pero el resultado del partido no es lo importante acá.';
      $('odds-reveal').hidden = false;
    });
  });

  // ================= 5. HOOK CARDS =================
  Array.prototype.forEach.call(document.querySelectorAll('.flip'), function (card) {
    card.addEventListener('click', function () {
      card.setAttribute('aria-pressed', card.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  // ================= 6. "¿TIENE MECÁNICA DE APUESTA?" =================
  var QUIZ = [
    { t: 'Comprar un sobre de cartas en un juego, sin saber qué carta te toca.', a: true, why: 'Ponés monedas del juego, te toca al azar y hay premio: una carta mejor o peor. Los tres ingredientes.' },
    { t: 'Comprar un juego entero en la tienda.', a: false, why: 'Sabés exactamente qué te llevás. No hay azar.' },
    { t: 'Apostar plata a un partido con una app.', a: true, why: 'Los tres ingredientes. Y además es ilegal para menores de 18.' },
    { t: 'Una ruleta de skins.', a: true, why: 'Ponés algo que vale, gira al azar y te puede tocar un skin caro o uno que no vale nada.' },
    { t: 'Guardar plata en una alcancía.', a: false, why: 'No hay azar ni premio: la plata que ponés es la que tenés.' },
    { t: 'Un sorteo gratis en el que no ponés nada.', a: false, why: 'Hay azar y premio, pero no ponés nada que valga. Le falta un ingrediente.' },
    { t: 'Apostarle $1.000 a un amigo a que gana tu equipo.', a: true, why: 'Aunque sea entre amigos: ponés plata, el resultado es incierto y hay premio.' },
    { t: 'Comprar figuritas del Mundial.', a: true, why: 'Sí, tiene la mecánica: pagás y te toca al azar. No es ilegal y puede ser divertido, pero es la misma trampa del "una más". Ponete un límite antes de empezar.' },
    { t: 'Pagar por "señales" de cripto de un grupo que promete ganancias seguras.', a: true, why: 'Peor que una apuesta: además del azar, casi siempre es una estafa. Nadie puede prometer ganancias seguras.' },
    { t: 'Ahorrar todos los meses, por muchos años, en un fondo que invierte en cientos de empresas.', a: false, why: 'Invertir también tiene riesgo: sube y baja. La diferencia es que no jugás contra una casa armada para ganarte. Con tiempo, las empresas crecen y la cuenta juega a tu favor. Igual, eso se hace con un adulto.' },
  ];
  var q = { i: 0, score: 0, answered: false };
  var qCard = $('quiz-card');

  function showQ() {
    q.answered = false;
    qCard.className = 'quiz-card';
    qCard.style.transform = '';
    $('quiz-count').textContent = (q.i + 1) + ' / ' + QUIZ.length;
    qCard.textContent = QUIZ[q.i].t;
    $('quiz-feedback').textContent = '';
    $('quiz-actions').hidden = false;
    $('next-q').hidden = true;
  }

  function answer(yes) {
    if (q.answered || q.i >= QUIZ.length) return;
    q.answered = true;
    var item = QUIZ[q.i];
    var right = yes === item.a;
    if (right) q.score += 1;
    qCard.className = 'quiz-card ' + (right ? 'right' : 'wrong');
    qCard.style.transform = '';
    var fb = $('quiz-feedback');
    fb.textContent = '';
    var head = document.createElement('strong');
    head.textContent = right ? '¡Bien!' : 'Casi.';
    fb.appendChild(head);
    fb.appendChild(document.createTextNode(item.why));
    $('quiz-actions').hidden = true;
    $('next-q').hidden = false;
    $('next-q').textContent = q.i === QUIZ.length - 1 ? 'Ver mi resultado' : 'Siguiente';
  }

  function nextQ() {
    q.i += 1;
    if (q.i < QUIZ.length) return showQ();
    var s = q.score;
    var msg = s >= 8 ? 'Ya detectás la trampa mejor que muchos grandes.'
      : s >= 5 ? 'Bien. Las más tramposas son las que parecen inocentes, como los sobres y las figuritas.'
      : 'Tranqui: son difíciles a propósito. Lo único que tenés que recordar son los tres ingredientes.';
    qCard.className = 'quiz-card quiz-score';
    qCard.textContent = '';
    var big = document.createElement('strong');
    big.textContent = s + ' / ' + QUIZ.length;
    qCard.appendChild(big);
    qCard.appendChild(document.createTextNode(msg));
    $('quiz-count').textContent = 'Resultado';
    $('quiz-feedback').textContent = '';
    $('quiz-actions').hidden = true;
    $('next-q').hidden = false;
    $('next-q').textContent = 'Jugar de nuevo';
    q.i = QUIZ.length;
  }

  $('ans-yes').addEventListener('click', function () { answer(true); });
  $('ans-no').addEventListener('click', function () { answer(false); });
  $('next-q').addEventListener('click', function () {
    if (q.i >= QUIZ.length) { q.i = 0; q.score = 0; return showQ(); }
    nextQ();
  });

  // Arrow keys: left = "sí, tiene", right = "no tiene". Never hijack form controls.
  document.addEventListener('keydown', function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (q.answered || q.i >= QUIZ.length) return;
    if (e.key === 'ArrowLeft') answer(true);
    else if (e.key === 'ArrowRight') answer(false);
  });

  // Swipe: drag the card past 80px.
  var drag = null;
  qCard.addEventListener('pointerdown', function (e) {
    if (q.answered || q.i >= QUIZ.length) return;
    drag = { x: e.clientX, dx: 0 };
    if (qCard.setPointerCapture) qCard.setPointerCapture(e.pointerId);
  });
  qCard.addEventListener('pointermove', function (e) {
    if (!drag) return;
    drag.dx = e.clientX - drag.x;
    qCard.style.transform = 'translateX(' + drag.dx + 'px) rotate(' + (drag.dx / 30) + 'deg)';
  });
  function endDrag() {
    if (!drag) return;
    var dx = drag.dx;
    drag = null;
    qCard.style.transform = '';
    if (dx < -80) answer(true);
    else if (dx > 80) answer(false);
  }
  qCard.addEventListener('pointerup', endDrag);
  qCard.addEventListener('pointercancel', endDrag);
  showQ();

  // ================= 7. YOUR OTHER FUTURE =================
  // Real terms ("plata de hoy"): 4%/yr above inflation, weekly saving from age 12.
  var REAL = 0.04, START_AGE = 12;
  var rw = Math.pow(1 + REAL, 1 / 52) - 1;
  function fvWeekly(w, years) { var n = years * 52; return w * (Math.pow(1 + rw, n) - 1) / rw; }

  function paintFuture() {
    var w = parseFloat($('weekly').value) || 0;
    $('weekly-val').textContent = '$' + fmt(w);
    var v18 = fvWeekly(w, 18 - START_AGE), v25 = fvWeekly(w, 25 - START_AGE), v40 = fvWeekly(w, 40 - START_AGE);
    var max = v40 || 1;
    [[v18, 'bar18', 'v18'], [v25, 'bar25', 'v25'], [v40, 'bar40', 'v40']].forEach(function (row) {
      $(row[1]).style.width = (w > 0 ? Math.max(2, (row[0] / max) * 100) : 0) + '%';
      $(row[2]).textContent = '$' + fmt(row[0]);
    });
  }
  $('weekly').addEventListener('input', paintFuture);
  paintFuture();

  // ================= 8. COPY THE "TELL AN ADULT" SCRIPT =================
  $('copy').addEventListener('click', function () {
    var text = $('script-text').textContent;
    var done = function (ok) { $('copied').textContent = ok ? 'Copiado. Ahora pegalo en un mensaje.' : 'Seleccioná el texto y copialo a mano.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });
})();
