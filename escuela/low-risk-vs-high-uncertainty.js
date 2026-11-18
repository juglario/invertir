// Widgets for "Poco riesgo no es lo mismo que poca incertidumbre" (es, en, pt).
// two-companies: Monte Carlo (seeded, re-roll) of what $100 paid for each of two companies is
//                worth in 5 years. A: lumpy business plus cash, no debt. B: steady business with
//                debt and a small chance of one bad shock. Both start with an expected value near $100.
// marks-band:    Howard Marks' test: the chance that EPS in N years lands within +-50% of your
//                estimate, with the uncertainty as a lognormal spread (computed, no simulation).
(function () {
  'use strict';

  var SHOCK_P = 0.10, SHOCK = 0.40, SIGMA_B = 0.15, N = 4000;

  // ---------- pure math (checked with node) ----------
  function normCdf(z) {   // Abramowitz and Stegun 7.1.26
    var s = z < 0 ? -1 : 1, x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + s * y);
  }
  function gauss(r) { var u = 1 - r(), w = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); }
  // equity worth after 5 years for $100 paid, one draw each
  function drawA(cash, sigmaA, r) {   // cash per $100 paid, the rest is a lumpy business with mean 1
    return cash + (100 - cash) * Math.exp(sigmaA * gauss(r) - sigmaA * sigmaA / 2);
  }
  function drawB(debtShare, r) {      // debtShare = debt / company value, company value has mean 1 (shock included)
    var ev0 = 100 / (1 - debtShare), debt = ev0 - 100;
    var hit = r() < SHOCK_P ? 1 - SHOCK : 1;
    var ev = ev0 * hit / (1 - SHOCK_P * SHOCK) * Math.exp(SIGMA_B * gauss(r) - SIGMA_B * SIGMA_B / 2);
    return Math.max(0, ev - debt);
  }
  function simulate(cash, sigmaA, debtShare, rng, n) {
    var a = [], b = [];
    for (var k = 0; k < n; k++) { a.push(drawA(cash, sigmaA, rng)); b.push(drawB(debtShare, rng)); }
    return { a: stats(a), b: stats(b) };
  }
  function stats(xs) {
    var s = xs.slice().sort(function (p, q) { return p - q; }), n = s.length, mean = 0, loss = 0;
    s.forEach(function (x) { mean += x / n; if (x < 50) loss++; });
    return { sorted: s, mean: mean, pLoss: loss / n, p5: s[Math.floor(n * 0.05)], p95: s[Math.floor(n * 0.95)] };
  }
  function histogram(sorted, lo, hi, step) {
    var bins = [], n = sorted.length;
    for (var x = lo; x < hi; x += step) bins.push([x + step / 2, 0]);
    sorted.forEach(function (v) { var k = Math.min(bins.length - 1, Math.max(0, Math.floor((v - lo) / step))); bins[k][1] += 1 / n; });
    return bins;
  }
  // Marks' band: EPS in T years ~ lognormal around your estimate (as the median), yearly spread s
  function bandProb(s, T) {
    var w = s * Math.sqrt(T);
    if (w <= 0) return 1;
    return normCdf(Math.log(1.5) / w) - normCdf(Math.log(0.5) / w);
  }
  // debt makes the per-share result swing more: simple approximation, spread x (1 + debt / equity)
  function epsSpread(sOp, de) { return sOp * (1 + de); }
  var M = { normCdf: normCdf, drawA: drawA, drawB: drawB, simulate: simulate, histogram: histogram, bandProb: bandProb, epsSpread: epsSpread };
  if (typeof module === 'object' && module.exports) { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  var t = V.texts({
    es: {
      cash: 'Empresa A: caja por cada $100 que pagás', cash_hint: 'Plata en el banco, sin deuda. Es el piso.',
      sa: 'Empresa A: qué tan a los saltos es el negocio', sa_hint: 'Desvío del negocio en 5 años. Alto = muy difícil de predecir.',
      debt: 'Empresa B: deuda, como parte del valor de la empresa', debt_hint: 'El negocio de B es parejo (desvío 15% en 5 años), pero tiene deuda.',
      reroll: 'Otra tanda de futuros', o_mean: 'Valor promedio en 5 años (A / B)', o_loss: 'Chance de terminar con menos de $50 (A / B)', o_p5: 'El 5% de los peores futuros, desde (A / B)',
      x: 'valor en 5 años de los $100 que pagaste', y: 'parte de los futuros', chart: 'Distribución de futuros posibles para las dos empresas',
      la: 'A: a los saltos, con caja y sin deuda', lb: 'B: pareja, con deuda', half: 'perdés la mitad',
      cap: 'Simulación de {n} futuros posibles por empresa, con supuestos: A tiene {c} de caja que no se toca, y el resto es un negocio con un desvío de {s} en 5 años. B tiene un negocio parejo, pero con deuda de {d} de su valor, y una chance de 10% de un año malo que le baja 40% el valor. Las dos arrancan con un valor esperado de unos $100. Lo que cambia es la forma del riesgo: A tiene un piso, B no.',
      sop: 'Qué tan difícil de predecir es el negocio, por año', sop_hint: 'Desvío de la ganancia del negocio. 10% es pareja, 40% es muy a los saltos.',
      de: 'Deuda sobre capital propio', de_hint: 'Cuántos pesos de deuda hay por cada peso de los dueños.', yrs: 'Años hacia adelante',
      o_band: 'Chance de que caiga entre la mitad y 1,5 veces tu número', o_range: 'Rango del 80% de los casos, si estimás $10', o_sp: 'Desvío de la ganancia por acción, por año',
      range: '${lo} a ${hi}', verdict_ok: 'Incertidumbre acotada', verdict_no: 'Estás comprando un cuento',
      mx: 'años', my: 'ganancia por acción', mchart: 'Abanico de la ganancia por acción si hoy estimás $10',
      fan: 'Del 10% más bajo al 10% más alto', med: 'Tu estimación', band: 'La banda de Marks ($5 a $15)',
      mcap: 'Cálculo: la ganancia por acción en {t} años se reparte alrededor de tu estimación con un desvío de {s} por año ({sop} del negocio multiplicado por 1 + {de} de deuda, una aproximación simple). Con eso, la chance de caer entre $5 y $15 es {p}. Marks no fija un número mágico; acá lo marcamos como "acotada" cuando pasa de dos tercios.',
      desc: 'Chance de caer en la banda: {p}'
    },
    en: {
      cash: 'Company A: cash for every $100 you pay', cash_hint: 'Money in the bank, no debt. It is the floor.',
      sa: 'Company A: how lumpy the business is', sa_hint: 'The business\'s spread over 5 years. High = very hard to predict.',
      debt: 'Company B: debt, as a share of the company\'s value', debt_hint: 'B\'s business is steady (15% spread over 5 years), but it has debt.',
      reroll: 'Another batch of futures', o_mean: 'Average value in 5 years (A / B)', o_loss: 'Chance of ending below $50 (A / B)', o_p5: 'The worst 5% of futures, from (A / B)',
      x: 'value in 5 years of the $100 you paid', y: 'share of futures', chart: 'Spread of possible futures for the two companies',
      la: 'A: lumpy, with cash and no debt', lb: 'B: steady, with debt', half: 'you lose half',
      cap: 'Simulation of {n} possible futures per company, with assumptions: A has {c} of cash that stays untouched, and the rest is a business with a {s} spread over 5 years. B has a steady business, but with debt worth {d} of its value, and a 10% chance of one bad year that cuts its value by 40%. Both start with an expected value of about $100. What changes is the shape of the risk: A has a floor, B does not.',
      sop: 'How hard the business is to predict, per year', sop_hint: 'Spread of the business\'s profit. 10% is steady, 40% is very lumpy.',
      de: 'Debt over equity', de_hint: 'How many dollars of debt for every dollar of the owners.', yrs: 'Years ahead',
      o_band: 'Chance it lands between half and 1.5 times your number', o_range: 'Range of 80% of cases, if you estimate $10', o_sp: 'Spread of earnings per share, per year',
      range: '${lo} to ${hi}', verdict_ok: 'Bounded uncertainty', verdict_no: 'You are buying a story',
      mx: 'years', my: 'earnings per share', mchart: 'Fan of earnings per share if you estimate $10 today',
      fan: 'From the lowest 10% to the highest 10%', med: 'Your estimate', band: 'Marks\' band ($5 to $15)',
      mcap: 'The math: earnings per share in {t} years spread around your estimate with a {s} yearly spread ({sop} for the business times 1 + {de} of debt, a simple approximation). With that, the chance of landing between $5 and $15 is {p}. Marks sets no magic number; here we call it "bounded" above two thirds.',
      desc: 'Chance of landing in the band: {p}'
    },
    pt: {
      cash: 'Empresa A: caixa para cada $100 que você paga', cash_hint: 'Dinheiro no banco, sem dívida. É o piso.',
      sa: 'Empresa A: o quanto o negócio oscila', sa_hint: 'Desvio do negócio em 5 anos. Alto = muito difícil de prever.',
      debt: 'Empresa B: dívida, como parte do valor da empresa', debt_hint: 'O negócio de B é estável (desvio de 15% em 5 anos), mas tem dívida.',
      reroll: 'Outro lote de futuros', o_mean: 'Valor médio em 5 anos (A / B)', o_loss: 'Chance de terminar com menos de $50 (A / B)', o_p5: 'Os 5% piores futuros, a partir de (A / B)',
      x: 'valor em 5 anos dos $100 que você pagou', y: 'parte dos futuros', chart: 'Distribuição de futuros possíveis para as duas empresas',
      la: 'A: oscila, com caixa e sem dívida', lb: 'B: estável, com dívida', half: 'você perde a metade',
      cap: 'Simulação de {n} futuros possíveis por empresa, com suposições: A tem {c} de caixa que não é tocado, e o resto é um negócio com desvio de {s} em 5 anos. B tem um negócio estável, mas com dívida de {d} do seu valor, e uma chance de 10% de um ano ruim que corta 40% do valor. As duas começam com valor esperado de uns $100. O que muda é a forma do risco: A tem piso, B não.',
      sop: 'O quanto o negócio é difícil de prever, por ano', sop_hint: 'Desvio do lucro do negócio. 10% é estável, 40% oscila muito.',
      de: 'Dívida sobre capital próprio', de_hint: 'Quantos reais de dívida há para cada real dos donos.', yrs: 'Anos à frente',
      o_band: 'Chance de cair entre metade e 1,5 vez o seu número', o_range: 'Faixa de 80% dos casos, se você estima $10', o_sp: 'Desvio do lucro por ação, por ano',
      range: '${lo} a ${hi}', verdict_ok: 'Incerteza limitada', verdict_no: 'Você está comprando uma história',
      mx: 'anos', my: 'lucro por ação', mchart: 'Leque do lucro por ação se hoje você estima $10',
      fan: 'Dos 10% mais baixos aos 10% mais altos', med: 'Sua estimativa', band: 'A faixa de Marks ($5 a $15)',
      mcap: 'Cálculo: o lucro por ação em {t} anos se distribui em torno da sua estimativa com desvio de {s} por ano ({sop} do negócio vezes 1 + {de} de dívida, uma aproximação simples). Com isso, a chance de cair entre $5 e $15 é {p}. Marks não fixa um número mágico; aqui chamamos de "limitada" quando passa de dois terços.',
      desc: 'Chance de cair na faixa: {p}'
    }
  });

  function p0(v) { return fmt.int(v) + '%'; }
  function money(v) { return '$' + fmt.int(v); }

  V.mount('two-companies', function (root) {
    var st = {}, seed = V.param('seed', 29, 1, 1e9);
    function mk(key, min, max, step, val) {
      var sl = V.slider({ id: key, label: t(key), hint: t(key + '_hint'), min: min, max: max, step: step, value: val,
        format: key === 'cash' ? money : p0, onInput: function (x) { st[key] = x; paint(); } });
      st[key] = sl.get(); return sl;
    }
    var ss = [mk('cash', 0, 60, 5, 35), mk('sa', 10, 80, 5, 50), mk('debt', 0, 80, 5, 60)];
    var btn = V.button(t('reroll'), function () { seed = (seed * 48271 + 3) % 2147483647; paint(); });
    var oM = V.readout(t('o_mean')), oL = V.readout(t('o_loss')), oP = V.readout(t('o_p5'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('x'), yLabel: t('y'), label: t('chart'),
      xFmt: function (x) { return '$' + fmt.int(x); }, yFmt: function (y) { return fmt.pct(y, 0); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, ss.map(function (x) { return x.el; }).concat([btn])),
      V.h('div', { 'class': 'viz-outs' }, [oM.el, oL.el, oP.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('la') }, { cls: 'bad', label: t('lb') }]));
    root.appendChild(cap);

    function paint() {
      var res = simulate(st.cash, st.sa / 100, st.debt / 100, V.rng(seed), N);
      oM.set(money(res.a.mean) + ' / ' + money(res.b.mean));
      oL.set(fmt.pct(res.a.pLoss, 1) + ' / ' + fmt.pct(res.b.pLoss, 1), res.b.pLoss > res.a.pLoss ? 'bad' : '');
      oP.set(money(res.a.p5) + ' / ' + money(res.b.p5));
      var ha = histogram(res.a.sorted, 0, 300, 10), hb = histogram(res.b.sorted, 0, 300, 10);
      var top = Math.max.apply(null, ha.concat(hb).map(function (q) { return q[1]; })) * 1.15;
      chart.draw({ x: [0, 300], y: [0, top], series: [{ pts: ha, cls: 'a', area: true }, { pts: hb, cls: 'bad' }],
        vlines: [{ x: 50, label: t('half'), cls: 'muted' }] });
      cap.textContent = t('cap', { n: fmt.int(N), c: money(st.cash), s: p0(st.sa), d: p0(st.debt) });
      chart.describe(t('chart'));
    }
    paint();
  });

  V.mount('marks-band', function (root) {
    var st = {};
    function mk(key, min, max, step, val, format, hint) {
      var sl = V.slider({ id: key, label: t(key), hint: hint ? t(key + '_hint') : null, min: min, max: max, step: step, value: val, format: format,
        onInput: function (x) { st[key] = x; paint(); } });
      st[key] = sl.get(); return sl;
    }
    var ss = [mk('sop', 5, 60, 1, 15, p0, true), mk('de', 0, 3, 0.25, 0, function (x) { return fmt.num(x, 2) + 'x'; }, true),
      mk('yrs', 1, 10, 1, 5, function (x) { return fmt.int(x); })];
    var oB = V.readout(t('o_band')), oR = V.readout(t('o_range')), oS = V.readout(t('o_sp'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('mx'), yLabel: t('my'), label: t('mchart'),
      xFmt: function (x) { return fmt.int(x); }, yFmt: function (y) { return '$' + fmt.int(y); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, ss.map(function (x) { return x.el; })),
      V.h('div', { 'class': 'viz-outs' }, [oB.el, oR.el, oS.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('fan') }, { cls: 'muted', label: t('med'), dash: true }, { cls: 'bad', label: t('band'), dash: true }]));
    root.appendChild(cap);

    function paint() {
      var s = epsSpread(st.sop / 100, st.de), T = st.yrs, p = bandProb(s, T), Z = 1.2815516;
      var ok = p >= 2 / 3;
      oB.set(fmt.pct(p, 0) + ' · ' + (ok ? t('verdict_ok') : t('verdict_no')), ok ? 'good' : 'bad');
      var lo = 10 * Math.exp(-Z * s * Math.sqrt(T)), hi = 10 * Math.exp(Z * s * Math.sqrt(T));
      oR.set(t('range', { lo: fmt.num(lo, 1), hi: fmt.num(hi, 1) }));
      oS.set(fmt.pct(s, 0));
      var up = [], dn = [], md = [];
      for (var k = 0; k <= T; k += 0.25) {
        up.push([k, 10 * Math.exp(Z * s * Math.sqrt(k))]); dn.push([k, 10 * Math.exp(-Z * s * Math.sqrt(k))]); md.push([k, 10]);
      }
      var top = Math.min(60, Math.max(20, hi * 1.1));
      chart.draw({ x: [0, T], y: [0, top],
        series: [{ pts: up.map(function (q) { return [q[0], Math.min(q[1], top)]; }), cls: 'a', area: true, base: 10 }, { pts: dn, cls: 'a', area: true, base: 10 }, { pts: md, cls: 'muted', dash: true }],
        hlines: [{ y: 15, label: '$15', cls: 'bad' }, { y: 5, label: '$5', cls: 'bad' }] });
      cap.textContent = t('mcap', { t: T, s: fmt.pct(s, 0), sop: p0(st.sop), de: fmt.num(st.de, 2) + 'x', p: fmt.pct(p, 0) });
      chart.describe(t('desc', { p: fmt.pct(p, 0) }));
    }
    paint();
  });
})();
