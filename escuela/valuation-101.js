// Widgets for "Valuar es contar una historia con números" (es, en, pt).
// dcf:         a toy discounted cash flow. Sales of 100 today grow at g for 10 years, a share m
//              of sales turns into free cash, everything is discounted at r, and after year 10
//              the cash grows forever at 2.5% (terminal value). Compared with a price you pick.
// reverse-dcf: the same model run backwards: which growth does a given price imply?
(function () {
  'use strict';

  var GT = 0.025, YEARS = 10, SALES0 = 100;

  // ---------- pure math (checked with node) ----------
  function dcf(g, m, r, gt) {
    gt = gt === undefined ? GT : gt;
    var pv = [], sum = 0, sales = SALES0;
    for (var y = 1; y <= YEARS; y++) {
      sales *= 1 + g;
      var v = sales * m / Math.pow(1 + r, y);
      pv.push(v); sum += v;
    }
    var tv = r > gt ? sales * (1 + gt) * m / (r - gt) / Math.pow(1 + r, YEARS) : Infinity;
    return { pv: pv, years: sum, terminal: tv, value: sum + tv, salesEnd: sales };
  }
  // growth that makes the toy DCF equal to price (bisection; value rises with g)
  function impliedGrowth(price, m, r) {
    var lo = -0.3, hi = 1.0;
    if (dcf(lo, m, r).value > price) return lo;
    if (dcf(hi, m, r).value < price) return hi;
    for (var k = 0; k < 100; k++) { var mid = (lo + hi) / 2; if (dcf(mid, m, r).value < price) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  // price over next year's cash when cash grows forever at g: 1 / (r - g)
  function perpetuityMultiple(r, g) { return r > g ? 1 / (r - g) : Infinity; }
  var M = { dcf: dcf, impliedGrowth: impliedGrowth, perpetuityMultiple: perpetuityMultiple };
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
      g: 'Crecimiento de las ventas, por año (10 años)', g_hint: 'La historia: ¿cuánto más va a vender?',
      m: 'Margen de caja libre', m_hint: 'De cada $100 que vende, cuántos le quedan libres después de pagar todo e invertir.',
      r: 'Tasa de descuento', r_hint: 'Lo que le pedís por el riesgo. Más riesgo, tasa más alta.',
      p: 'Precio que pide el mercado', p_hint: 'Por toda la empresa, en la misma unidad que las ventas de hoy (100).',
      o_v: 'Valor según tu historia', o_tv: 'Parte del valor que viene después del año 10', o_ms: 'Precio contra valor',
      under: 'el precio es {x} menor', over: 'el precio es {x} mayor',
      x: 'año', y: 'valor de hoy de la caja de cada año', chart: 'Valor de hoy de la caja de cada año y del resto',
      bars: 'Caja de cada año, traída a hoy', tvbar: 'Todo lo que viene después (barra del año 11)', price: 'precio: {p}', tvlab: 'después',
      cap: 'Cálculo: ventas de 100 hoy que crecen {g} por año durante 10 años, con un margen de caja de {m}, descontadas a {r}. Después del año 10, la caja crece 2,5% por año para siempre. Ese "para siempre" es la barra de la derecha: aporta {tv} del valor. Es un modelo de juguete, no la valuación de ninguna empresa real.',
      rp: 'Precio (por toda la empresa)', rm: 'Margen de caja libre', rr: 'Tasa de descuento',
      o_g: 'Crecimiento por año que el precio da por hecho', o_s: 'Ventas en 10 años, contra las de hoy', o_pm: 'Múltiplo "para siempre" de hoy, 1 / (r − 2,5%)',
      times: '{x} veces', rx: 'crecimiento de las ventas por año', ry: 'valor de la empresa', rchart: 'Valor de la empresa según el crecimiento supuesto',
      curve: 'Valor según el crecimiento', implied: 'el precio pide {g}', plab: 'precio',
      rcap: 'Leído al revés: con un margen de {m} y una tasa de {r}, el precio de {p} solo tiene sentido si las ventas crecen {g} por año durante 10 años, o sea que terminan {s} veces más grandes. La pregunta ya no es "¿cuánto vale?" sino "¿te parece creíble eso?".',
      desc: 'Valor {v} contra precio {p}'
    },
    en: {
      g: 'Sales growth per year (10 years)', g_hint: 'The story: how much more will it sell?',
      m: 'Free cash margin', m_hint: 'Out of every $100 of sales, how much is left free after paying for everything and reinvesting.',
      r: 'Discount rate', r_hint: 'What you ask for the risk. More risk, a higher rate.',
      p: 'Price the market asks', p_hint: 'For the whole company, in the same unit as today\'s sales (100).',
      o_v: 'Value under your story', o_tv: 'Share of the value that comes after year 10', o_ms: 'Price against value',
      under: 'the price is {x} lower', over: 'the price is {x} higher',
      x: 'year', y: 'today\'s value of each year\'s cash', chart: 'Today\'s value of each year\'s cash and of the rest',
      bars: 'Each year\'s cash, brought to today', tvbar: 'Everything after (bar at year 11)', price: 'price: {p}', tvlab: 'after',
      cap: 'The math: sales of 100 today growing {g} a year for 10 years, with a cash margin of {m}, discounted at {r}. After year 10, cash grows 2.5% a year forever. That "forever" is the bar on the right: it is {tv} of the value. A toy model, not the valuation of any real company.',
      rp: 'Price (for the whole company)', rm: 'Free cash margin', rr: 'Discount rate',
      o_g: 'Yearly growth the price takes for granted', o_s: 'Sales in 10 years, against today', o_pm: 'Today\'s "forever" multiple, 1 / (r − 2.5%)',
      times: '{x} times', rx: 'sales growth per year', ry: 'company value', rchart: 'Company value by assumed growth',
      curve: 'Value by growth', implied: 'the price needs {g}', plab: 'price',
      rcap: 'Read backwards: with a margin of {m} and a rate of {r}, a price of {p} only makes sense if sales grow {g} a year for 10 years, ending up {s} times larger. The question is no longer "what is it worth?" but "do you find that believable?".',
      desc: 'Value {v} against price {p}'
    },
    pt: {
      g: 'Crescimento das vendas por ano (10 anos)', g_hint: 'A história: quanto mais vai vender?',
      m: 'Margem de caixa livre', m_hint: 'De cada $100 vendidos, quanto sobra livre depois de pagar tudo e reinvestir.',
      r: 'Taxa de desconto', r_hint: 'O que você pede pelo risco. Mais risco, taxa mais alta.',
      p: 'Preço que o mercado pede', p_hint: 'Pela empresa inteira, na mesma unidade das vendas de hoje (100).',
      o_v: 'Valor segundo a sua história', o_tv: 'Parte do valor que vem depois do ano 10', o_ms: 'Preço contra valor',
      under: 'o preço é {x} menor', over: 'o preço é {x} maior',
      x: 'ano', y: 'valor de hoje do caixa de cada ano', chart: 'Valor de hoje do caixa de cada ano e do resto',
      bars: 'Caixa de cada ano, trazido para hoje', tvbar: 'Tudo o que vem depois (barra do ano 11)', price: 'preço: {p}', tvlab: 'depois',
      cap: 'Cálculo: vendas de 100 hoje que crescem {g} por ano durante 10 anos, com margem de caixa de {m}, descontadas a {r}. Depois do ano 10, o caixa cresce 2,5% por ano para sempre. Esse "para sempre" é a barra da direita: responde por {tv} do valor. É um modelo de brinquedo, não a avaliação de nenhuma empresa real.',
      rp: 'Preço (pela empresa inteira)', rm: 'Margem de caixa livre', rr: 'Taxa de desconto',
      o_g: 'Crescimento por ano que o preço dá como certo', o_s: 'Vendas em 10 anos, contra as de hoje', o_pm: 'Múltiplo "para sempre" de hoje, 1 / (r − 2,5%)',
      times: '{x} vezes', rx: 'crescimento das vendas por ano', ry: 'valor da empresa', rchart: 'Valor da empresa conforme o crescimento suposto',
      curve: 'Valor conforme o crescimento', implied: 'o preço pede {g}', plab: 'preço',
      rcap: 'Lido ao contrário: com margem de {m} e taxa de {r}, o preço de {p} só faz sentido se as vendas crescerem {g} por ano durante 10 anos, terminando {s} vezes maiores. A pergunta já não é "quanto vale?" e sim "isso parece crível para você?".',
      desc: 'Valor {v} contra preço {p}'
    }
  });

  function p1(v) { return fmt.num(v, v % 1 ? 1 : 0) + '%'; }

  V.mount('dcf', function (root) {
    var st = {};
    function mk(key, lab, min, max, step, val, format) {
      var sl = V.slider({ id: key, label: t(lab), hint: t(lab + '_hint'), min: min, max: max, step: step, value: val, format: format,
        onInput: function (x) { st[key] = x; paint(); } });
      st[key] = sl.get(); return sl;
    }
    var ss = [mk('g', 'g', -5, 30, 1, 10, p1), mk('m', 'm', 2, 40, 1, 15, p1), mk('r', 'r', 5, 15, 0.5, 9, p1),
      mk('p', 'p', 50, 2000, 10, 300, function (x) { return fmt.int(x); })];
    var oV = V.readout(t('o_v')), oT = V.readout(t('o_tv')), oM = V.readout(t('o_ms'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('x'), yLabel: t('y'), label: t('chart'),
      xFmt: function (x) { return fmt.int(x); }, yFmt: function (y) { return fmt.int(y); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, ss.map(function (x) { return x.el; })),
      V.h('div', { 'class': 'viz-outs' }, [oV.el, oT.el, oM.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('bars') }, { cls: 'muted', label: t('tvbar') }]));
    root.appendChild(cap);

    function paint() {
      var g = st.g / 100, m = st.m / 100, r = st.r / 100, d = dcf(g, m, r);
      oV.set(fmt.int(d.value));
      oT.set(fmt.pct(d.terminal / d.value, 0), d.terminal / d.value > 0.7 ? 'bad' : '');
      var diff = st.p / d.value - 1;
      oM.set(diff <= 0 ? t('under', { x: fmt.pct(-diff, 0) }) : t('over', { x: fmt.pct(diff, 0) }), diff <= 0 ? 'good' : 'bad');
      var bars = d.pv.map(function (v, k) { return { x0: k + 0.6, x1: k + 1.4, y0: 0, y1: v, cls: 'a' }; });
      bars.push({ x0: 10.6, x1: 11.4, y0: 0, y1: d.terminal, cls: 'muted' });
      var top = Math.max(d.terminal, st.p) * 1.1;
      chart.draw({ x: [0, 12], y: [0, top], bars: bars,
        hlines: [{ y: st.p, label: t('price', { p: fmt.int(st.p) }), cls: 'bad' }],
        texts: [{ x: 11, y: d.terminal + top * 0.03, text: fmt.int(d.terminal), anchor: 'middle', cls: 'strong' }] });
      tint(chart.svg);
      cap.textContent = t('cap', { g: p1(st.g), m: p1(st.m), r: p1(st.r), tv: fmt.pct(d.terminal / d.value, 0) });
      chart.describe(t('desc', { v: fmt.int(d.value), p: fmt.int(st.p) }));
    }
    paint();
  });

  V.mount('reverse-dcf', function (root) {
    var st = {};
    function mk(key, lab, min, max, step, val, format) {
      var sl = V.slider({ id: key, label: t(lab), min: min, max: max, step: step, value: val, format: format,
        onInput: function (x) { st[key] = x; paint(); } });
      st[key] = sl.get(); return sl;
    }
    var ss = [mk('rp', 'rp', 50, 2000, 10, 600, function (x) { return fmt.int(x); }), mk('rm', 'rm', 2, 40, 1, 15, p1), mk('rr', 'rr', 5, 15, 0.5, 9, p1)];
    var oG = V.readout(t('o_g')), oS = V.readout(t('o_s')), oP = V.readout(t('o_pm'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('rx'), yLabel: t('ry'), label: t('rchart'),
      xFmt: function (x) { return fmt.int(x) + '%'; }, yFmt: function (y) { return fmt.compact(y); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, ss.map(function (x) { return x.el; })),
      V.h('div', { 'class': 'viz-outs' }, [oG.el, oS.el, oP.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('curve') }, { cls: 'bad', label: t('plab'), dash: true }]));
    root.appendChild(cap);

    function paint() {
      var m = st.rm / 100, r = st.rr / 100, P = st.rp;
      var g = impliedGrowth(P, m, r), sMult = Math.pow(1 + g, YEARS);
      oG.set(fmt.pct(g, 1), g > 0.2 ? 'bad' : '');
      oS.set(t('times', { x: fmt.num(sMult, 1) }), sMult > 5 ? 'bad' : '');
      oP.set(fmt.num(perpetuityMultiple(r, GT), 1));
      var pts = [];
      for (var k = -10; k <= 40; k += 1) pts.push([k, dcf(k / 100, m, r).value]);
      var top = Math.min(Math.max(P * 1.6, 200), pts[pts.length - 1][1]);
      chart.draw({ x: [-10, 40], y: [0, top], series: [{ pts: pts.filter(function (q) { return q[1] <= top * 1.02; }), cls: 'a' }],
        hlines: [{ y: P, label: t('plab'), cls: 'bad' }],
        marks: g > -0.1 && g < 0.4 ? [{ x: g * 100, y: P, label: t('implied', { g: fmt.pct(g, 1) }), cls: 'bad' }] : [] });
      cap.textContent = t('rcap', { m: p1(st.rm), r: p1(st.rr), p: fmt.int(P), g: fmt.pct(g, 1), s: fmt.num(sMult, 1) });
      chart.describe(t('rcap', { m: p1(st.rm), r: p1(st.rr), p: fmt.int(P), g: fmt.pct(g, 1), s: fmt.num(sMult, 1) }));
    }
    paint();
  });
})();
