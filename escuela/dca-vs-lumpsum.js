// Widgets for "¿Todo junto o de a poco?".
//   dca-odds:   thousands of simulated years. Share of runs where investing everything on day one beats
//               spreading it over N months (the waiting cash earns a small rate).
//   dca-paths:  one path at a time: a random one, a fall right after you enter, or a steady rise.
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
    monthly: function (rand, months, mu, vol) {
      var m = Math.log(1 + mu) / 12, s = vol / Math.sqrt(12), out = [];
      for (var i = 0; i < months; i++) out.push(Math.exp(m - s * s / 2 + s * M.gauss(rand)) - 1);
      return out;
    },
    // values month by month for lump sum and for equal monthly parts over rets.length months
    compare: function (rets, cash) {
      var n = rets.length, c = Math.pow(1 + cash, 1 / 12) - 1;
      var ls = 1, inv = 0, wait = 1, lsP = [[0, 1]], dcP = [[0, 1]];
      for (var i = 0; i < n; i++) {
        var part = 1 / n;            // buy one part at the start of month i
        wait -= part; inv += part;
        inv *= 1 + rets[i]; ls *= 1 + rets[i]; wait *= 1 + c;
        if (wait < 1e-12) wait = 0;
        lsP.push([i + 1, ls]); dcP.push([i + 1, inv + wait]);
      }
      return { ls: ls, dca: inv + wait, lsP: lsP, dcP: dcP };
    },
    odds: function (rand, runs, months, mu, vol, cash) {
      var wins = 0, diffs = [];
      for (var r = 0; r < runs; r++) {
        var x = M.compare(M.monthly(rand, months, mu, vol), cash);
        if (x.ls > x.dca) wins++;
        diffs.push(x.ls - x.dca);
      }
      diffs.sort(function (a, b) { return a - b; });
      var q = function (p) { return diffs[Math.min(diffs.length - 1, Math.floor(p * diffs.length))]; };
      return { share: wins / runs, median: q(0.5), p05: q(0.05), p95: q(0.95), diffs: diffs };
    },
    // histogram as a step line: returns [[x, count]] over [lo, hi] in `bins` bins
    hist: function (xs, lo, hi, bins) {
      var cnt = [], w = (hi - lo) / bins, i;
      for (i = 0; i < bins; i++) cnt.push(0);
      xs.forEach(function (x) { var k = Math.floor((x - lo) / w); if (k >= 0 && k < bins) cnt[k]++; });
      var pts = [];
      for (i = 0; i < bins; i++) { pts.push([lo + i * w, cnt[i]]); pts.push([lo + (i + 1) * w, cnt[i]]); }
      return pts;
    }
  };
  if (typeof window === 'undefined') { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;
  var t = V.texts({
    es: {
      mu: 'Rendimiento esperado, por año', muHint: 'Supuesto para lo que comprás.',
      vol: 'Volatilidad, por año', volHint: 'Cuánto se sacude el precio. El 10% de partida es un supuesto para una mezcla de acciones y bonos; solo acciones se sacude más.',
      months: 'Meses en que repartís la compra', monthsHint: 'Vanguard comparó contra 12 meses.',
      cash: 'Lo que rinde la plata que espera, por año', cashHint: 'Por ejemplo, una cuenta remunerada.',
      share: 'Veces que todo junto ganó', med: 'Diferencia típica a favor de todo junto', bad: 'En el 5% de los peores casos para todo junto',
      reroll: 'Otras 4.000 simulaciones',
      chart: 'Cuánto ganó o perdió todo junto contra de a poco, en 4.000 simulaciones', xL: 'todo junto menos de a poco, en % de lo invertido', yL: 'simulaciones',
      lsWins: 'gana todo junto', dcaWins: 'gana de a poco',
      cap: 'Simulación: 4.000 casos con el rendimiento y la volatilidad elegidos, sin costos. Todo junto gana en {s} de los casos: casi siempre por poco, a veces por mucho. Cuando pierde, es porque el precio cayó justo después de entrar. Vanguard encontró, con datos históricos de tres países, que todo junto ganó cerca de dos de cada tres veces.',
      sc: 'Qué pasa después de entrar', rnd: 'Al azar', crash: 'Cae justo después', rally: 'Sube sin parar', other: 'Otro camino',
      vLs: 'Todo junto, al final', vDca: 'De a poco, al final', chartP: 'Valor de $1.000 invertidos de las dos formas', xP: 'meses', yP: 'valor',
      lgLs: 'todo junto', lgDca: 'de a poco (en partes iguales)',
      capP: 'En el camino "cae justo después", de a poco termina mejor y duele menos: es la escena que el promedio te ahorra. En los otros, todo junto suele ganar porque tuvo más plata trabajando más tiempo. "Cae justo después" es un camino armado a mano, no una predicción. El camino al azar es una simulación con 7% de rendimiento y 16% de volatilidad por año; la plata que espera rinde 2%.'
    },
    en: {
      mu: 'Expected return, per year', muHint: 'An assumption for what you buy.',
      vol: 'Volatility, per year', volHint: 'How much the price shakes. The starting 10% is an assumption for a stock and bond mix; stocks alone shake more.',
      months: 'Months you spread the purchase over', monthsHint: 'Vanguard compared against 12 months.',
      cash: 'What the waiting cash earns, per year', cashHint: 'For example, an interest-bearing account.',
      share: 'Times lump sum won', med: 'Typical difference in favour of lump sum', bad: 'In the worst 5% of cases for lump sum',
      reroll: 'Another 4,000 simulations',
      chart: 'How much lump sum gained or lost against spreading it out, in 4,000 simulations', xL: 'lump sum minus spread out, % of the amount', yL: 'simulations',
      lsWins: 'lump sum wins', dcaWins: 'spreading wins',
      cap: 'Simulation: 4,000 cases with the chosen return and volatility, no costs. Lump sum wins in {s} of the cases: usually by a little, sometimes by a lot. When it loses, it is because the price fell right after going in. Vanguard found, with historical data from three countries, that lump sum won about two times out of three.',
      sc: 'What happens after you go in', rnd: 'Random', crash: 'Falls right after', rally: 'Rises nonstop', other: 'Another path',
      vLs: 'Lump sum, at the end', vDca: 'Spread out, at the end', chartP: 'Value of $1,000 invested both ways', xP: 'months', yP: 'value',
      lgLs: 'lump sum', lgDca: 'spread out (equal parts)',
      capP: 'On the "falls right after" path, spreading out ends better and hurts less: that is the scene averaging spares you. On the others, lump sum tends to win because it had more money working for longer. "Falls right after" is a hand-made path, not a forecast. The random path is a simulation with a 7% return and 16% volatility a year; waiting cash earns 2%.'
    },
    pt: {
      mu: 'Retorno esperado, por ano', muHint: 'Suposição para o que você compra.',
      vol: 'Volatilidade, por ano', volHint: 'Quanto o preço balança. Os 10% iniciais são uma suposição para uma mistura de ações e títulos; só ações balançam mais.',
      months: 'Meses em que você divide a compra', monthsHint: 'A Vanguard comparou contra 12 meses.',
      cash: 'Quanto rende o dinheiro que espera, por ano', cashHint: 'Por exemplo, uma conta remunerada.',
      share: 'Vezes que tudo de uma vez ganhou', med: 'Diferença típica a favor de tudo de uma vez', bad: 'Nos 5% piores casos para tudo de uma vez',
      reroll: 'Outras 4.000 simulações',
      chart: 'Quanto tudo de uma vez ganhou ou perdeu contra aos poucos, em 4.000 simulações', xL: 'tudo de uma vez menos aos poucos, em % do valor', yL: 'simulações',
      lsWins: 'ganha tudo de uma vez', dcaWins: 'ganha aos poucos',
      cap: 'Simulação: 4.000 casos com o retorno e a volatilidade escolhidos, sem custos. Tudo de uma vez ganha em {s} dos casos: quase sempre por pouco, às vezes por muito. Quando perde, é porque o preço caiu logo depois de entrar. A Vanguard encontrou, com dados históricos de três países, que tudo de uma vez ganhou cerca de duas em cada três vezes.',
      sc: 'O que acontece depois de entrar', rnd: 'Ao acaso', crash: 'Cai logo depois', rally: 'Sobe sem parar', other: 'Outro caminho',
      vLs: 'Tudo de uma vez, no final', vDca: 'Aos poucos, no final', chartP: 'Valor de $1.000 investidos das duas formas', xP: 'meses', yP: 'valor',
      lgLs: 'tudo de uma vez', lgDca: 'aos poucos (partes iguais)',
      capP: 'No caminho "cai logo depois", aos poucos termina melhor e dói menos: é a cena que a média evita. Nos outros, tudo de uma vez costuma ganhar porque teve mais dinheiro trabalhando por mais tempo. "Cai logo depois" é um caminho feito à mão, não uma previsão. O caminho ao acaso é uma simulação com 7% de retorno e 16% de volatilidade ao ano; o dinheiro que espera rende 2%.'
    }
  });
  var sp = function (x, d) { return (x > 0 ? '+' : '') + fmt.pct(x, d === undefined ? 1 : d); };

  // ---------- widget 1: odds ----------
  V.mount('dca-odds', function (root) {
    var seed = V.param('seed', 21, 1, 1e9), RUNS = 4000;
    var mS = V.slider({ id: 'mu', label: t('mu'), min: 0, max: 12, step: 0.5, value: 7, format: function (v) { return fmt.num(v, 1) + '%'; }, hint: t('muHint'), onInput: paint });
    var vS = V.slider({ id: 'vol', label: t('vol'), min: 5, max: 35, step: 1, value: 10, format: function (v) { return v + '%'; }, hint: t('volHint'), onInput: paint });
    var nS = V.slider({ id: 'months', label: t('months'), min: 2, max: 24, step: 1, value: 12, hint: t('monthsHint'), onInput: paint });
    var cS = V.slider({ id: 'cash', label: t('cash'), min: 0, max: 5, step: 0.5, value: 2, format: function (v) { return fmt.num(v, 1) + '%'; }, hint: t('cashHint'), onInput: paint });
    var oS = V.readout(t('share')), oM = V.readout(t('med')), oB = V.readout(t('bad'));
    var chart = V.chart({ width: 640, pad: { l: 72 }, height: 280, xLabel: t('xL'), yLabel: t('yL'), label: t('chart'), xFmt: function (v) { return sp(v, 0); }, yFmt: fmt.int });
    var cap = V.h('p', { 'class': 'viz-cap' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [mS.el, vS.el, nS.el, cS.el, V.button(t('reroll'), function () { seed = (seed * 48271 + 11) % 2147483647; paint(); })]),
      V.h('div', { 'class': 'viz-outs' }, [oS.el, oM.el, oB.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(cap);

    function paint() {
      var r = M.odds(V.rng(seed), RUNS, nS.get(), mS.get() / 100, vS.get() / 100, cS.get() / 100);
      oS.set(fmt.pct(r.share, 0), r.share >= 0.5 ? 'good' : 'bad');
      oM.set(sp(r.median));
      oB.set(sp(r.p05), r.p05 < 0 ? 'bad' : '');
      var span = Math.max(0.05, Math.ceil(Math.max(Math.abs(r.diffs[Math.floor(RUNS * 0.005)]), Math.abs(r.diffs[Math.floor(RUNS * 0.995)])) * 20) / 20);
      var neg = r.diffs.filter(function (d) { return d <= 0; }), pos = r.diffs.filter(function (d) { return d > 0; });
      var hn = M.hist(neg, -span, 0, 20), hp = M.hist(pos, 0, span, 20);
      var top = 0;
      hn.concat(hp).forEach(function (p) { top = Math.max(top, p[1]); });
      chart.draw({
        x: [-span, span], y: [0, top * 1.15],
        series: [{ pts: hn, cls: 'bad', area: true, base: 0 }, { pts: hp, cls: 'a', area: true, base: 0 }],
        vlines: [{ x: 0, cls: 'muted' }],
        texts: [{ x: span * 0.95, y: top * 1.05, text: t('lsWins'), anchor: 'end', cls: 'strong' }, { x: -span * 0.95, y: top * 1.05, text: t('dcaWins'), cls: 'bad' }]
      });
      chart.describe(t('chart'));
      cap.textContent = t('cap', { s: fmt.pct(r.share, 0) });
    }
    paint();
  });

  // ---------- widget 2: paths ----------
  V.mount('dca-paths', function (root) {
    var seed = V.param('pseed', 4, 1, 1e9), N = 12;
    var seg = V.segmented({ id: 'sc', label: t('sc'), value: 'rnd', options: [{ v: 'rnd', label: t('rnd') }, { v: 'crash', label: t('crash') }, { v: 'rally', label: t('rally') }], onChange: paint });
    var btn = V.button(t('other'), function () { seed = (seed * 48271 + 11) % 2147483647; seg.set('rnd'); paint(); });
    var oL = V.readout(t('vLs')), oD = V.readout(t('vDca'));
    var chart = V.chart({ width: 640, pad: { l: 72 }, height: 280, xLabel: t('xP'), yLabel: t('yP'), label: t('chartP'), xFmt: fmt.int, yFmt: function (v) { return fmt.money(v, 0); } });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [seg.el, btn]),
      V.h('div', { 'class': 'viz-outs' }, [oL.el, oD.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('lgLs') }, { cls: 'bad', dash: true, label: t('lgDca') }]));
    root.appendChild(V.h('p', { 'class': 'viz-cap', text: t('capP') }));

    function paint() {
      var sc = seg.get(), rets;
      if (sc === 'crash') rets = [-0.08, -0.08, -0.06, -0.04, 0.02, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03];
      else if (sc === 'rally') rets = [0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015];
      else rets = M.monthly(V.rng(seed), N, 0.07, 0.16);
      var x = M.compare(rets, 0.02);
      oL.set(fmt.money(1000 * x.ls, 0), x.ls >= x.dca ? 'good' : 'bad');
      oD.set(fmt.money(1000 * x.dca, 0), x.dca > x.ls ? 'good' : '');
      var k = function (p) { return [p[0], 1000 * p[1]]; };
      chart.draw({
        x: [0, N],
        series: [{ pts: x.lsP.map(k), cls: 'a', width: 3 }, { pts: x.dcP.map(k), cls: 'bad', dash: true, width: 3 }],
        hlines: [{ y: 1000, label: fmt.money(1000, 0), cls: 'muted' }]
      });
      chart.describe(t('chartP'));
    }
    paint();
  });
})();
