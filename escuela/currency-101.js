// Widgets for "La moneda en la que medís" (es, en, pt).
// fisher:          exact real rate (1 + i) / (1 + pi) - 1 against the shortcut i - pi.
// savings-currency: the same savings kept in local currency at a deposit rate, or in dollars,
//                   under local inflation, devaluation and dollar inflation (all computed).
(function () {
  'use strict';

  // ---------- pure math (checked with node) ----------
  function realRate(i, pi) { return (1 + i) / (1 + pi) - 1; }
  // value after t years, start = 1 unit of purchasing power
  function savings(i, pi, dev, piUs, t) {
    var g = Math.pow(1 + i, t), d = Math.pow(1 + dev, t), pl = Math.pow(1 + pi, t), pu = Math.pow(1 + piUs, t);
    return {
      localInLocalReal: g / pl,          // deposit in local currency, measured in local prices
      localInUsdReal: g / d / pu,        // deposit in local currency, turned into dollars, measured in dollar prices
      usdInUsdReal: 1 / pu,              // dollars in a drawer, measured in dollar prices
      usdInLocalReal: d / pl             // dollars in a drawer, turned into local currency, measured in local prices
    };
  }
  // deposit rate needed so that local savings keep their dollar value (no dollar inflation)
  function breakEvenRate(dev) { return dev; }
  var M = { realRate: realRate, savings: savings, breakEvenRate: breakEvenRate };
  if (typeof module === 'object' && module.exports) { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  var t = V.texts({
    es: {
      i_label: 'Tasa que te pagan por año (nominal)', i_hint: 'Lo que dice el cartel del banco.',
      pi_label: 'Inflación del año', pi_hint: 'Cuánto subieron los precios en esa misma moneda.',
      r_exact: 'Rendimiento real (cuenta exacta)', r_approx: 'Atajo: tasa menos inflación', r_gap: 'Error del atajo',
      pts: ' puntos', x: 'inflación del año', y: 'rendimiento real', chart: 'Rendimiento real según la inflación, con la tasa elegida',
      exact: 'Cuenta exacta', approx: 'Atajo (tasa menos inflación)', you: 'vos: {r}',
      cap: 'Con una tasa de {i} y una inflación de {pi}: (1 + {i}) dividido (1 + {pi}) da {x}. Restando 1, el rendimiento real es {r}. Cuando la inflación es baja, el atajo casi no se equivoca; cuando es alta, se equivoca por mucho.',
      s_i: 'Tasa en moneda local, por año', s_pi: 'Inflación local, por año', s_dev: 'Cuánto sube el dólar, por año', s_dev_hint: 'La devaluación: cuántas monedas locales más cuesta cada dólar.',
      s_us: 'Inflación en dólares, por año', s_us_hint: 'El dólar también pierde valor, más despacio.', s_t: 'Años',
      o_local: 'Plazo en moneda local, medido en dólares de hoy', o_usd: 'Dólares guardados, medidos en dólares de hoy', o_ll: 'Plazo en moneda local, medido en precios locales', o_ul: 'Dólares guardados, medidos en precios locales',
      sx: 'años', sy: 'poder de compra (inicio = 100)', schart: 'Poder de compra en dólares de dos formas de ahorrar',
      line_local: 'Plazo en moneda local', line_usd: 'Dólares en un cajón', even: 'lo que tenías',
      scap: 'Cuenta: arrancás con el equivalente a 100 dólares. El plazo en moneda local crece a la tasa elegida, se pasa a dólares con un dólar que sube según la devaluación, y se descuenta la inflación en dólares. Los dólares guardados no rinden nada y solo pierden por la inflación en dólares. Para que el plazo local no pierda contra el dólar, la tasa tiene que ser al menos igual a la devaluación ({d}). Son supuestos parejos todos los años, algo que en la vida real casi nunca pasa.',
      desc: 'Tasa {i}, inflación {pi}: rendimiento real {r}'
    },
    en: {
      i_label: 'Rate you are paid per year (nominal)', i_hint: 'What the bank\'s sign says.',
      pi_label: 'Inflation that year', pi_hint: 'How much prices rose in that same currency.',
      r_exact: 'Real return (exact)', r_approx: 'Shortcut: rate minus inflation', r_gap: 'Shortcut error',
      pts: ' points', x: 'inflation that year', y: 'real return', chart: 'Real return by inflation, at the chosen rate',
      exact: 'Exact', approx: 'Shortcut (rate minus inflation)', you: 'you: {r}',
      cap: 'With a rate of {i} and inflation of {pi}: (1 + {i}) divided by (1 + {pi}) gives {x}. Subtract 1 and the real return is {r}. When inflation is low the shortcut is barely wrong; when it is high it is wrong by a lot.',
      s_i: 'Rate in local currency, per year', s_pi: 'Local inflation, per year', s_dev: 'How much the dollar rises, per year', s_dev_hint: 'Devaluation: how many more units of local currency each dollar costs.',
      s_us: 'Dollar inflation, per year', s_us_hint: 'The dollar loses value too, more slowly.', s_t: 'Years',
      o_local: 'Local-currency deposit, in today\'s dollars', o_usd: 'Dollars kept, in today\'s dollars', o_ll: 'Local-currency deposit, in local prices', o_ul: 'Dollars kept, in local prices',
      sx: 'years', sy: 'purchasing power (start = 100)', schart: 'Purchasing power in dollars of two ways to save',
      line_local: 'Local-currency deposit', line_usd: 'Dollars in a drawer', even: 'what you had',
      scap: 'The math: you start with the equivalent of 100 dollars. The local deposit grows at the chosen rate, is turned into dollars at a dollar that rises with devaluation, and dollar inflation is taken off. The dollars kept earn nothing and only lose to dollar inflation. For the local deposit not to lose against the dollar, the rate has to be at least the devaluation ({d}). The assumptions are the same every year, which in real life almost never happens.',
      desc: 'Rate {i}, inflation {pi}: real return {r}'
    },
    pt: {
      i_label: 'Taxa que você recebe por ano (nominal)', i_hint: 'O que diz o cartaz do banco.',
      pi_label: 'Inflação do ano', pi_hint: 'Quanto os preços subiram nessa mesma moeda.',
      r_exact: 'Rendimento real (conta exata)', r_approx: 'Atalho: taxa menos inflação', r_gap: 'Erro do atalho',
      pts: ' pontos', x: 'inflação do ano', y: 'rendimento real', chart: 'Rendimento real conforme a inflação, com a taxa escolhida',
      exact: 'Conta exata', approx: 'Atalho (taxa menos inflação)', you: 'você: {r}',
      cap: 'Com uma taxa de {i} e uma inflação de {pi}: (1 + {i}) dividido por (1 + {pi}) dá {x}. Tirando 1, o rendimento real é {r}. Quando a inflação é baixa, o atalho quase não erra; quando é alta, erra muito.',
      s_i: 'Taxa em moeda local, por ano', s_pi: 'Inflação local, por ano', s_dev: 'Quanto o dólar sobe, por ano', s_dev_hint: 'A desvalorização: quantas unidades a mais de moeda local custa cada dólar.',
      s_us: 'Inflação em dólares, por ano', s_us_hint: 'O dólar também perde valor, mais devagar.', s_t: 'Anos',
      o_local: 'Aplicação em moeda local, em dólares de hoje', o_usd: 'Dólares guardados, em dólares de hoje', o_ll: 'Aplicação em moeda local, em preços locais', o_ul: 'Dólares guardados, em preços locais',
      sx: 'anos', sy: 'poder de compra (início = 100)', schart: 'Poder de compra em dólares de duas formas de poupar',
      line_local: 'Aplicação em moeda local', line_usd: 'Dólares na gaveta', even: 'o que você tinha',
      scap: 'A conta: você começa com o equivalente a 100 dólares. A aplicação em moeda local cresce à taxa escolhida, é convertida em dólares com um dólar que sobe conforme a desvalorização, e se desconta a inflação em dólares. Os dólares guardados não rendem nada e só perdem para a inflação em dólares. Para a aplicação local não perder do dólar, a taxa precisa ser pelo menos igual à desvalorização ({d}). As suposições são iguais todos os anos, coisa que na vida real quase nunca acontece.',
      desc: 'Taxa {i}, inflação {pi}: rendimento real {r}'
    }
  });

  function p0(v) { return fmt.num(v, 0) + '%'; }

  V.mount('fisher', function (root) {
    var st = { i: 100, pi: 120 };
    var iS = V.slider({ id: 'i', label: t('i_label'), min: 0, max: 200, step: 1, value: 100, format: p0, hint: t('i_hint'), onInput: function (x) { st.i = x; paint(); } });
    var pS = V.slider({ id: 'pi', label: t('pi_label'), min: 0, max: 250, step: 1, value: 120, format: p0, hint: t('pi_hint'), onInput: function (x) { st.pi = x; paint(); } });
    st.i = iS.get(); st.pi = pS.get();
    var rE = V.readout(t('r_exact')), rA = V.readout(t('r_approx')), rG = V.readout(t('r_gap'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('x'), yLabel: t('y'), label: t('chart'),
      xFmt: function (x) { return fmt.int(x) + '%'; }, yFmt: function (y) { return fmt.int(y) + '%'; } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [iS.el, pS.el]),
      V.h('div', { 'class': 'viz-outs' }, [rE.el, rA.el, rG.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('exact') }, { cls: 'muted', label: t('approx'), dash: true }]));
    root.appendChild(cap);

    function paint() {
      var i = st.i / 100, pi = st.pi / 100, r = realRate(i, pi), a = i - pi;
      rE.set(fmt.pct(r, 1), r < 0 ? 'bad' : 'good');
      rA.set(fmt.pct(a, 1), a < 0 ? 'bad' : '');
      rG.set(fmt.num(Math.abs(a - r) * 100, 1) + t('pts'), Math.abs(a - r) > 0.05 ? 'bad' : '');
      var ex = [], ap = [];
      for (var k = 0; k <= 250; k += 5) { ex.push([k, realRate(i, k / 100) * 100]); ap.push([k, (i - k / 100) * 100]); }
      chart.draw({ x: [0, 250], yZero: true,
        series: [{ pts: ap, cls: 'muted', dash: true }, { pts: ex, cls: 'a' }],
        marks: [{ x: st.pi, y: r * 100, label: t('you', { r: fmt.pct(r, 1) }), cls: r < 0 ? 'bad' : 'a' }] });
      cap.textContent = t('cap', { i: p0(st.i), pi: p0(st.pi), x: fmt.num((1 + i) / (1 + pi), 3), r: fmt.pct(r, 1) });
      chart.describe(t('desc', { i: p0(st.i), pi: p0(st.pi), r: fmt.pct(r, 1) }));
    }
    paint();
  });

  V.mount('savings-currency', function (root) {
    var st = { i: 50, pi: 60, dev: 45, us: 3, t: 5 };
    function mk(key, lab, min, max, step, val, hint) {
      var sl = V.slider({ id: key, label: t(lab), min: min, max: max, step: step, value: val, hint: hint ? t(hint) : null,
        format: key === 't' ? function (x) { return fmt.int(x); } : p0, onInput: function (x) { st[key] = x; paint(); } });
      st[key] = sl.get();
      return sl;
    }
    var sliders = [mk('i', 's_i', 0, 150, 1, 50), mk('pi', 's_pi', 0, 150, 1, 60), mk('dev', 's_dev', 0, 150, 1, 45, 's_dev_hint'),
      mk('us', 's_us', 0, 10, 0.5, 3, 's_us_hint'), mk('t', 's_t', 1, 10, 1, 5)];
    var oL = V.readout(t('o_local')), oU = V.readout(t('o_usd')), oLL = V.readout(t('o_ll')), oUL = V.readout(t('o_ul'));
    var chart = V.chart({ width: 640, height: 300, xLabel: t('sx'), yLabel: t('sy'), label: t('schart'),
      xFmt: function (x) { return fmt.int(x); }, yFmt: function (y) { return fmt.int(y); } });
    var cap = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, sliders.map(function (x) { return x.el; })),
      V.h('div', { 'class': 'viz-outs' }, [oL.el, oU.el, oLL.el, oUL.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('line_local') }, { cls: 'bad', label: t('line_usd') }]));
    root.appendChild(cap);

    function show(r, x) { r.set(fmt.int(x * 100), x >= 1 ? 'good' : 'bad'); }
    function paint() {
      var i = st.i / 100, pi = st.pi / 100, dev = st.dev / 100, us = st.us / 100, T = st.t;
      var end = savings(i, pi, dev, us, T);
      show(oL, end.localInUsdReal); show(oU, end.usdInUsdReal); show(oLL, end.localInLocalReal); show(oUL, end.usdInLocalReal);
      var a = [], b = [];
      for (var k = 0; k <= T; k++) { var s = savings(i, pi, dev, us, k); a.push([k, s.localInUsdReal * 100]); b.push([k, s.usdInUsdReal * 100]); }
      var hiY = Math.max.apply(null, a.concat(b).map(function (q) { return q[1]; }));
      chart.draw({ x: [0, T], y: [0, Math.max(120, hiY * 1.1)], series: [{ pts: b, cls: 'bad' }, { pts: a, cls: 'a' }], hlines: [{ y: 100, label: t('even'), cls: 'muted' }] });
      cap.textContent = t('scap', { d: p0(st.dev) });
      chart.describe(t('schart'));
    }
    paint();
  });
})();
