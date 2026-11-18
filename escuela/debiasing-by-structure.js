// Widgets for "Reglas, no fuerza de voluntad" (debiasing by structure).
//   tres-reflejos: a seeded, simulated market path with a crash. Three people start with
//                  the same 70/30 mix: one does nothing, one panic-sells and buys back later,
//                  one rebalances to 70/30 once a year by rule. Plus a 500-path tally.
//   premortem:     a pre-mortem and checklist builder that only lives on the page.
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  var MONTHS = 120, W_STOCK = 0.7, SAFE = 0.002, MU = 0.007, SD = 0.045;

  function mulberry(seed) {   // same generator as IDC.viz.rng, so node and browser agree
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
    };
  }
  // Monthly stock returns: normal(MU, SD) via Box-Muller, plus one crash injected over
  // 1 to 3 months somewhere in years 2 to 4, deep enough to take 25% to 40% off on its own.
  function path(seed) {
    var r = mulberry(seed), out = [];
    var m0 = 12 + Math.floor(r() * 36), k = 1 + Math.floor(r() * 3), depth = 0.25 + r() * 0.15;
    var f = Math.pow(1 - depth, 1 / k);
    for (var i = 0; i < MONTHS; i++) {
      var u = Math.max(1e-12, r()), v = r();
      var z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      var g = (1 + MU + SD * z) * (i >= m0 && i < m0 + k ? f : 1);
      out.push(Math.max(0.05, g) - 1);
    }
    return { rets: out, crashStart: m0, crashLen: k };
  }
  // Runs the three behaviours on one path. trig: fall from peak that triggers the panic
  // sale (0..1). reentry: rise from the lowest point after selling that brings them back.
  function simulate(rets, trig, reentry) {
    var idx = 1, peak = 1;
    var hold = { s: 100 * W_STOCK, c: 100 * (1 - W_STOCK) };
    var reb = { s: hold.s, c: hold.c };
    var pan = { s: hold.s, c: hold.c, out: false, low: 0, monthsOut: 0, sells: 0 };
    var series = { idx: [[0, 100]], hold: [[0, 100]], panic: [[0, 100]], reb: [[0, 100]] }, events = [];
    for (var i = 0; i < rets.length; i++) {
      var g = 1 + rets[i];
      idx *= g;
      hold.s *= g; hold.c *= 1 + SAFE;
      reb.s *= g; reb.c *= 1 + SAFE;
      pan.s *= g; pan.c *= 1 + SAFE;
      var m = i + 1;
      if ((m % 12) === 0) { var tr = reb.s + reb.c; reb.s = tr * W_STOCK; reb.c = tr - reb.s; }
      if (!pan.out) {
        peak = Math.max(peak, idx);
        if (idx <= peak * (1 - trig)) {
          pan.c += pan.s; pan.s = 0; pan.out = true; pan.low = idx; pan.sells++;
          events.push({ m: m, type: 'sell' });
        }
      } else {
        pan.monthsOut++;
        pan.low = Math.min(pan.low, idx);
        if (idx >= pan.low * (1 + reentry)) {
          var tp = pan.c; pan.s = tp * W_STOCK; pan.c = tp - pan.s; pan.out = false; peak = idx;
          events.push({ m: m, type: 'buy' });
        }
      }
      series.idx.push([m, idx * 100]);
      series.hold.push([m, hold.s + hold.c]);
      series.panic.push([m, pan.s + pan.c]);
      series.reb.push([m, reb.s + reb.c]);
    }
    return { hold: hold.s + hold.c, panic: pan.s + pan.c, reb: reb.s + reb.c, monthsOut: pan.monthsOut, sells: pan.sells, series: series, events: events };
  }
  // Tally over n seeds: how often panic ends below doing nothing, and rebalance above it.
  function tally(n, trig, reentry, base) {
    var worse = 0, rebBetter = 0, far = 0, diffs = [];
    for (var i = 0; i < n; i++) {
      var r = simulate(path((base || 1000) + i).rets, trig, reentry);
      if (r.panic < r.hold) worse++;
      if (r.reb > r.hold) rebBetter++;
      if (Math.abs(r.panic / r.hold - 1) > 0.1) far++;
      diffs.push(r.panic / r.hold - 1);
    }
    diffs.sort(function (a, b) { return a - b; });
    return { panicWorse: worse / n, rebBetter: rebBetter / n, far: far / n, medianPanicVsHold: diffs[Math.floor(n / 2)] };
  }

  // Pre-mortem verdict. o = {state: 'calm'|'rush'|'fear'|'euphoria'|'anger', reversible, written,
  // advocate, tomorrow (booleans or null), reasons (count of filled failure reasons)}
  function premortemVerdict(o) {
    var flags = [];
    if (o.state && o.state !== 'calm') flags.push('state');
    if (o.reasons < 3) flags.push('reasons');
    if (o.written === false) flags.push('written');
    if (o.advocate === false) flags.push('advocate');
    if (o.tomorrow === false) flags.push('tomorrow');
    var level = 'go';
    if (flags.length) level = 'wait';
    if (o.reversible === false && flags.length) level = 'stop';
    return { level: level, flags: flags };
  }

  var API = { path: path, simulate: simulate, tally: tally, premortemVerdict: premortemVerdict, MONTHS: MONTHS };
  if (typeof module === 'object' && module.exports) module.exports = API;

  var V = typeof window !== 'undefined' && window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  var t = V.texts({
    es: {
      trig: 'El que entra en pánico vende cuando el mercado cae, desde su máximo', reentry: 'Y vuelve a comprar cuando subió, desde el piso',
      reroll: 'Otro camino', oHold: 'No hacer nada', oPanic: 'Vender en pánico y volver', oReb: 'Rebalancear por regla una vez por año',
      out: '{v} ({m} meses afuera)', xl: 'meses', yl: 'valor de $100', label: 'Tres reacciones a la misma caída, en un camino simulado',
      lgHold: 'No hacer nada', lgPanic: 'Pánico', lgReb: 'Rebalanceo por regla', crash: 'caída', sold: 'vende', bought: 'vuelve',
      tally: 'En 500 caminos simulados con estas mismas reglas, vender en pánico y volver terminó por debajo de no hacer nada en {a} de los casos y por encima en el resto (en el caso del medio, {b}). En {d} de los caminos la diferencia fue de más de 10% para un lado o para el otro: el pánico no suma ni resta en promedio, suma suerte. Rebalancear terminó por encima de no hacer nada en {c}.',
      noPanic: 'En este camino la caída nunca llegó al punto de pánico que elegiste, así que las dos primeras personas terminan igual.',
      sim: 'Simulación, no datos reales. Supuestos: empiezan con $100, 70% en acciones y 30% en algo seguro que rinde 0,2% por mes. Las acciones suben en promedio 0,7% por mes con sacudidas al azar, y en algún momento entre el año 2 y el 4 hay una caída fuerte. Sin costos ni impuestos.'
    },
    en: {
      trig: 'The panicker sells when the market falls, from its peak, by', reentry: 'And buys back after it has risen, from the bottom, by',
      reroll: 'Another path', oHold: 'Do nothing', oPanic: 'Panic-sell and come back', oReb: 'Rebalance by rule once a year',
      out: '{v} ({m} months out)', xl: 'months', yl: 'value of $100', label: 'Three reactions to the same fall, on a simulated path',
      lgHold: 'Do nothing', lgPanic: 'Panic', lgReb: 'Rebalance by rule', crash: 'crash', sold: 'sells', bought: 'back in',
      tally: 'Across 500 simulated paths with these same rules, panic-selling and coming back ended below doing nothing in {a} of cases and above it in the rest (in the middle case, {b}). In {d} of the paths the gap was more than 10% one way or the other: on average panic neither adds nor subtracts, it adds luck. Rebalancing ended above doing nothing in {c}.',
      noPanic: 'On this path the fall never reached the panic point you chose, so the first two people end the same.',
      sim: 'Simulation, not real data. Assumptions: they start with $100, 70% in stocks and 30% in something safe earning 0.2% a month. Stocks rise 0.7% a month on average with random swings, and at some point between years 2 and 4 there is a sharp fall. No costs or taxes.'
    },
    pt: {
      trig: 'Quem entra em pânico vende quando o mercado cai, desde o pico', reentry: 'E volta a comprar quando subiu, desde o fundo',
      reroll: 'Outro caminho', oHold: 'Não fazer nada', oPanic: 'Vender em pânico e voltar', oReb: 'Rebalancear por regra uma vez por ano',
      out: '{v} ({m} meses fora)', xl: 'meses', yl: 'valor de $100', label: 'Três reações à mesma queda, em um caminho simulado',
      lgHold: 'Não fazer nada', lgPanic: 'Pânico', lgReb: 'Rebalanceamento por regra', crash: 'queda', sold: 'vende', bought: 'volta',
      tally: 'Em 500 caminhos simulados com essas mesmas regras, vender em pânico e voltar terminou abaixo de não fazer nada em {a} dos casos e acima no resto (no caso do meio, {b}). Em {d} dos caminhos a diferença foi de mais de 10% para um lado ou para o outro: em média o pânico não soma nem tira, soma sorte. Rebalancear terminou acima de não fazer nada em {c}.',
      noPanic: 'Neste caminho a queda nunca chegou ao ponto de pânico que você escolheu, então as duas primeiras pessoas terminam iguais.',
      sim: 'Simulação, não dados reais. Premissas: começam com $100, 70% em ações e 30% em algo seguro que rende 0,2% ao mês. As ações sobem em média 0,7% ao mês com sacudidas aleatórias, e em algum momento entre o ano 2 e o 4 há uma queda forte. Sem custos nem impostos.'
    }
  });

  V.mount('tres-reflejos', function (root) {
    var st = { seed: V.param('seed', 7, 1, 1e9) };
    var pf = function (v) { return v + '%'; };
    var trS = V.slider({ id: 'trig', label: t('trig'), min: 10, max: 40, step: 1, value: 20, format: pf, onInput: function (v) { st.trig = v; paint(true); } });
    var reS = V.slider({ id: 'reentry', label: t('reentry'), min: 5, max: 40, step: 1, value: 15, format: pf, onInput: function (v) { st.reentry = v; paint(true); } });
    st.trig = trS.get(); st.reentry = reS.get();
    var btn = V.button(t('reroll'), function () { st.seed = (st.seed * 48271 + 11) % 2147483647; paint(false); });
    var oH = V.readout(t('oHold')), oP = V.readout(t('oPanic')), oR = V.readout(t('oReb'));
    var chart = V.chart({ width: 640, height: 320, xLabel: t('xl'), yLabel: t('yl'), label: t('label'),
      xFmt: function (v) { return fmt.int(v); }, yFmt: function (v) { return '$' + fmt.int(v); } });
    var cap = V.h('p', { 'class': 'viz-cap' }), tal = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' }), sim = V.h('p', { 'class': 'viz-cap', text: t('sim') });

    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [trS.el, reS.el, btn]),
      V.h('div', { 'class': 'viz-outs' }, [oH.el, oP.el, oR.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('lgHold') }, { cls: 'bad', label: t('lgPanic') }, { cls: 'muted', label: t('lgReb'), dash: true }]));
    root.appendChild(cap);
    root.appendChild(tal);
    root.appendChild(sim);

    var tallyTimer = null;
    function paint(slidersMoved) {
      var p = path(st.seed), r = simulate(p.rets, st.trig / 100, st.reentry / 100);
      var money = function (v) { return '$' + fmt.num(v, 0); };
      oH.set(money(r.hold), '');
      oP.set(t('out', { v: money(r.panic), m: r.monthsOut }), r.panic < r.hold ? 'bad' : 'good');
      oR.set(money(r.reb), r.reb >= r.hold ? 'good' : '');
      var seen = {};
      var marks = r.events.map(function (e) {   // label only the first sale and the first return
        var lab = seen[e.type] ? null : (e.type === 'sell' ? t('sold') : t('bought'));
        seen[e.type] = true;
        return { x: e.m, y: r.series.panic[e.m][1], cls: e.type === 'sell' ? 'bad' : 'a', label: lab };
      }).slice(0, 8);
      chart.draw({ x: [0, MONTHS], yZero: true,
        series: [{ pts: r.series.hold, cls: 'a' }, { pts: r.series.panic, cls: 'bad' }, { pts: r.series.reb, cls: 'muted', dash: true, width: 2.5 }],
        vlines: [{ x: p.crashStart, label: t('crash'), cls: 'muted' }], hlines: [{ y: 100, cls: 'muted' }], marks: marks });
      cap.textContent = r.sells === 0 ? t('noPanic') : '';
      chart.describe(t('label') + ': ' + money(r.hold) + ', ' + money(r.panic) + ', ' + money(r.reb));
      if (tallyTimer) clearTimeout(tallyTimer);
      if (slidersMoved || !tal.textContent) {
        tallyTimer = setTimeout(function () {
          var s = tally(500, st.trig / 100, st.reentry / 100);
          var mid = (s.medianPanicVsHold >= 0 ? '+' : '') + fmt.pct(s.medianPanicVsHold, 1);
          tal.textContent = t('tally', { a: fmt.pct(s.panicWorse, 0), b: mid, c: fmt.pct(s.rebBetter, 0), d: fmt.pct(s.far, 0) });
        }, 120);
      }
    }
    paint(true);
  });

  // ---------- premortem ----------
  var P = V.texts({
    es: {
      local: 'Nada de lo que escribas acá se guarda ni se envía: si recargás la página, se borra. Si te sirve, copialo a mano.',
      dec: 'La decisión', decPh: 'Por ejemplo: vender todo lo que tengo invertido',
      why: 'Pasó un año y la decisión salió horrible. ¿Por qué? Escribí tres razones.', r: 'Razón {n}',
      state: '¿Cómo estás ahora?', calm: 'Tranquilo', rush: 'Apurado', fear: 'Con miedo', euphoria: 'Eufórico', anger: 'Con bronca',
      yes: 'Sí', no: 'No',
      rev: '¿Se puede deshacer sin un costo grande?', wr: '¿Escribiste qué te haría cambiar de opinión?',
      adv: '¿Alguien que no gana nada con esto ya opinó, antes de escuchar tu opinión?', tom: '¿Lo decidirías igual mañana a la mañana?',
      out: 'Lo que dice tu lista', go: 'Adelante, con tu regla escrita. Guardá esta lista para revisarla cuando sepas cómo salió.',
      wait: 'Esperá. Volvé a esta lista en 24 horas y completá lo que falta.',
      stop: 'Todavía no. Es difícil de deshacer y la lista tiene huecos: no la tomes hoy.',
      f_state: 'Estás {s}: las decisiones grandes se toman tranquilo.', f_reasons: 'Faltan razones en la premortem (tenés {n} de 3).',
      f_written: 'No escribiste qué te haría cambiar de opinión.', f_advocate: 'Nadie te llevó la contraria todavía.', f_tomorrow: 'Mañana no lo decidirías igual: eso ya es una respuesta.',
      summary: 'Resumen para copiar'
    },
    en: {
      local: 'Nothing you write here is saved or sent: if you reload the page, it is gone. If it helps, copy it by hand.',
      dec: 'The decision', decPh: 'For example: sell everything I have invested',
      why: 'A year has passed and the decision turned out terribly. Why? Write three reasons.', r: 'Reason {n}',
      state: 'How are you feeling right now?', calm: 'Calm', rush: 'Rushed', fear: 'Afraid', euphoria: 'Euphoric', anger: 'Angry',
      yes: 'Yes', no: 'No',
      rev: 'Can it be undone without a big cost?', wr: 'Did you write down what would change your mind?',
      adv: 'Has someone with nothing to gain already given their view, before hearing yours?', tom: 'Would you decide the same tomorrow morning?',
      out: 'What your list says', go: 'Go ahead, with your written rule. Keep this list to review once you know how it turned out.',
      wait: 'Wait. Come back to this list in 24 hours and fill in what is missing.',
      stop: 'Not yet. It is hard to undo and the list has gaps: do not make it today.',
      f_state: 'You are feeling {s}: big decisions are made calm.', f_reasons: 'The pre-mortem is missing reasons (you have {n} of 3).',
      f_written: 'You did not write what would change your mind.', f_advocate: 'Nobody has argued the other side yet.', f_tomorrow: 'You would not decide the same tomorrow: that is already an answer.',
      summary: 'Summary to copy'
    },
    pt: {
      local: 'Nada do que você escrever aqui é salvo ou enviado: se recarregar a página, some. Se for útil, copie à mão.',
      dec: 'A decisão', decPh: 'Por exemplo: vender tudo o que tenho investido',
      why: 'Passou um ano e a decisão deu muito errado. Por quê? Escreva três motivos.', r: 'Motivo {n}',
      state: 'Como você está agora?', calm: 'Tranquilo', rush: 'Com pressa', fear: 'Com medo', euphoria: 'Eufórico', anger: 'Com raiva',
      yes: 'Sim', no: 'Não',
      rev: 'Dá para desfazer sem um custo grande?', wr: 'Você escreveu o que te faria mudar de opinião?',
      adv: 'Alguém que não ganha nada com isso já opinou, antes de ouvir sua opinião?', tom: 'Você decidiria igual amanhã de manhã?',
      out: 'O que sua lista diz', go: 'Vá em frente, com sua regra escrita. Guarde esta lista para revisar quando souber como deu.',
      wait: 'Espere. Volte a esta lista em 24 horas e complete o que falta.',
      stop: 'Ainda não. É difícil de desfazer e a lista tem buracos: não tome hoje.',
      f_state: 'Você está {s}: decisões grandes se tomam com calma.', f_reasons: 'Faltam motivos na pré-mortem (você tem {n} de 3).',
      f_written: 'Você não escreveu o que te faria mudar de opinião.', f_advocate: 'Ninguém te contrariou ainda.', f_tomorrow: 'Amanhã você não decidiria igual: isso já é uma resposta.',
      summary: 'Resumo para copiar'
    }
  });

  V.mount('premortem', function (root) {
    var box = 'width:100%;box-sizing:border-box;padding:10px 12px;border:2px solid var(--ny-ink);background:transparent;color:inherit;font:inherit;font-size:16px';
    var st = { state: null, rev: null, wr: null, adv: null, tom: null };
    function field(label, ph) {
      var id = 'pm-' + Math.random().toString(36).slice(2, 8);
      var inp = V.h('input', { type: 'text', id: id, placeholder: ph || '', autocomplete: 'off', style: box, oninput: paint });
      return { el: V.h('div', { 'class': 'viz-ctl' }, [V.h('label', { 'for': id, text: label }), inp]), inp: inp };
    }
    var dec = field(P('dec'), P('decPh'));
    var reasons = [1, 2, 3].map(function (n) { return field(P('r', { n: n })); });
    var stateSeg = V.segmented({ label: P('state'), value: null,
      options: ['calm', 'rush', 'fear', 'euphoria', 'anger'].map(function (k) { return { v: k, label: P(k) }; }),
      onChange: function (v) { st.state = v; paint(); } });
    function yn(key) {
      return V.segmented({ label: P(key), value: null, options: [{ v: 'y', label: P('yes') }, { v: 'n', label: P('no') }],
        onChange: function (v) { st[key] = v === 'y'; paint(); } });
    }
    var qs = ['rev', 'wr', 'adv', 'tom'].map(yn);
    var verdictEl = V.h('p', { 'aria-live': 'polite', style: 'font-size:18px;line-height:1.5;margin:6px 0 0;font-weight:600' });
    var flagsEl = V.h('ul', { 'class': 'esc-list', style: 'margin-top:8px' });
    var sumEl = V.h('pre', { style: 'white-space:pre-wrap;font:14px/1.5 ui-monospace,Menlo,monospace;background:var(--ny-surface-2);padding:12px 14px;margin:8px 0 0' });

    root.appendChild(V.h('p', { 'class': 'viz-cap', text: P('local') }));
    root.appendChild(dec.el);
    root.appendChild(V.h('p', { style: 'font-weight:600;margin:6px 0 8px', text: P('why') }));
    reasons.forEach(function (r) { root.appendChild(r.el); });
    root.appendChild(stateSeg.el);
    qs.forEach(function (q) { root.appendChild(q.el); });
    root.appendChild(V.h('div', { 'class': 'viz-out' }, [V.h('span', { text: P('out') })]));
    root.appendChild(verdictEl);
    root.appendChild(flagsEl);
    root.appendChild(V.h('div', { 'class': 'viz-out', style: 'margin-top:12px' }, [V.h('span', { text: P('summary') })]));
    root.appendChild(sumEl);

    function paint() {
      var filled = reasons.filter(function (r) { return r.inp.value.trim().length > 0; });
      var v = premortemVerdict({ state: st.state, reversible: st.rev, written: st.wr, advocate: st.adv, tomorrow: st.tom, reasons: filled.length });
      verdictEl.textContent = P(v.level);
      verdictEl.style.color = v.level === 'go' ? 'var(--ny-green)' : 'var(--ny-bad)';
      while (flagsEl.firstChild) flagsEl.removeChild(flagsEl.firstChild);
      v.flags.forEach(function (f) {
        flagsEl.appendChild(V.h('li', { text: P('f_' + f, { s: st.state ? P(st.state).toLowerCase() : '', n: filled.length }) }));
      });
      var mark = function (b) { return b === null ? '?' : (b ? P('yes') : P('no')); };
      var lines = [P('dec') + ': ' + (dec.inp.value.trim() || '...')];
      reasons.forEach(function (r, i) { lines.push(P('r', { n: i + 1 }) + ': ' + (r.inp.value.trim() || '...')); });
      lines.push(P('state') + ' ' + (st.state ? P(st.state) : '?'));
      ['rev', 'wr', 'adv', 'tom'].forEach(function (k) { lines.push(P(k) + ' ' + mark(st[k])); });
      lines.push('', P(v.level));
      sumEl.textContent = lines.join('\n');
    }
    paint();
  });
})();
