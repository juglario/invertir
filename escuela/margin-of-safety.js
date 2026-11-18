// Widgets for "Precio, valor y margen de seguridad".
//   mos-scenarios: you estimate a value, pay a price, and might be wrong by e%. Three scenarios.
//   mr-market:     a simulated Mr. Market quotes a price around a slowly growing value; you only buy with a margin.
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  var M = {
    // return if the price eventually meets the true value
    scenarioReturn: function (trueValue, price) { return trueValue / price - 1; },
    scenarios: function (estimate, price, err) {
      return {
        low: M.scenarioReturn(estimate * (1 - err), price),
        base: M.scenarioReturn(estimate, price),
        high: M.scenarioReturn(estimate * (1 + err), price),
        margin: 1 - price / estimate,
        maxSafePrice: estimate * (1 - err)
      };
    },
    gauss: function (rand) {
      var u = 0, v = 0;
      while (u === 0) u = rand();
      while (v === 0) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    // value grows g per year; mood is an AR(1) with persistence phi and long-run spread s (in log terms)
    marketPath: function (rand, months, s, g, phi) {
      var e = s * Math.sqrt(1 - phi * phi), x = M.gauss(rand) * s, out = [];
      for (var t = 0; t <= months; t++) {
        if (t > 0) x = phi * x + e * M.gauss(rand);
        var value = 100 * Math.pow(1 + g, t / 12);
        out.push({ t: t, value: value, price: value * Math.exp(x) });
      }
      return out;
    },
    // buy only when price <= value * (1 - margin); compare with buying every month
    buyStats: function (path, margin) {
      var nRule = 0, sumRule = 0, sumAll = 0;
      path.forEach(function (p) {
        var r = p.price / p.value;
        sumAll += r;
        if (r <= 1 - margin) { nRule++; sumRule += r; }
      });
      return {
        months: path.length,
        offers: nRule,
        avgRule: nRule ? sumRule / nRule - 1 : null,   // average premium (negative = discount)
        avgAll: sumAll / path.length - 1
      };
    }
  };
  if (typeof window === 'undefined') { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;
  var t = V.texts({
    es: {
      price: 'Precio que pagás', priceHint: 'Tu estimación del valor es $100.',
      err: 'Cuánto te podés equivocar', errHint: 'El valor real podría estar este porcentaje arriba o abajo.',
      margin: 'Tu margen de seguridad', low: 'Si te equivocaste para mal', base: 'Si acertaste', high: 'Si te quedaste corto',
      chartL: 'Retorno según el precio que pagás, en tres escenarios', xL: 'precio que pagás', yL: 'retorno',
      lgLow: 'el valor real era {v}', lgBase: 'el valor real era $100', lgHigh: 'el valor real era {v}', you: 'vos',
      capMos: 'Pagando {p}, aunque el valor real fuera {lo}, terminarías en {r}. El precio más alto que aguanta tu error es {max}: por debajo de ese número, equivocarte todavía no te hace perder.',
      capMosBad: 'Pagando {p}, si el valor real fuera {lo}, perderías {r}. Para que tu error no te haga perder, tendrías que pagar {max} o menos.',
      mood: 'Qué tan cambiante es el Señor Mercado', moodHint: 'Cuánto se aleja el precio del valor en un año típico.',
      mm: 'Margen que exigís para comprar', mmHint: 'Solo comprás si el precio está este porcentaje debajo del valor.',
      offers: 'Meses en que te hizo una oferta', avgRule: 'Precio promedio, comprando con tu regla', avgAll: 'Precio promedio, comprando todos los meses',
      none: 'ninguno', reroll: 'Otro Señor Mercado', of: '{n} de {m}',
      chartM: 'Precio diario del Señor Mercado alrededor del valor', xM: 'años', yM: 'pesos por acción',
      lgV: 'valor (crece 4% por año)', lgP: 'precio del Señor Mercado', lgT: 'tu precio máximo', lgD: 'meses en que comprarías',
      vsValue: '{x} vs. el valor', capMM: 'Simulación: diez años, un precio por mes, valor que crece 4% por año. Con un margen de {m}, el Señor Mercado te ofreció un precio así en {n} de {tot} meses. Cuanto más margen pedís, mejor precio pagás y menos veces te toca comprar.',
      capMM0: 'Simulación: con un margen de {m}, en estos diez años el Señor Mercado nunca bajó tanto. Pedir mucho margen tiene un costo: a veces no comprás nada.'
    },
    en: {
      price: 'Price you pay', priceHint: 'Your estimate of the value is $100.',
      err: 'How wrong you could be', errHint: 'The real value could be this much higher or lower.',
      margin: 'Your margin of safety', low: 'If you were wrong on the bad side', base: 'If you were right', high: 'If you were too cautious',
      chartL: 'Return by the price you pay, in three scenarios', xL: 'price you pay', yL: 'return',
      lgLow: 'real value was {v}', lgBase: 'real value was $100', lgHigh: 'real value was {v}', you: 'you',
      capMos: 'Paying {p}, even if the real value were {lo}, you would end at {r}. The highest price your error can absorb is {max}: below it, being wrong still does not make you lose.',
      capMosBad: 'Paying {p}, if the real value were {lo}, you would lose {r}. For your error not to cost you, you would need to pay {max} or less.',
      mood: 'How moody Mr. Market is', moodHint: 'How far price drifts from value in a typical year.',
      mm: 'Margin you demand before buying', mmHint: 'You only buy if the price is this far below value.',
      offers: 'Months he made you an offer', avgRule: 'Average price, buying with your rule', avgAll: 'Average price, buying every month',
      none: 'none', reroll: 'Another Mr. Market', of: '{n} of {m}',
      chartM: 'Mr. Market\'s price around the value', xM: 'years', yM: 'dollars per share',
      lgV: 'value (grows 4% a year)', lgP: 'Mr. Market\'s price', lgT: 'your top price', lgD: 'months you would buy',
      vsValue: '{x} vs. value', capMM: 'Simulation: ten years, one price a month, value growing 4% a year. With a {m} margin, Mr. Market offered a price like that in {n} of {tot} months. The more margin you ask for, the better the price and the fewer chances you get.',
      capMM0: 'Simulation: with a {m} margin, Mr. Market never dropped that low in these ten years. Demanding a big margin has a cost: sometimes you buy nothing.'
    },
    pt: {
      price: 'Preço que você paga', priceHint: 'Sua estimativa do valor é $100.',
      err: 'Quanto você pode errar', errHint: 'O valor real pode estar essa porcentagem acima ou abaixo.',
      margin: 'Sua margem de segurança', low: 'Se você errou para pior', base: 'Se você acertou', high: 'Se você foi cauteloso demais',
      chartL: 'Retorno conforme o preço pago, em três cenários', xL: 'preço que você paga', yL: 'retorno',
      lgLow: 'o valor real era {v}', lgBase: 'o valor real era $100', lgHigh: 'o valor real era {v}', you: 'você',
      capMos: 'Pagando {p}, mesmo que o valor real fosse {lo}, você terminaria em {r}. O preço mais alto que o seu erro aguenta é {max}: abaixo dele, errar ainda não faz você perder.',
      capMosBad: 'Pagando {p}, se o valor real fosse {lo}, você perderia {r}. Para o seu erro não custar caro, você teria que pagar {max} ou menos.',
      mood: 'Quão instável é o Senhor Mercado', moodHint: 'Quanto o preço se afasta do valor em um ano típico.',
      mm: 'Margem que você exige para comprar', mmHint: 'Você só compra se o preço estiver essa porcentagem abaixo do valor.',
      offers: 'Meses em que ele fez uma oferta', avgRule: 'Preço médio, comprando com a sua regra', avgAll: 'Preço médio, comprando todo mês',
      none: 'nenhum', reroll: 'Outro Senhor Mercado', of: '{n} de {m}',
      chartM: 'Preço do Senhor Mercado em volta do valor', xM: 'anos', yM: 'reais por ação',
      lgV: 'valor (cresce 4% ao ano)', lgP: 'preço do Senhor Mercado', lgT: 'seu preço máximo', lgD: 'meses em que você compraria',
      vsValue: '{x} vs. o valor', capMM: 'Simulação: dez anos, um preço por mês, valor que cresce 4% ao ano. Com uma margem de {m}, o Senhor Mercado ofereceu um preço assim em {n} de {tot} meses. Quanto mais margem você pede, melhor o preço e menos vezes você compra.',
      capMM0: 'Simulação: com uma margem de {m}, nestes dez anos o Senhor Mercado nunca caiu tanto. Pedir muita margem tem um custo: às vezes você não compra nada.'
    }
  });
  var signPct = function (x, d) { return (x > 0 ? '+' : '') + fmt.pct(x, d === undefined ? 0 : d); };
  var money = function (n) { return fmt.money(n, 0); };

  // ---------- widget 1: scenarios ----------
  V.mount('mos-scenarios', function (root) {
    var E = 100;
    var pS = V.slider({ id: 'price', label: t('price'), min: 40, max: 130, step: 1, value: 60, format: money, hint: t('priceHint'), onInput: paint });
    var eS = V.slider({ id: 'err', label: t('err'), min: 0, max: 50, step: 1, value: 25, format: function (v) { return v + '%'; }, hint: t('errHint'), onInput: paint });
    var oM = V.readout(t('margin')), oL = V.readout(t('low')), oB = V.readout(t('base')), oH = V.readout(t('high'));
    var chart = V.chart({ width: 640, pad: { l: 72 }, height: 300, xLabel: t('xL'), yLabel: t('yL'), label: t('chartL'), xFmt: money, yFmt: function (v) { return signPct(v); } });
    var lg = V.h('div');
    var cap = V.h('p', { 'class': 'viz-cap' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [pS.el, eS.el]),
      V.h('div', { 'class': 'viz-outs' }, [oM.el, oL.el, oB.el, oH.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(lg);
    root.appendChild(cap);

    function paint() {
      var P = pS.get(), e = eS.get() / 100, sc = M.scenarios(E, P, e);
      oM.set(signPct(sc.margin), sc.margin > 0 ? 'good' : 'bad');
      oL.set(signPct(sc.low), sc.low < 0 ? 'bad' : 'good');
      oB.set(signPct(sc.base), sc.base < 0 ? 'bad' : '');
      oH.set(signPct(sc.high), sc.high < 0 ? 'bad' : '');
      var lo = [], ba = [], hi = [];
      for (var x = 40; x <= 130; x += 2) {
        lo.push([x, M.scenarioReturn(E * (1 - e), x)]);
        ba.push([x, M.scenarioReturn(E, x)]);
        hi.push([x, M.scenarioReturn(E * (1 + e), x)]);
      }
      chart.draw({
        x: [40, 130], y: [-0.7, 2],
        series: [{ pts: hi, cls: 'muted', dash: true }, { pts: ba, cls: 'a' }, { pts: lo, cls: 'bad' }],
        vlines: [{ x: P, label: t('you'), cls: 'muted' }],
        marks: [{ x: P, y: sc.low, cls: 'bad' }, { x: P, y: sc.base, cls: 'a' }]
      });
      lg.replaceChildren(V.legend([
        { cls: 'bad', label: t('lgLow', { v: money(E * (1 - e)) }) },
        { cls: 'a', label: t('lgBase') },
        { cls: 'muted', dash: true, label: t('lgHigh', { v: money(E * (1 + e)) }) }
      ]));
      cap.textContent = t(sc.low >= 0 ? 'capMos' : 'capMosBad', { p: money(P), lo: money(E * (1 - e)), r: sc.low >= 0 ? signPct(sc.low) : fmt.pct(-sc.low, 0), max: money(sc.maxSafePrice) });
      chart.describe(t('chartL'));
    }
    paint();
  });

  // ---------- widget 2: Mr. Market ----------
  V.mount('mr-market', function (root) {
    var seed = V.param('seed', 7, 1, 1e9), MONTHS = 120, G = 0.04, PHI = 0.93;
    var sS = V.slider({ id: 'mood', label: t('mood'), min: 5, max: 40, step: 1, value: 25, format: function (v) { return v + '%'; }, hint: t('moodHint'), onInput: paint });
    var mS = V.slider({ id: 'mm', label: t('mm'), min: 0, max: 40, step: 1, value: 15, format: function (v) { return v + '%'; }, hint: t('mmHint'), onInput: paint });
    var oO = V.readout(t('offers')), oR = V.readout(t('avgRule')), oA = V.readout(t('avgAll'));
    var chart = V.chart({ width: 640, pad: { l: 72 }, height: 320, xLabel: t('xM'), yLabel: t('yM'), label: t('chartM'), xFmt: fmt.int, yFmt: money });
    var cap = V.h('p', { 'class': 'viz-cap' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [sS.el, mS.el, V.button(t('reroll'), function () { seed = (seed * 48271 + 11) % 2147483647; paint(); })]),
      V.h('div', { 'class': 'viz-outs' }, [oO.el, oR.el, oA.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([
      { cls: 'muted', label: t('lgV') }, { cls: 'a', label: t('lgP') }, { cls: 'bad', dash: true, label: t('lgT') }
    ]));
    root.appendChild(cap);

    function paint() {
      var s = sS.get() / 100, m = mS.get() / 100;
      var path = M.marketPath(V.rng(seed), MONTHS, s, G, PHI);
      var st = M.buyStats(path, m);
      oO.set(t('of', { n: st.offers, m: st.months }), st.offers ? '' : 'bad');
      oR.set(st.avgRule === null ? t('none') : t('vsValue', { x: signPct(st.avgRule) }), st.avgRule === null ? 'bad' : 'good');
      oA.set(t('vsValue', { x: signPct(st.avgAll) }));
      var hiP = 0;
      path.forEach(function (p) { hiP = Math.max(hiP, p.price); });
      chart.draw({
        x: [0, MONTHS / 12], y: [0, Math.max(200, Math.ceil(hiP / 50) * 50)],
        series: [
          { pts: path.map(function (p) { return [p.t / 12, p.value]; }), cls: 'muted', width: 2.5 },
          { pts: path.map(function (p) { return [p.t / 12, p.value * (1 - m)]; }), cls: 'bad', dash: true, width: 1.5 },
          { pts: path.map(function (p) { return [p.t / 12, p.price]; }), cls: 'a', width: 2 }
        ]
      });
      path.forEach(function (p) {   // small dots on the months you would buy
        if (p.price <= p.value * (1 - m)) chart.svg.appendChild(V.s('circle', { cx: chart.sx(p.t / 12), cy: chart.sy(p.price), r: 3, 'class': 'dot-a' }));
      });
      cap.textContent = st.offers ? t('capMM', { m: fmt.pct(m, 0), n: st.offers, tot: st.months }) : t('capMM0', { m: fmt.pct(m, 0) });
      chart.describe(t('chartM'));
    }
    paint();
  });
})();
