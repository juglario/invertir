// Widgets for "El péndulo del mercado".
//   pendulum-sim:    a simulated crowd mood swings between panic and euphoria; price = value x mood.
//                    Compare buying only when excited, only when scared, or every month.
//   three-questions: Howard Marks' three questions as sliders, read out as a pendulum position and a posture.
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  var M = {
    gauss: function (rand) {
      var u = 0, v = 0;
      while (u === 0) u = rand();
      while (v === 0) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    // AR(2) with complex roots: a noisy swing with a typical period of `period` months, scaled to [-1, 1]
    moodPath: function (rand, months, period) {
      var r = 0.97, w = 2 * Math.PI / period, a1 = 2 * r * Math.cos(w), a2 = -r * r;
      var x1 = 0, x2 = 0, raw = [], burn = 120, mx = 0;
      for (var t = -burn; t <= months; t++) {
        var x = a1 * x1 + a2 * x2 + M.gauss(rand);
        x2 = x1; x1 = x;
        if (t >= 0) { raw.push(x); mx = Math.max(mx, Math.abs(x)); }
      }
      return raw.map(function (x) { return x / (mx || 1); });
    },
    // price = value * exp(amp * mood); value grows g a year
    market: function (mood, amp, g) {
      return mood.map(function (m, t) {
        var value = 100 * Math.pow(1 + g, t / 12);
        return { t: t, mood: m, value: value, price: value * Math.exp(amp * m) };
      });
    },
    // average price/value paid by someone who buys only when the test passes
    buyer: function (mkt, test) {
      var n = 0, s = 0;
      mkt.forEach(function (p) { if (test(p.mood)) { n++; s += p.price / p.value; } });
      return n ? { n: n, prem: s / n - 1 } : { n: 0, prem: null };
    },
    // Marks' three questions, each 1..10. Returns a reading in [-1, 1]: -1 panic, +1 euphoria
    reading: function (optimism, fear, credit) {
      var score = (optimism + (11 - fear) + credit) / 3;   // 1..10
      return (score - 5.5) / 4.5;
    },
    posture: function (r) { return r <= -0.4 ? 'agg' : r >= 0.4 ? 'def' : 'mid'; }
  };
  if (typeof window === 'undefined') { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;
  var t = V.texts({
    es: {
      amp: 'Qué tan exagerado es el humor', ampHint: 'Cuánto puede alejarse el precio del valor en un extremo.',
      reroll: 'Otros 20 años', eup: 'Comprando solo con euforia', fear: 'Comprando solo con miedo', all: 'Comprando todos los meses',
      prem: '{x} vs. el valor', none: 'nunca pasó',
      chartP: 'Precio y valor en 20 años simulados', xP: 'años', yP: 'precio',
      chartH: 'El humor de la gente: del pánico a la euforia', yH: 'humor',
      lgP: 'precio', lgV: 'valor (crece 5% por año)', lgH: 'humor', eupL: 'euforia', panL: 'pánico',
      cap: 'Simulación: el valor crece parejo y el precio es el valor multiplicado por el humor de la gente. Quien compró solo en los meses de euforia pagó en promedio {e} respecto del valor; quien compró solo con miedo pagó {f}. Ojo: en la vida real nadie ve esta curva completa mientras pasa.',
      q1: '¿Cuánto optimismo hay?', q1h: '1 = nadie quiere oír hablar de invertir. 10 = todos hablan de lo que ganaron.',
      q2: '¿Cuánto miedo a perder tiene la gente?', q2h: '1 = nadie piensa en perder. 10 = todos se quieren ir.',
      q3: '¿Qué tan fácil es conseguir plata prestada?', q3h: '1 = nadie presta. 10 = te ofrecen crédito sin preguntar.',
      read: 'Dónde está el péndulo', post: 'Lo que sugiere Marks',
      agg: 'Más agresivo: el miedo suele esconder precios bajos', mid: 'Normal: seguí tu plan', def: 'Más defensivo: el entusiasmo suele esconder riesgo',
      panic: 'pánico', euph: 'euforia', middle: 'equilibrio',
      capQ: 'Esto es una lectura, no una predicción. Marks no dice "vendé todo" ni "comprá todo": dice que ajustes un poco cuánto riesgo tomás según dónde está el péndulo, sin abandonar tu plan.',
      gauge: 'Péndulo con la lectura de las tres preguntas'
    },
    en: {
      amp: 'How extreme the mood gets', ampHint: 'How far price can stray from value at an extreme.',
      reroll: 'Another 20 years', eup: 'Buying only in euphoria', fear: 'Buying only in fear', all: 'Buying every month',
      prem: '{x} vs. value', none: 'never happened',
      chartP: 'Price and value over 20 simulated years', xP: 'years', yP: 'price',
      chartH: 'The crowd\'s mood: from panic to euphoria', yH: 'mood',
      lgP: 'price', lgV: 'value (grows 5% a year)', lgH: 'mood', eupL: 'euphoria', panL: 'panic',
      cap: 'Simulation: value grows steadily and price is value multiplied by the crowd\'s mood. Whoever bought only in euphoric months paid on average {e} relative to value; whoever bought only in fear paid {f}. Careful: in real life nobody sees this whole curve while it happens.',
      q1: 'How much optimism is there?', q1h: '1 = nobody wants to hear about investing. 10 = everyone talks about what they made.',
      q2: 'How afraid of losing are people?', q2h: '1 = nobody thinks about losing. 10 = everyone wants out.',
      q3: 'How easy is it to borrow money?', q3h: '1 = nobody lends. 10 = credit offered without questions.',
      read: 'Where the pendulum is', post: 'What Marks suggests',
      agg: 'More aggressive: fear tends to hide low prices', mid: 'Normal: follow your plan', def: 'More defensive: excitement tends to hide risk',
      panic: 'panic', euph: 'euphoria', middle: 'balance',
      capQ: 'This is a reading, not a forecast. Marks does not say "sell everything" or "buy everything": he says to adjust a little how much risk you take depending on where the pendulum is, without abandoning your plan.',
      gauge: 'Pendulum showing the reading of the three questions'
    },
    pt: {
      amp: 'Quão exagerado fica o humor', ampHint: 'Quanto o preço pode se afastar do valor num extremo.',
      reroll: 'Outros 20 anos', eup: 'Comprando só na euforia', fear: 'Comprando só com medo', all: 'Comprando todo mês',
      prem: '{x} vs. o valor', none: 'nunca aconteceu',
      chartP: 'Preço e valor em 20 anos simulados', xP: 'anos', yP: 'preço',
      chartH: 'O humor das pessoas: do pânico à euforia', yH: 'humor',
      lgP: 'preço', lgV: 'valor (cresce 5% ao ano)', lgH: 'humor', eupL: 'euforia', panL: 'pânico',
      cap: 'Simulação: o valor cresce de forma constante e o preço é o valor multiplicado pelo humor das pessoas. Quem comprou só nos meses de euforia pagou em média {e} em relação ao valor; quem comprou só com medo pagou {f}. Atenção: na vida real ninguém vê essa curva inteira enquanto ela acontece.',
      q1: 'Quanto otimismo existe?', q1h: '1 = ninguém quer ouvir falar de investir. 10 = todo mundo fala do que ganhou.',
      q2: 'Quanto medo de perder as pessoas têm?', q2h: '1 = ninguém pensa em perder. 10 = todo mundo quer sair.',
      q3: 'Quão fácil é conseguir dinheiro emprestado?', q3h: '1 = ninguém empresta. 10 = oferecem crédito sem perguntar.',
      read: 'Onde está o pêndulo', post: 'O que Marks sugere',
      agg: 'Mais agressivo: o medo costuma esconder preços baixos', mid: 'Normal: siga o seu plano', def: 'Mais defensivo: o entusiasmo costuma esconder risco',
      panic: 'pânico', euph: 'euforia', middle: 'equilíbrio',
      capQ: 'Isto é uma leitura, não uma previsão. Marks não diz "venda tudo" nem "compre tudo": ele diz para ajustar um pouco quanto risco você corre conforme a posição do pêndulo, sem abandonar o seu plano.',
      gauge: 'Pêndulo com a leitura das três perguntas'
    }
  });
  var signPct = function (x) { return (x > 0 ? '+' : '') + fmt.pct(x, 0); };

  // ---------- widget 1: pendulum simulation ----------
  V.mount('pendulum-sim', function (root) {
    var seed = V.param('seed', 5, 1, 1e9), MONTHS = 240, G = 0.05, TH = 0.4;
    var aS = V.slider({ id: 'amp', label: t('amp'), min: 10, max: 60, step: 5, value: 40, format: function (v) { return v + '%'; }, hint: t('ampHint'), onInput: paint });
    var oE = V.readout(t('eup')), oF = V.readout(t('fear')), oA = V.readout(t('all'));
    var pc = V.chart({ width: 640, pad: { l: 72 }, height: 280, xLabel: t('xP'), yLabel: t('yP'), label: t('chartP'), xFmt: fmt.int, yFmt: function (v) { return fmt.money(v, 0); } });
    var hc = V.chart({ width: 640, pad: { l: 72 }, height: 200, xLabel: t('xP'), yLabel: t('yH'), label: t('chartH'), xFmt: fmt.int, yFmt: function (v) { return fmt.num(v, 1); } });
    var cap = V.h('p', { 'class': 'viz-cap' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [aS.el, V.button(t('reroll'), function () { seed = (seed * 48271 + 11) % 2147483647; paint(); })]),
      V.h('div', { 'class': 'viz-outs' }, [oE.el, oF.el, oA.el])
    ]));
    root.appendChild(pc.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('lgP') }, { cls: 'muted', dash: true, label: t('lgV') }]));
    root.appendChild(hc.svg);
    root.appendChild(cap);

    function paint() {
      var amp = aS.get() / 100;
      var mood = M.moodPath(V.rng(seed), MONTHS, 60);
      var mkt = M.market(mood, amp, G);
      var e = M.buyer(mkt, function (m) { return m >= TH; });
      var f = M.buyer(mkt, function (m) { return m <= -TH; });
      var a = M.buyer(mkt, function () { return true; });
      oE.set(e.n ? t('prem', { x: signPct(e.prem) }) : t('none'), e.n ? 'bad' : '');
      oF.set(f.n ? t('prem', { x: signPct(f.prem) }) : t('none'), f.n ? 'good' : '');
      oA.set(t('prem', { x: signPct(a.prem) }));
      pc.draw({
        x: [0, MONTHS / 12], yZero: true,
        series: [
          { pts: mkt.map(function (p) { return [p.t / 12, p.value]; }), cls: 'muted', dash: true, width: 2 },
          { pts: mkt.map(function (p) { return [p.t / 12, p.price]; }), cls: 'a', width: 2.5 }
        ]
      });
      pc.describe(t('chartP'));
      hc.draw({
        x: [0, MONTHS / 12], y: [-1.1, 1.1],
        series: [{ pts: mkt.map(function (p) { return [p.t / 12, p.mood]; }), cls: 'a', width: 2 }],
        hlines: [{ y: TH, label: t('eupL'), cls: 'bad' }, { y: -TH, label: t('panL'), cls: 'muted' }]
      });
      hc.describe(t('chartH'));
      cap.textContent = t('cap', { e: e.n ? signPct(e.prem) : t('none'), f: f.n ? signPct(f.prem) : t('none') });
    }
    paint();
  });

  // ---------- widget 2: three questions ----------
  V.mount('three-questions', function (root) {
    var q1 = V.slider({ id: 'q1', label: t('q1'), min: 1, max: 10, step: 1, value: 7, hint: t('q1h'), onInput: paint });
    var q2 = V.slider({ id: 'q2', label: t('q2'), min: 1, max: 10, step: 1, value: 3, hint: t('q2h'), onInput: paint });
    var q3 = V.slider({ id: 'q3', label: t('q3'), min: 1, max: 10, step: 1, value: 6, hint: t('q3h'), onInput: paint });
    var oR = V.readout(t('read')), oP = V.readout(t('post'));
    var W = 640, H = 260, cx = W / 2, cy = 30, L = 190, MAXA = 55 * Math.PI / 180;
    var svg = V.s('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'viz-svg', role: 'img', 'aria-label': t('gauge') });
    var cap = V.h('p', { 'class': 'viz-cap', text: t('capQ') });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [q1.el, q2.el, q3.el]),
      V.h('div', { 'class': 'viz-outs' }, [oR.el, oP.el, svg])
    ]));
    root.appendChild(cap);

    function pt(a, len) { return [cx + Math.sin(a) * len, cy + Math.cos(a) * len]; }
    function paint() {
      var r = M.reading(q1.get(), q2.get(), q3.get()), ps = M.posture(r);
      oR.set(fmt.num(r * 4.5 + 5.5, 1) + ' / 10', ps === 'def' ? 'bad' : ps === 'agg' ? 'good' : '');
      oP.set(t(ps), ps === 'def' ? 'bad' : ps === 'agg' ? 'good' : '');
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      // arc of possible positions
      var a0 = pt(-MAXA, L), a1 = pt(MAXA, L);
      svg.appendChild(V.s('path', { d: 'M' + a0[0] + ' ' + a0[1] + ' A' + L + ' ' + L + ' 0 0 0 ' + a1[0] + ' ' + a1[1], 'class': 'ln-muted dash' }));
      [[-MAXA, 'panic', 'start'], [0, 'middle', 'middle'], [MAXA, 'euph', 'end']].forEach(function (k) {
        var p = pt(k[0], L + 26);
        svg.appendChild(V.s('text', { x: p[0], y: p[1] + 4, 'class': 'viz-note strong', 'text-anchor': k[2], text: t(k[1]) }));
      });
      // panic (r < 0) swings to the left, euphoria to the right
      var ang = r * MAXA, bob = pt(ang, L);
      svg.appendChild(V.s('line', { x1: cx, y1: cy, x2: bob[0], y2: bob[1], 'class': 'ln-a' }));
      svg.appendChild(V.s('circle', { cx: cx, cy: cy, r: 5, 'class': 'dot-a' }));
      svg.appendChild(V.s('circle', { cx: bob[0], cy: bob[1], r: 16, 'class': ps === 'def' ? 'dot-bad' : 'dot-a' }));
      svg.setAttribute('aria-label', t('gauge') + ': ' + fmt.num(r * 4.5 + 5.5, 1) + ' / 10');
    }
    paint();
  });
})();
