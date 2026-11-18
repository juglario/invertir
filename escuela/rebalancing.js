// Widgets for "Rebalancear con bandas".
//   rebal-drift: a 60/40 recipe over simulated years. Never rebalance, once a year, 5-point band, 10-point band.
//                Same simulated market for the four rules, so the only difference is the rule.
//   rebal-flow:  rebalancing with new money only: how to split a contribution so nothing has to be sold.
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
    // monthly returns for stocks and bonds (independent, lognormal), from yearly mean and volatility
    returns: function (rand, months, sMu, sVol, bMu, bVol) {
      var out = [];
      function one(mu, vol) {
        var m = Math.log(1 + mu) / 12, s = vol / Math.sqrt(12);
        return Math.exp(m - s * s / 2 + s * M.gauss(rand)) - 1;
      }
      for (var i = 0; i < months; i++) out.push([one(sMu, sVol), one(bMu, bVol)]);
      return out;
    },
    // rule: 'none' | 'year' | 'b5' | 'b10'. Bands are checked once a month.
    run: function (rets, target, rule) {
      var S = 100 * target, B = 100 * (1 - target), trades = 0, peak = 100, dd = 0, maxW = target, w = [[0, target]];
      for (var i = 0; i < rets.length; i++) {
        S *= 1 + rets[i][0]; B *= 1 + rets[i][1];
        var tot = S + B, ws = S / tot, m = i + 1;
        maxW = Math.max(maxW, ws);
        var go = (rule === 'year' && m % 12 === 0) ||
                 (rule === 'b5' && Math.abs(ws - target) > 0.05) ||
                 (rule === 'b10' && Math.abs(ws - target) > 0.10);
        if (go) { S = tot * target; B = tot * (1 - target); trades++; ws = target; }
        peak = Math.max(peak, tot); dd = Math.max(dd, 1 - tot / peak);
        w.push([m / 12, ws]);
      }
      return { final: S + B, weight: S / (S + B), trades: trades, maxDD: dd, maxW: maxW, path: w };
    },
    // split a contribution c so the result is as close as possible to `target` share in stocks, without selling
    split: function (s, b, target, c) {
      var want = target * (s + b + c) - s;
      var toS = Math.max(0, Math.min(c, want));
      return { toS: toS, toB: c - toS, s: s + toS, b: b + c - toS, w: (s + toS) / (s + b + c) };
    }
  };
  if (typeof window === 'undefined') { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;
  var t = V.texts({
    es: {
      years: 'Años', yearsHint: 'Cuánto tiempo dejás correr la receta.',
      ret: 'Rendimiento esperado de las acciones, por año', retHint: 'Supuesto. Los bonos: 3% por año.',
      rule: 'Regla', none: 'Nunca', year: 'Una vez por año', b5: 'Banda de 5 puntos', b10: 'Banda de 10 puntos',
      fin: 'Peso de las acciones al final', trades: 'Veces que rebalanceaste', maxw: 'Peso máximo que llegaron a tener las acciones', dd: 'Peor caída del total',
      reroll: 'Otro mercado simulado',
      chart: 'Peso de las acciones en una receta 60/40', xL: 'años', yL: 'acciones, % del total',
      lgRule: 'con la regla elegida', lgNone: 'sin rebalancear nunca', target: 'objetivo 60%',
      cap: 'Simulación: acciones con el rendimiento elegido y una volatilidad de 16% por año, bonos con 3% y 5% de volatilidad, sin relación entre los dos y sin costos ni impuestos. El mismo mercado para las cuatro reglas. Sin rebalancear, la receta se va corriendo hacia lo que más sube, y con eso cambia el riesgo que estás tomando sin que lo hayas decidido.',
      s: 'Lo que tenés en acciones', b: 'Lo que tenés en bonos', tg: 'Tu receta: % en acciones', c: 'Aporte nuevo',
      toS: 'Del aporte, a acciones', toB: 'Del aporte, a bonos', after: 'Cómo queda', left: 'Falta para el objetivo',
      before: 'antes', afterL: 'después', stocks: 'acciones', bonds: 'bonos', done: 'llegaste',
      capF: 'La cuenta: el total nuevo por el porcentaje objetivo da cuánto tendrías que tener en acciones; el aporte va primero a cubrir esa diferencia y el resto a bonos. No vendés nada, así que no pagás comisiones de venta ni impuestos por vender.',
      bar: 'Barras con el reparto antes y después del aporte'
    },
    en: {
      years: 'Years', yearsHint: 'How long you let the recipe run.',
      ret: 'Expected stock return, per year', retHint: 'An assumption. Bonds: 3% a year.',
      rule: 'Rule', none: 'Never', year: 'Once a year', b5: '5-point band', b10: '10-point band',
      fin: 'Stock weight at the end', trades: 'Times you rebalanced', maxw: 'Highest weight stocks reached', dd: 'Worst fall of the total',
      reroll: 'Another simulated market',
      chart: 'Stock weight in a 60/40 recipe', xL: 'years', yL: 'stocks, % of total',
      lgRule: 'with the chosen rule', lgNone: 'never rebalancing', target: 'target 60%',
      cap: 'Simulation: stocks with the chosen return and 16% yearly volatility, bonds with 3% and 5% volatility, unrelated to each other, with no costs or taxes. The same market for all four rules. Without rebalancing, the recipe drifts toward whatever rises most, and that changes the risk you are taking without you ever deciding it.',
      s: 'What you have in stocks', b: 'What you have in bonds', tg: 'Your recipe: % in stocks', c: 'New contribution',
      toS: 'Of the contribution, to stocks', toB: 'Of the contribution, to bonds', after: 'How it ends up', left: 'Gap left to target',
      before: 'before', afterL: 'after', stocks: 'stocks', bonds: 'bonds', done: 'on target',
      capF: 'The math: the new total times the target share tells you how much you should hold in stocks; the contribution first covers that gap and the rest goes to bonds. You sell nothing, so you pay no selling fees or taxes on sales.',
      bar: 'Bars with the split before and after the contribution'
    },
    pt: {
      years: 'Anos', yearsHint: 'Por quanto tempo você deixa a receita correr.',
      ret: 'Retorno esperado das ações, por ano', retHint: 'Suposição. Os títulos: 3% ao ano.',
      rule: 'Regra', none: 'Nunca', year: 'Uma vez por ano', b5: 'Banda de 5 pontos', b10: 'Banda de 10 pontos',
      fin: 'Peso das ações no final', trades: 'Vezes que você rebalanceou', maxw: 'Peso máximo que as ações atingiram', dd: 'Pior queda do total',
      reroll: 'Outro mercado simulado',
      chart: 'Peso das ações numa receita 60/40', xL: 'anos', yL: 'ações, % do total',
      lgRule: 'com a regra escolhida', lgNone: 'sem nunca rebalancear', target: 'objetivo 60%',
      cap: 'Simulação: ações com o retorno escolhido e volatilidade de 16% ao ano, títulos com 3% e 5% de volatilidade, sem relação entre si e sem custos nem impostos. O mesmo mercado para as quatro regras. Sem rebalancear, a receita vai se deslocando para o que mais sobe, e isso muda o risco que você corre sem que você tenha decidido.',
      s: 'O que você tem em ações', b: 'O que você tem em títulos', tg: 'Sua receita: % em ações', c: 'Aporte novo',
      toS: 'Do aporte, para ações', toB: 'Do aporte, para títulos', after: 'Como fica', left: 'Falta para o objetivo',
      before: 'antes', afterL: 'depois', stocks: 'ações', bonds: 'títulos', done: 'chegou',
      capF: 'A conta: o novo total vezes a porcentagem objetivo dá quanto você deveria ter em ações; o aporte primeiro cobre essa diferença e o resto vai para títulos. Você não vende nada, então não paga taxas de venda nem impostos por vender.',
      bar: 'Barras com a divisão antes e depois do aporte'
    }
  });
  var RULES = ['none', 'year', 'b5', 'b10'];
  var p0 = function (x) { return fmt.pct(x, 0); };

  // ---------- widget 1: drift ----------
  V.mount('rebal-drift', function (root) {
    var seed = V.param('seed', 3, 1, 1e9), TARGET = 0.6;
    var yS = V.slider({ id: 'years', label: t('years'), min: 5, max: 40, step: 1, value: 30, hint: t('yearsHint'), onInput: paint });
    var rS = V.slider({ id: 'ret', label: t('ret'), min: 3, max: 10, step: 0.5, value: 7, format: function (v) { return fmt.num(v, 1) + '%'; }, hint: t('retHint'), onInput: paint });
    var seg = V.segmented({ id: 'rule', label: t('rule'), value: 'b5', options: RULES.map(function (r) { return { v: r, label: t(r) }; }), onChange: paint });
    var oF = V.readout(t('fin')), oT = V.readout(t('trades')), oM = V.readout(t('maxw')), oD = V.readout(t('dd'));
    var chart = V.chart({ width: 640, pad: { l: 72 }, height: 300, xLabel: t('xL'), yLabel: t('yL'), label: t('chart'), xFmt: fmt.int, yFmt: function (v) { return fmt.int(v * 100) + '%'; } });
    var table = V.h('table', { 'aria-label': t('chart') });
    var cap = V.h('p', { 'class': 'viz-cap', text: t('cap') });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [yS.el, rS.el, seg.el, V.button(t('reroll'), function () { seed = (seed * 48271 + 11) % 2147483647; paint(); })]),
      V.h('div', { 'class': 'viz-outs' }, [oF.el, oT.el, oM.el, oD.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('lgRule') }, { cls: 'bad', label: t('lgNone') }]));
    root.appendChild(table);
    root.appendChild(cap);

    function paint() {
      var months = yS.get() * 12;
      var rets = M.returns(V.rng(seed), months, rS.get() / 100, 0.16, 0.03, 0.05);
      var res = {};
      RULES.forEach(function (r) { res[r] = M.run(rets, TARGET, r); });
      var cur = res[seg.get()];
      oF.set(p0(cur.weight), Math.abs(cur.weight - TARGET) > 0.1 ? 'bad' : '');
      oT.set(fmt.int(cur.trades));
      oM.set(p0(cur.maxW), cur.maxW > 0.7 ? 'bad' : '');
      oD.set('-' + p0(cur.maxDD));
      var series = [];
      if (seg.get() !== 'none') series.push({ pts: res.none.path, cls: 'bad', width: 2 });
      series.push({ pts: cur.path, cls: seg.get() === 'none' ? 'bad' : 'a', width: 2.5 });
      var hl = [{ y: TARGET, label: t('target'), cls: 'muted' }];
      if (seg.get() === 'b5') hl.push({ y: 0.65, cls: 'muted' }, { y: 0.55, cls: 'muted' });
      if (seg.get() === 'b10') hl.push({ y: 0.7, cls: 'muted' }, { y: 0.5, cls: 'muted' });
      chart.draw({ x: [0, months / 12], y: [0.3, 1], series: series, hlines: hl });
      chart.describe(t('chart') + ': ' + t(seg.get()));
      // comparison table, built with plain elements (no extra styles)
      var rows = [V.h('tr', {}, TH().map(function (txt) { return V.h('th', { text: txt, scope: 'col' }); }))];
      RULES.forEach(function (r) {
        var x = res[r];
        rows.push(V.h('tr', {}, [
          V.h('th', { scope: 'row', text: t(r) }),
          V.h('td', { text: fmt.int(x.trades) }),
          V.h('td', { text: p0(x.weight) }),
          V.h('td', { text: '-' + p0(x.maxDD) }),
          V.h('td', { text: fmt.money(x.final, 0) })
        ]));
      });
      table.replaceChildren.apply(table, rows);
    }
    function TH() {
      var lang = V.lang, map = { es: 0, en: 1, pt: 2 };
      var all = [
        ['Regla', 'Rebalanceos', 'Acciones al final', 'Peor caída', 'Valor final de $100'],
        ['Rule', 'Rebalances', 'Stocks at the end', 'Worst fall', 'Final value of $100'],
        ['Regra', 'Rebalanceamentos', 'Ações no final', 'Pior queda', 'Valor final de $100']
      ];
      return all[map[lang] || 0];
    }
    paint();
  });

  // ---------- widget 2: new money only ----------
  V.mount('rebal-flow', function (root) {
    var sS = V.slider({ id: 'fs', label: t('s'), min: 0, max: 20000, step: 250, value: 7500, format: function (v) { return fmt.money(v, 0); }, onInput: paint });
    var bS = V.slider({ id: 'fb', label: t('b'), min: 0, max: 20000, step: 250, value: 2500, format: function (v) { return fmt.money(v, 0); }, onInput: paint });
    var gS = V.slider({ id: 'ft', label: t('tg'), min: 0, max: 100, step: 5, value: 70, format: function (v) { return v + '%'; }, onInput: paint });
    var cS = V.slider({ id: 'fc', label: t('c'), min: 0, max: 5000, step: 100, value: 1000, format: function (v) { return fmt.money(v, 0); }, onInput: paint });
    var oS = V.readout(t('toS')), oB = V.readout(t('toB')), oA = V.readout(t('after')), oL = V.readout(t('left'));
    var W = 640, H = 170;
    var svg = V.s('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'viz-svg', role: 'img', 'aria-label': t('bar') });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [sS.el, bS.el, gS.el, cS.el]),
      V.h('div', { 'class': 'viz-outs' }, [oS.el, oB.el, oA.el, oL.el])
    ]));
    root.appendChild(svg);
    root.appendChild(V.h('p', { 'class': 'viz-cap', text: t('capF') }));

    function bar(y, s, b, label, target) {
      var x0 = 90, w = W - x0 - 20, tot = s + b || 1, ws = s / tot;
      svg.appendChild(V.s('text', { x: x0 - 10, y: y + 24, 'class': 'viz-note strong', 'text-anchor': 'end', text: label }));
      svg.appendChild(V.s('rect', { x: x0, y: y, width: w * ws, height: 36, 'class': 'dot-a' }));
      svg.appendChild(V.s('rect', { x: x0 + w * ws, y: y, width: w * (1 - ws), height: 36, 'class': 'dot-a', 'fill-opacity': 0.3 }));
      svg.appendChild(V.s('text', { x: x0, y: y + 54, 'class': 'viz-note', text: t('stocks') + ' ' + p0(ws) + ' / ' + t('bonds') + ' ' + p0(1 - ws) }));
      var tx = x0 + w * target;
      svg.appendChild(V.s('line', { x1: tx, x2: tx, y1: y - 6, y2: y + 42, 'class': 'ln-bad dash', 'stroke-width': 2 }));
    }
    function paint() {
      var s = sS.get(), b = bS.get(), tg = gS.get() / 100, c = cS.get(), r = M.split(s, b, tg, c);
      oS.set(fmt.money(r.toS, 0)); oB.set(fmt.money(r.toB, 0));
      oA.set(fmt.money(r.s, 0) + ' / ' + fmt.money(r.b, 0) + ' (' + p0(r.w) + ')');
      var gap = Math.abs(r.w - tg);
      oL.set(gap < 0.005 ? t('done') : fmt.num(gap * 100, 1) + ' pp', gap < 0.005 ? 'good' : 'bad');
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      bar(20, s, b, t('before'), tg);
      bar(96, r.s, r.b, t('afterL'), tg);
    }
    paint();
  });
})();
