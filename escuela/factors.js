// Widgets for "Los factores" (es, en, pt).
// factor-odds:    chance that a factor with yearly premium p and tracking volatility v
//                 trails the market over N years (normal approximation, computed).
// factor-drought: one simulated 30-year history of the factor against the market
//                 (seeded random draws, re-roll button), with its longest drought marked.
(function () {
  'use strict';

  // ---------- pure math (checked with node) ----------
  function normCdf(z) {   // Abramowitz and Stegun 7.1.26, error below 1.5e-7
    var s = z < 0 ? -1 : 1, x = Math.abs(z) / Math.SQRT2;
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + s * y);
  }
  // average yearly excess over n years ~ Normal(p, v / sqrt(n)); chance it is below zero
  function probTrail(p, v, n) {
    if (v <= 0) return p < 0 ? 1 : 0;
    return normCdf(-p * Math.sqrt(n) / v);
  }
  // years needed until the chance of trailing falls to q (z of q is negative)
  function yearsTo(p, v, q) {
    if (p <= 0) return Infinity;
    var z = 1.2815516;  // for q = 10%
    if (q !== 0.1) z = invNorm(1 - q);
    return Math.pow(z * v / p, 2);
  }
  function invNorm(u) {   // bisection, good enough for a readout
    var lo = -8, hi = 8;
    for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (normCdf(m) < u) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function gauss(r) {     // Box-Muller from a [0,1) generator
    var u = 1 - r(), w = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w);
  }
  // relative wealth path (factor vs market, start 100) and its longest stretch below a prior peak
  function droughtPath(p, v, years, r) {
    var pts = [[0, 100]], val = 100, peak = 100, peakAt = 0, best = { len: 0, from: 0, to: 0 }, worst = Infinity;
    for (var y = 1; y <= years; y++) {
      var x = p + v * gauss(r);
      x = Math.max(-0.9, x);
      worst = Math.min(worst, x);
      val *= 1 + x;
      pts.push([y, val]);
      if (val >= peak) { peak = val; peakAt = y; }
      else if (y - peakAt > best.len) best = { len: y - peakAt, from: peakAt, to: y };
    }
    return { pts: pts, end: val, drought: best, worst: worst };
  }
  var M = { normCdf: normCdf, probTrail: probTrail, yearsTo: yearsTo, droughtPath: droughtPath, gauss: gauss };
  if (typeof module === 'object' && module.exports) { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  // Stylized assumptions, NOT data: roughly half the long-run averages of the academic
  // long-short portfolios, to allow for the post-publication decay McLean and Pontiff measured.
  var PRESETS = {
    size: { p: 1, v: 11 }, value: { p: 2, v: 12 }, momentum: { p: 4, v: 17 }, quality: { p: 1.5, v: 8 }
  };

  var t = V.texts({
    es: {
      preset: 'Elegí un factor (supuestos ilustrativos)', size: 'Tamaño', value: 'Valor', momentum: 'Momentum', quality: 'Calidad', custom: 'A mano',
      p_label: 'Premio por año contra el mercado', p_hint: 'Cuánto le gana en promedio por año. Un supuesto, no una promesa.',
      v_label: 'Cuánto se desvía del mercado, por año', v_hint: 'La "volatilidad de seguimiento": qué tan distinto le va al factor un año cualquiera.',
      n_label: 'Años que lo mantenés', r_n: 'Chance de quedar atrás del mercado en {n} años', r_1: 'Chance de quedar atrás en un año suelto',
      r_need: 'Años hasta que esa chance baja a 10%', years: ' años', never: 'nunca',
      x: 'años que lo mantenés', y: 'chance de quedar atrás', chart: 'Chance de que el factor quede atrás del mercado según los años',
      curve: 'Chance de quedar atrás', you: '{n} años: {p}',
      cap: 'Cálculo con una aproximación normal: el promedio anual del premio se distribuye alrededor de {p} con un desvío de {v} dividido por la raíz de los años. Los valores de cada factor son supuestos ilustrativos (más o menos la mitad de los promedios históricos de las carteras académicas), no datos ni pronósticos.',
      d_p: 'Premio por año', d_v: 'Desvío por año', reroll: 'Otra historia posible',
      r_end: 'Factor contra mercado a los 30 años', r_dr: 'Racha más larga sin superar su máximo', r_worst: 'Peor año contra el mercado',
      dx: 'años', dy: 'factor contra mercado (inicio = 100)', dchart: 'Una historia simulada de 30 años del factor contra el mercado',
      dpath: 'Factor contra mercado', dmark: 'racha de {n} años', dleg: 'Racha más larga por debajo del máximo', even: 'empate con el mercado',
      dcap: 'Simulación: cada año el factor le gana o le pierde al mercado según una distribución normal con el premio y el desvío elegidos. Es una de muchas historias posibles; tocá el botón para ver otra. La racha marcada es el período más largo en que el factor estuvo por debajo de su mejor marca anterior.',
      desc: 'Premio {p} y desvío {v}: chance de quedar atrás en {n} años, {q}'
    },
    en: {
      preset: 'Pick a factor (illustrative assumptions)', size: 'Size', value: 'Value', momentum: 'Momentum', quality: 'Quality', custom: 'By hand',
      p_label: 'Premium per year over the market', p_hint: 'How much it beats the market on average each year. An assumption, not a promise.',
      v_label: 'How far it strays from the market, per year', v_hint: 'The "tracking volatility": how different the factor does from the market in any given year.',
      n_label: 'Years you hold it', r_n: 'Chance of trailing the market over {n} years', r_1: 'Chance of trailing in a single year',
      r_need: 'Years until that chance drops to 10%', years: ' years', never: 'never',
      x: 'years you hold it', y: 'chance of trailing', chart: 'Chance the factor trails the market, by number of years',
      curve: 'Chance of trailing', you: '{n} years: {p}',
      cap: 'Computed with a normal approximation: the yearly average premium is spread around {p} with a deviation of {v} divided by the square root of the years. Each factor\'s values are illustrative assumptions (roughly half the historical averages of the academic portfolios), not data or forecasts.',
      d_p: 'Premium per year', d_v: 'Deviation per year', reroll: 'Another possible history',
      r_end: 'Factor vs market after 30 years', r_dr: 'Longest stretch without beating its high', r_worst: 'Worst year vs the market',
      dx: 'years', dy: 'factor vs market (start = 100)', dchart: 'One simulated 30-year history of the factor against the market',
      dpath: 'Factor vs market', dmark: '{n}-year drought', dleg: 'Longest stretch below the high', even: 'level with the market',
      dcap: 'Simulation: each year the factor beats or trails the market according to a normal distribution with the chosen premium and deviation. It is one of many possible histories; press the button to see another. The marked stretch is the longest period the factor spent below its previous best.',
      desc: 'Premium {p} and deviation {v}: chance of trailing over {n} years, {q}'
    },
    pt: {
      preset: 'Escolha um fator (suposições ilustrativas)', size: 'Tamanho', value: 'Valor', momentum: 'Momentum', quality: 'Qualidade', custom: 'À mão',
      p_label: 'Prêmio por ano sobre o mercado', p_hint: 'Quanto ganha do mercado em média por ano. Uma suposição, não uma promessa.',
      v_label: 'Quanto se desvia do mercado, por ano', v_hint: 'A "volatilidade de acompanhamento": o quanto o fator se sai diferente do mercado num ano qualquer.',
      n_label: 'Anos que você mantém', r_n: 'Chance de ficar atrás do mercado em {n} anos', r_1: 'Chance de ficar atrás num ano isolado',
      r_need: 'Anos até essa chance cair para 10%', years: ' anos', never: 'nunca',
      x: 'anos que você mantém', y: 'chance de ficar atrás', chart: 'Chance de o fator ficar atrás do mercado conforme os anos',
      curve: 'Chance de ficar atrás', you: '{n} anos: {p}',
      cap: 'Cálculo com uma aproximação normal: a média anual do prêmio se distribui em torno de {p} com um desvio de {v} dividido pela raiz dos anos. Os valores de cada fator são suposições ilustrativas (mais ou menos metade das médias históricas das carteiras acadêmicas), não dados nem previsões.',
      d_p: 'Prêmio por ano', d_v: 'Desvio por ano', reroll: 'Outra história possível',
      r_end: 'Fator contra mercado depois de 30 anos', r_dr: 'Sequência mais longa sem superar seu máximo', r_worst: 'Pior ano contra o mercado',
      dx: 'anos', dy: 'fator contra mercado (início = 100)', dchart: 'Uma história simulada de 30 anos do fator contra o mercado',
      dpath: 'Fator contra mercado', dmark: 'sequência de {n} anos', dleg: 'Sequência mais longa abaixo do máximo', even: 'empate com o mercado',
      dcap: 'Simulação: a cada ano o fator ganha ou perde do mercado segundo uma distribuição normal com o prêmio e o desvio escolhidos. É uma de muitas histórias possíveis; toque no botão para ver outra. A sequência marcada é o período mais longo em que o fator ficou abaixo da sua melhor marca anterior.',
      desc: 'Prêmio {p} e desvio {v}: chance de ficar atrás em {n} anos, {q}'
    }
  });

  function pctTxt(v) { return fmt.num(v, 1) + '%'; }

  V.mount('factor-odds', function (root) {
    var st = { p: 2, v: 12, n: 10 };
    var seg = V.segmented({
      id: 'f', label: t('preset'), value: 'value',
      options: ['size', 'value', 'momentum', 'quality', 'custom'].map(function (k) { return { v: k, label: t(k) }; }),
      onChange: function (k) { if (PRESETS[k]) { st.p = PRESETS[k].p; st.v = PRESETS[k].v; pS.set(st.p); vS.set(st.v); } paint(); }
    });
    var pS = V.slider({ id: 'p', label: t('p_label'), min: 0, max: 6, step: 0.5, value: 2, format: pctTxt, hint: t('p_hint'),
      onInput: function (x) { st.p = x; seg.set('custom'); paint(); } });
    var vS = V.slider({ id: 'v', label: t('v_label'), min: 2, max: 25, step: 1, value: 12, format: pctTxt, hint: t('v_hint'),
      onInput: function (x) { st.v = x; seg.set('custom'); paint(); } });
    var nS = V.slider({ id: 'n', label: t('n_label'), min: 1, max: 30, step: 1, value: 10, format: function (x) { return x + t('years'); },
      onInput: function (x) { st.n = x; paint(); } });
    if (PRESETS[seg.get()] && !window.location.search.match(/s\.(p|v)=/)) { pS.set(PRESETS[seg.get()].p); vS.set(PRESETS[seg.get()].v); }
    st.p = pS.get(); st.v = vS.get(); st.n = nS.get();

    var rN = V.readout(t('r_n', { n: st.n })), r1 = V.readout(t('r_1')), rNeed = V.readout(t('r_need'));
    var chart = V.chart({ width: 640, height: 280, xLabel: t('x'), yLabel: t('y'), label: t('chart'),
      yFmt: function (y) { return fmt.pct(y, 0); }, xFmt: function (x) { return fmt.int(x); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });

    root.appendChild(seg.el);
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [pS.el, vS.el, nS.el]),
      V.h('div', { 'class': 'viz-outs' }, [rN.el, r1.el, rNeed.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('curve') }]));
    root.appendChild(cap);

    function paint() {
      var p = st.p / 100, v = st.v / 100, n = st.n;
      var q = probTrail(p, v, n);
      rN.el.firstChild.textContent = t('r_n', { n: n });
      rN.set(fmt.pct(q, 0), q > 0.25 ? 'bad' : '');
      r1.set(fmt.pct(probTrail(p, v, 1), 0));
      var need = yearsTo(p, v, 0.1);
      rNeed.set(isFinite(need) ? fmt.num(need, 0) + t('years') : t('never'), need > 30 ? 'bad' : '');
      var pts = [];
      for (var k = 1; k <= 30; k++) pts.push([k, probTrail(p, v, k)]);
      chart.draw({ x: [1, 30], y: [0, 0.6], series: [{ pts: pts, cls: 'a', area: true }],
        hlines: [{ y: 0.1, label: '10%', cls: 'muted' }],
        marks: [{ x: n, y: q, label: t('you', { n: n, p: fmt.pct(q, 0) }), cls: 'a' }] });
      cap.textContent = t('cap', { p: pctTxt(st.p), v: pctTxt(st.v) });
      chart.describe(t('desc', { p: pctTxt(st.p), v: pctTxt(st.v), n: n, q: fmt.pct(q, 0) }));
    }
    paint();
  });

  V.mount('factor-drought', function (root) {
    var YEARS = 30, seed = V.param('seed', 7, 1, 1e9);
    var st = { p: 2, v: 12 };
    var pS = V.slider({ id: 'dp', label: t('d_p'), min: 0, max: 6, step: 0.5, value: 2, format: pctTxt, onInput: function (x) { st.p = x; paint(); } });
    var vS = V.slider({ id: 'dv', label: t('d_v'), min: 2, max: 25, step: 1, value: 12, format: pctTxt, onInput: function (x) { st.v = x; paint(); } });
    st.p = pS.get(); st.v = vS.get();
    var btn = V.button(t('reroll'), function () { seed = (seed * 48271 + 11) % 2147483647; paint(); });
    var rEnd = V.readout(t('r_end')), rDr = V.readout(t('r_dr')), rW = V.readout(t('r_worst'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('dx'), yLabel: t('dy'), label: t('dchart'),
      xFmt: function (x) { return fmt.int(x); }, yFmt: function (y) { return fmt.int(y); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });

    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [pS.el, vS.el, btn]),
      V.h('div', { 'class': 'viz-outs' }, [rEnd.el, rDr.el, rW.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('dpath') }, { cls: 'bad', label: t('dleg') }]));
    root.appendChild(cap);

    function paint() {
      var res = droughtPath(st.p / 100, st.v / 100, YEARS, V.rng(seed));
      rEnd.set(fmt.int(res.end), res.end >= 100 ? 'good' : 'bad');
      rDr.set(fmt.int(res.drought.len) + t('years'), res.drought.len >= 8 ? 'bad' : '');
      rW.set(fmt.pct(res.worst, 0), 'bad');
      var dr = res.pts.slice(res.drought.from, res.drought.to + 1);
      chart.draw({ x: [0, YEARS], yZero: false,
        series: [{ pts: res.pts, cls: 'a' }].concat(res.drought.len ? [{ pts: dr, cls: 'bad', width: 4 }] : []),
        hlines: [{ y: 100, label: t('even'), cls: 'muted' }],
        marks: res.drought.len ? [{ x: res.drought.to, y: dr[dr.length - 1][1], label: t('dmark', { n: res.drought.len }), cls: 'bad' }] : [] });
      cap.textContent = t('dcap');
      chart.describe(t('dchart'));
    }
    paint();
  });
})();
