// Widgets for "El mercado enorme que engaña" (es, en, pt).
// tam-funnel: value = market size x share x margin x multiple, and the share a given price implies.
// tam-crowd:  several companies each priced as if it wins a big share of the same market;
//             their assumed shares are added up (seeded random spread, re-roll button).
(function () {
  'use strict';

  // ---------- pure math (checked with node) ----------
  function funnel(tam, share, margin, multiple) {
    var sales = tam * share, profit = sales * margin;
    return { sales: sales, profit: profit, value: profit * multiple };
  }
  function impliedShare(price, tam, margin, multiple) {
    var per = tam * margin * multiple;
    return per > 0 ? price / per : Infinity;
  }
  // n assumed shares around avg, each between 0.5x and 1.5x avg
  function crowdShares(n, avg, r) {
    var out = [];
    for (var k = 0; k < n; k++) out.push(avg * (0.5 + r()));
    return out;
  }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  // share of the total value priced in that cannot exist, if the whole market is at most `cap` (1 = 100%)
  function impossible(total, cap) { return total > cap ? 1 - cap / total : 0; }
  var M = { funnel: funnel, impliedShare: impliedShare, crowdShares: crowdShares, sum: sum, impossible: impossible };
  if (typeof module === 'object' && module.exports) { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  function tint(svg) {   // bar colours as SVG style attributes, so no new CSS is needed
    var map = { 'fill-a': 'var(--ny-accent)', 'fill-bad': 'var(--ny-bad)', 'fill-muted': 'var(--ny-muted)' };
    [].forEach.call(svg.querySelectorAll('rect'), function (n) {
      var c = n.getAttribute('class') || '';
      Object.keys(map).forEach(function (k) { if (c.indexOf(k) === 0) n.setAttribute('style', 'fill:' + map[k] + ';opacity:0.85'); });
    });
  }

  var t = V.texts({
    es: {
      tam: 'Tamaño del mercado, ventas por año', tam_hint: 'En miles de millones de dólares. El famoso "TAM".',
      share: 'Parte del mercado que se queda la empresa', margin: 'Margen de ganancia', margin_hint: 'De cada $100 que vende, cuántos son ganancia.',
      mult: 'Múltiplo (precio / ganancia)', mult_hint: 'Cuántos años de esa ganancia paga el mercado.',
      price: 'Valor que el mercado ya le pone hoy', price_hint: 'En miles de millones de dólares.',
      o_v: 'Valor si la historia sale bien', o_half: 'Valor si se queda con la mitad de esa parte', o_imp: 'Parte del mercado que el precio da por hecha',
      bn: '{x} mil M', x: 'parte del mercado que se queda', y: 'valor (miles de millones)', chart: 'Valor de la empresa según la parte del mercado que gane',
      curve: 'Valor según la parte del mercado', plab: 'valor de hoy', you: 'tu supuesto', half: 'la mitad',
      cap: 'Cuenta: {tam} mil millones × {s} × {m} × {pe} = {v} mil millones. Como todo se multiplica, cada supuesto pesa entero: si la parte del mercado cae a la mitad, el valor cae a la mitad. El precio de hoy ({p} mil millones) solo cierra si la empresa se queda con {imp} del mercado, con ese margen y ese múltiplo para siempre.',
      n: 'Empresas que pelean el mismo mercado', avg: 'Parte que cada una supone, en promedio', reroll: 'Otras suposiciones',
      o_sum: 'Suma de las partes que suponen', o_imp1: 'Valor que no puede existir aunque nadie baje precios', o_imp2: 'Si la guerra de precios corta los márgenes a la mitad',
      cx: 'empresas, sumadas una tras otra', cy: 'parte del mercado sumada', cchart: 'Partes del mercado supuestas, sumadas',
      whole: 'todo el mercado (100%)', bars: 'Parte que supone cada empresa, apilada', over: 'por encima del 100%',
      ccap: 'Simulación con supuestos: cada empresa supone una parte entre la mitad y una vez y media del promedio elegido. Si los precios de todas reflejan esas partes, la suma es {s} del mercado. Como nadie puede vender más que el mercado entero, al menos {i} del valor total que se les pone tiene que desaparecer, y eso con los márgenes intactos.',
      cdesc: '{n} empresas suponen en total {s} del mercado'
    },
    en: {
      tam: 'Market size, sales per year', tam_hint: 'In billions of dollars. The famous "TAM".',
      share: 'Share of the market the company keeps', margin: 'Profit margin', margin_hint: 'Out of every $100 of sales, how much is profit.',
      mult: 'Multiple (price / earnings)', mult_hint: 'How many years of that profit the market pays.',
      price: 'Value the market already gives it', price_hint: 'In billions of dollars.',
      o_v: 'Value if the story works out', o_half: 'Value if it keeps half that share', o_imp: 'Market share the price takes for granted',
      bn: '{x}B', x: 'share of the market it keeps', y: 'value (billions)', chart: 'Company value by the share of the market it wins',
      curve: 'Value by market share', plab: 'today\'s value', you: 'your assumption', half: 'half',
      cap: 'The math: {tam} billion × {s} × {m} × {pe} = {v} billion. Because everything is multiplied, every assumption counts in full: if the market share halves, the value halves. Today\'s price ({p} billion) only works if the company keeps {imp} of the market, with that margin and that multiple for good.',
      n: 'Companies fighting for the same market', avg: 'Share each one assumes, on average', reroll: 'Other assumptions',
      o_sum: 'Sum of the shares they assume', o_imp1: 'Value that cannot exist even with no price cuts', o_imp2: 'If a price war halves the margins',
      cx: 'companies, added one after another', cy: 'market share added up', cchart: 'Assumed market shares, added up',
      whole: 'the whole market (100%)', bars: 'Share each company assumes, stacked', over: 'above 100%',
      ccap: 'Simulation with assumptions: each company assumes a share between half and one and a half times the chosen average. If all their prices reflect those shares, they add up to {s} of the market. Since nobody can sell more than the whole market, at least {i} of the total value placed on them has to disappear, and that is with margins intact.',
      cdesc: '{n} companies assume {s} of the market in total'
    },
    pt: {
      tam: 'Tamanho do mercado, vendas por ano', tam_hint: 'Em bilhões de dólares. O famoso "TAM".',
      share: 'Fatia do mercado que a empresa fica', margin: 'Margem de lucro', margin_hint: 'De cada $100 vendidos, quanto é lucro.',
      mult: 'Múltiplo (preço / lucro)', mult_hint: 'Quantos anos desse lucro o mercado paga.',
      price: 'Valor que o mercado já dá hoje', price_hint: 'Em bilhões de dólares.',
      o_v: 'Valor se a história der certo', o_half: 'Valor se ficar com metade dessa fatia', o_imp: 'Fatia do mercado que o preço dá como certa',
      bn: '{x} bi', x: 'fatia do mercado que fica', y: 'valor (bilhões)', chart: 'Valor da empresa conforme a fatia do mercado que ganhar',
      curve: 'Valor conforme a fatia', plab: 'valor de hoje', you: 'sua suposição', half: 'a metade',
      cap: 'Conta: {tam} bilhões × {s} × {m} × {pe} = {v} bilhões. Como tudo se multiplica, cada suposição pesa inteira: se a fatia do mercado cai pela metade, o valor cai pela metade. O preço de hoje ({p} bilhões) só fecha se a empresa ficar com {imp} do mercado, com essa margem e esse múltiplo para sempre.',
      n: 'Empresas brigando pelo mesmo mercado', avg: 'Fatia que cada uma supõe, em média', reroll: 'Outras suposições',
      o_sum: 'Soma das fatias que supõem', o_imp1: 'Valor que não pode existir mesmo sem baixar preços', o_imp2: 'Se a guerra de preços cortar as margens pela metade',
      cx: 'empresas, somadas uma após a outra', cy: 'fatia do mercado somada', cchart: 'Fatias do mercado supostas, somadas',
      whole: 'o mercado inteiro (100%)', bars: 'Fatia que cada empresa supõe, empilhada', over: 'acima de 100%',
      ccap: 'Simulação com suposições: cada empresa supõe uma fatia entre metade e uma vez e meia da média escolhida. Se os preços de todas refletem essas fatias, a soma dá {s} do mercado. Como ninguém pode vender mais que o mercado inteiro, pelo menos {i} do valor total dado a elas tem que desaparecer, e isso com as margens intactas.',
      cdesc: '{n} empresas supõem no total {s} do mercado'
    }
  });

  function p0(v) { return fmt.int(v) + '%'; }

  V.mount('tam-funnel', function (root) {
    var st = {};
    function mk(key, min, max, step, val, format, hint) {
      var sl = V.slider({ id: key, label: t(key), hint: hint ? t(key + '_hint') : null, min: min, max: max, step: step, value: val, format: format,
        onInput: function (x) { st[key] = x; paint(); } });
      st[key] = sl.get(); return sl;
    }
    var big = function (x) { return fmt.int(x); };
    var ss = [mk('tam', 50, 2000, 50, 500, big, true), mk('share', 1, 60, 1, 20, p0), mk('margin', 2, 40, 1, 15, p0, true),
      mk('mult', 5, 50, 1, 25, function (x) { return fmt.int(x) + 'x'; }, true), mk('price', 10, 1500, 10, 300, big, true)];
    var oV = V.readout(t('o_v')), oH = V.readout(t('o_half')), oI = V.readout(t('o_imp'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('x'), yLabel: t('y'), label: t('chart'),
      xFmt: function (x) { return fmt.int(x) + '%'; }, yFmt: function (y) { return fmt.int(y); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, ss.map(function (x) { return x.el; })),
      V.h('div', { 'class': 'viz-outs' }, [oV.el, oH.el, oI.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('curve') }, { cls: 'bad', label: t('plab'), dash: true }]));
    root.appendChild(cap);

    function paint() {
      var s = st.share / 100, m = st.margin / 100, f = funnel(st.tam, s, m, st.mult), h = funnel(st.tam, s / 2, m, st.mult);
      var imp = impliedShare(st.price, st.tam, m, st.mult);
      oV.set(t('bn', { x: fmt.int(f.value) }), f.value >= st.price ? 'good' : '');
      oH.set(t('bn', { x: fmt.int(h.value) }), h.value < st.price ? 'bad' : '');
      oI.set(imp > 1 ? '> 100%' : fmt.pct(imp, 1), imp > s ? 'bad' : '');
      var pts = [];
      for (var k = 0; k <= 60; k++) pts.push([k, funnel(st.tam, k / 100, m, st.mult).value]);
      var top = Math.max(pts[60][1], st.price) * 1.08;
      chart.draw({ x: [0, 60], y: [0, top], series: [{ pts: pts, cls: 'a' }],
        hlines: [{ y: st.price, label: t('plab'), cls: 'bad' }],
        marks: [{ x: st.share, y: f.value, label: t('you'), cls: 'a' }, { x: st.share / 2, y: h.value, label: t('half'), cls: 'bad' }] });
      cap.textContent = t('cap', { tam: fmt.int(st.tam), s: p0(st.share), m: p0(st.margin), pe: st.mult, v: fmt.int(f.value),
        p: fmt.int(st.price), imp: imp > 1 ? '> 100%' : fmt.pct(imp, 1) });
      chart.describe(t('chart'));
    }
    paint();
  });

  V.mount('tam-crowd', function (root) {
    var st = {}, seed = V.param('seed', 11, 1, 1e9);
    var nS = V.slider({ id: 'n', label: t('n'), min: 2, max: 12, step: 1, value: 6, onInput: function (x) { st.n = x; paint(); } });
    var aS = V.slider({ id: 'avg', label: t('avg'), min: 5, max: 60, step: 1, value: 25, format: p0, onInput: function (x) { st.avg = x; paint(); } });
    st.n = nS.get(); st.avg = aS.get();
    var btn = V.button(t('reroll'), function () { seed = (seed * 48271 + 7) % 2147483647; paint(); });
    var oS = V.readout(t('o_sum')), o1 = V.readout(t('o_imp1')), o2 = V.readout(t('o_imp2'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('cx'), yLabel: t('cy'), label: t('cchart'),
      xFmt: function (x) { return fmt.int(x); }, yFmt: function (y) { return fmt.int(y) + '%'; } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [nS.el, aS.el, btn]),
      V.h('div', { 'class': 'viz-outs' }, [oS.el, o1.el, o2.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('bars') }, { cls: 'bad', label: t('over') }]));
    root.appendChild(cap);

    function paint() {
      var shares = crowdShares(st.n, st.avg / 100, V.rng(seed)), total = sum(shares);
      oS.set(fmt.pct(total, 0), total > 1 ? 'bad' : 'good');
      o1.set(fmt.pct(impossible(total, 1), 0), total > 1 ? 'bad' : '');
      o2.set(fmt.pct(impossible(total, 0.5), 0), total > 0.5 ? 'bad' : '');
      var bars = [], cum = 0;
      shares.forEach(function (sh, k) {
        var y0 = cum * 100, y1 = (cum + sh) * 100;
        if (y1 <= 100) bars.push({ x0: k + 0.6, x1: k + 1.4, y0: y0, y1: y1, cls: 'a' });
        else if (y0 >= 100) bars.push({ x0: k + 0.6, x1: k + 1.4, y0: y0, y1: y1, cls: 'bad' });
        else { bars.push({ x0: k + 0.6, x1: k + 1.4, y0: y0, y1: 100, cls: 'a' }); bars.push({ x0: k + 0.6, x1: k + 1.4, y0: 100, y1: y1, cls: 'bad' }); }
        cum += sh;
      });
      chart.draw({ x: [0, st.n + 1], y: [0, Math.max(120, cum * 108)], bars: bars, hlines: [{ y: 100, label: t('whole'), cls: 'muted' }] });
      tint(chart.svg);
      cap.textContent = t('ccap', { s: fmt.pct(total, 0), i: fmt.pct(impossible(total, 1), 0) });
      chart.describe(t('cdesc', { n: st.n, s: fmt.pct(total, 0) }));
    }
    paint();
  });
})();
