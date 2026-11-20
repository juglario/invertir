// Widgets for "Cuando todo el mercado cae".
//   crash-money: your crash in money. Amount, stock share, a stock fall and a bond move: the loss in dollars
//                and percent, what is left, and the rise you would need to get back.
//   crash-paths: a stylized crash (a simulation, not history). Stocks fall, then recover, then keep growing;
//                bonds grow slowly. Four people with the same savings, four behaviours, eight years.
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  var M = {
    // share and moves as fractions: share 0.6, sFall -0.5, bMove 0.02
    crash: function (amount, share, sFall, bMove) {
      var s = amount * share, b = amount - s;
      var after = s * (1 + sFall) + b * (1 + bMove);
      var loss = amount - after;
      return { s: s, b: b, sAfter: s * (1 + sFall), bAfter: b * (1 + bMove), after: after, loss: loss,
        lossPct: amount > 0 ? loss / amount : 0, need: after > 0 ? amount / after - 1 : Infinity };
    },
    // monthly index levels (start 100). Stocks fall `fall` over fallM months (steady monthly rate), climb back
    // to 100 over recM months (steady monthly rate), then grow at `after` a year. Bonds grow at `bond` a year.
    market: function (months, fall, fallM, recM, after, bond) {
      var st = [100], bd = [100];
      for (var m = 1; m <= months; m++) {
        var p;
        if (m <= fallM) p = 100 * Math.pow(1 - fall, m / fallM);
        else if (m <= fallM + recM) p = 100 * (1 - fall) * Math.pow(1 / (1 - fall), (m - fallM) / recM);
        else p = 100 * Math.pow(1 + after, (m - fallM - recM) / 12);
        st.push(p);
        bd.push(100 * Math.pow(1 + bond, m / 12));
      }
      return { st: st, bd: bd };
    },
    // who: 'panic' sells everything at the bottom (month fallM) and keeps new money in cash at 0%
    //      'freeze' never sells but stops investing while stocks are below their old peak; the cash it saved
    //               goes in (target split) the month stocks are back at the peak
    //      'keep' invests every contribution with the target split, never rebalances
    //      'band' like keep, and rebalances to target when stocks drift more than `band` from it (checked monthly)
    behave: function (mk, start, monthly, target, who, fallM, band) {
      var S = start * target, B = start * (1 - target), C = 0, out = false, put = start, trades = 0;
      var peak = mk.st[0], path = [[0, start]], low = start;
      for (var m = 1; m < mk.st.length; m++) {
        S *= mk.st[m] / mk.st[m - 1];
        B *= mk.bd[m] / mk.bd[m - 1];
        put += monthly;
        if (who === 'panic') {
          if (m === fallM && !out) { C += S + B; S = 0; B = 0; out = true; }
          if (out) C += monthly; else { S += monthly * target; B += monthly * (1 - target); }
        } else if (who === 'freeze') {
          if (mk.st[m] < peak - 1e-9) C += monthly;
          else { S += (monthly + C) * target; B += (monthly + C) * (1 - target); C = 0; }
        } else {
          S += monthly * target; B += monthly * (1 - target);
          if (who === 'band') {
            var tot = S + B;
            if (Math.abs(S / tot - target) > band) { S = tot * target; B = tot * (1 - target); trades++; }
          }
        }
        peak = Math.max(peak, mk.st[m]);
        var v = S + B + C;
        low = Math.min(low, v);
        path.push([m / 12, v]);
      }
      return { final: S + B + C, put: put, path: path, low: low, trades: trades };
    }
  };
  if (typeof window === 'undefined') { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;
  var t = V.texts({
    es: {
      amt: 'Lo que tenés invertido', share: 'Parte en acciones', shareHint: 'El resto, en bonos.',
      sf: 'Caída de las acciones', sfHint: 'De pico a piso. En 2007 a 2009 el S&P 500 cayó cerca de 57%.',
      bm: 'Movimiento de los bonos en ese tiempo', bmHint: 'En una crisis los bonos de buena calidad suelen moverse poco; a veces suben.',
      loss: 'Lo que perdés, en plata', lossP: 'Lo que perdés, en porcentaje', left: 'Lo que te queda', need: 'Suba que necesitás para volver',
      q: 'Tus {a} pasarían a ser {b}. ¿Podrías mirar este número sin vender?',
      before: 'antes', after: 'en el piso', stocks: 'acciones', bonds: 'bonos', lost: 'perdido',
      barL: 'Barras con tu portafolio antes de la caída y en el piso',
      capA: 'La cuenta: lo que tenés en acciones por la caída, más lo que tenés en bonos por su movimiento. La suba necesaria es lo que tenías dividido lo que te queda, menos uno. No hay costos ni impuestos, y es una foto en el piso: si no vendés, la pérdida todavía no es definitiva.',
      fall: 'Cuánto caen las acciones', rec: 'Años que tardan en volver al pico', recHint: 'Después de volver siguen creciendo 7% por año.',
      mon: 'Aporte por mes', monHint: 'Todos empiezan con $10.000, en 60% acciones y 40% bonos.',
      panic: 'Vende en el piso y se queda afuera', freeze: 'No vende, pero deja de aportar hasta que vuelve', keep: 'Sigue aportando', band: 'Sigue aportando y rebalancea con bandas de 5 puntos',
      put: 'Lo que puso cada uno, en total', putL: 'lo aportado', fin: 'Valor final de quien: {w}',
      chart: 'Valor del portafolio de cuatro personas durante una caída simulada', xL: 'años', yL: 'valor del portafolio',
      bottom: 'piso', back: 'vuelve al pico',
      capB: 'Simulación con supuestos, no historia: las acciones caen {f} en 18 meses a un ritmo parejo, vuelven al pico en {r} años y después crecen 7% por año; los bonos crecen 2% por año todo el tiempo; el efectivo rinde 0%. Sin costos ni impuestos. Los mercados reales no son tan prolijos: caen a los saltos y nadie avisa dónde está el piso.'
    },
    en: {
      amt: 'What you have invested', share: 'Share in stocks', shareHint: 'The rest in bonds.',
      sf: 'Stock fall', sfHint: 'Peak to trough. In 2007 to 2009 the S&P 500 fell about 57%.',
      bm: 'Bond move over the same time', bmHint: 'In a crisis, high-quality bonds tend to move little; sometimes they rise.',
      loss: 'What you lose, in money', lossP: 'What you lose, in percent', left: 'What you have left', need: 'Rise you need to get back',
      q: 'Your {a} would become {b}. Could you look at this number without selling?',
      before: 'before', after: 'at the bottom', stocks: 'stocks', bonds: 'bonds', lost: 'lost',
      barL: 'Bars with your portfolio before the fall and at the bottom',
      capA: 'The math: what you have in stocks times the fall, plus what you have in bonds times their move. The rise you need is what you had divided by what is left, minus one. No costs or taxes, and it is a snapshot at the bottom: if you do not sell, the loss is not final yet.',
      fall: 'How much stocks fall', rec: 'Years they take to get back to the peak', recHint: 'After that they keep growing 7% a year.',
      mon: 'Monthly contribution', monHint: 'Everyone starts with $10,000, in 60% stocks and 40% bonds.',
      panic: 'Sells at the bottom and stays out', freeze: 'Does not sell, but stops contributing until it is back', keep: 'Keeps contributing', band: 'Keeps contributing and rebalances with 5-point bands',
      put: 'What each one put in, in total', putL: 'put in', fin: 'Final value for: {w}',
      chart: 'Portfolio value of four people during a simulated crash', xL: 'years', yL: 'portfolio value',
      bottom: 'bottom', back: 'back at the peak',
      capB: 'A simulation with assumptions, not history: stocks fall {f} over 18 months at a steady pace, get back to the peak in {r} years and then grow 7% a year; bonds grow 2% a year the whole time; cash earns 0%. No costs or taxes. Real markets are not this tidy: they fall in jumps and nobody announces where the bottom is.'
    },
    pt: {
      amt: 'O que você tem investido', share: 'Parte em ações', shareHint: 'O resto em títulos.',
      sf: 'Queda das ações', sfHint: 'Do pico ao fundo. De 2007 a 2009 o S&P 500 caiu cerca de 57%.',
      bm: 'Movimento dos títulos no mesmo período', bmHint: 'Numa crise, títulos de boa qualidade costumam se mover pouco; às vezes sobem.',
      loss: 'O que você perde, em dinheiro', lossP: 'O que você perde, em porcentagem', left: 'O que sobra', need: 'Alta que você precisa para voltar',
      q: 'Seus {a} virariam {b}. Você conseguiria olhar para esse número sem vender?',
      before: 'antes', after: 'no fundo', stocks: 'ações', bonds: 'títulos', lost: 'perdido',
      barL: 'Barras com o seu portfólio antes da queda e no fundo',
      capA: 'A conta: o que você tem em ações vezes a queda, mais o que você tem em títulos vezes o movimento deles. A alta necessária é o que você tinha dividido pelo que sobrou, menos um. Sem custos nem impostos, e é uma foto no fundo: se você não vender, a perda ainda não é definitiva.',
      fall: 'Quanto as ações caem', rec: 'Anos que levam para voltar ao pico', recHint: 'Depois disso continuam crescendo 7% ao ano.',
      mon: 'Aporte por mês', monHint: 'Todos começam com $10.000, em 60% ações e 40% títulos.',
      panic: 'Vende no fundo e fica de fora', freeze: 'Não vende, mas para de aportar até voltar', keep: 'Continua aportando', band: 'Continua aportando e rebalanceia com bandas de 5 pontos',
      put: 'O que cada um colocou, no total', putL: 'aportado', fin: 'Valor final de quem: {w}',
      chart: 'Valor do portfólio de quatro pessoas durante uma queda simulada', xL: 'anos', yL: 'valor do portfólio',
      bottom: 'fundo', back: 'volta ao pico',
      capB: 'Simulação com suposições, não história: as ações caem {f} em 18 meses num ritmo constante, voltam ao pico em {r} anos e depois crescem 7% ao ano; os títulos crescem 2% ao ano o tempo todo; o dinheiro parado rende 0%. Sem custos nem impostos. Os mercados reais não são tão organizados: caem aos saltos e ninguém avisa onde está o fundo.'
    }
  });
  var money = function (v) { return fmt.money(v, 0); };
  var p0 = function (x) { return fmt.pct(x, 0); };

  // ---------- widget 1: your crash in money ----------
  V.mount('crash-money', function (root) {
    var aS = V.slider({ id: 'amt', label: t('amt'), min: 1000, max: 100000, step: 1000, value: 10000, format: money, onInput: paint });
    var shS = V.slider({ id: 'share', label: t('share'), min: 0, max: 100, step: 5, value: 60, format: function (v) { return v + '%'; }, hint: t('shareHint'), onInput: paint });
    var fS = V.slider({ id: 'sfall', label: t('sf'), min: 10, max: 80, step: 5, value: 50, format: function (v) { return '-' + v + '%'; }, hint: t('sfHint'), onInput: paint });
    var bS = V.slider({ id: 'bmove', label: t('bm'), min: -10, max: 10, step: 1, value: 0, format: function (v) { return (v > 0 ? '+' : '') + v + '%'; }, hint: t('bmHint'), onInput: paint });
    var oL = V.readout(t('loss')), oP = V.readout(t('lossP')), oA = V.readout(t('left')), oN = V.readout(t('need'));
    var q = V.h('p', { 'class': 'viz-q' });
    var W = 640, H = 176;
    var svg = V.s('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'viz-svg', role: 'img', 'aria-label': t('barL') });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [aS.el, shS.el, fS.el, bS.el]),
      V.h('div', { 'class': 'viz-outs' }, [oL.el, oP.el, oA.el, oN.el])
    ]));
    root.appendChild(q);
    root.appendChild(svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('stocks') }, { cls: 'd', label: t('bonds') }, { cls: 'bad', dash: true, label: t('lost') }]));
    root.appendChild(V.h('p', { 'class': 'viz-cap', text: t('capA') }));

    function bar(y, parts, total, label, full) {
      var x0 = 110, w = W - x0 - 20, x = x0;
      svg.appendChild(V.s('text', { x: x0 - 10, y: y + 26, 'class': 'viz-note strong', 'text-anchor': 'end', text: label }));
      parts.forEach(function (p) {
        var pw = total > 0 ? w * Math.max(0, p.v) / total : 0;
        svg.appendChild(V.s('rect', { x: x, y: y, width: pw, height: 40, 'class': 'dot-' + p.cls }));
        x += pw;
      });
      if (full && x < x0 + w - 0.5) svg.appendChild(V.s('rect', { x: x, y: y, width: x0 + w - x, height: 40, 'class': 'ln-bad dash' }));
      return x;
    }
    function paint() {
      var amount = aS.get(), r = M.crash(amount, shS.get() / 100, -fS.get() / 100, bS.get() / 100);
      oL.set(r.loss >= 0 ? '-' + money(r.loss) : '+' + money(-r.loss), r.loss > 0 ? 'bad' : 'good');
      oP.set(r.lossPct >= 0 ? '-' + fmt.pct(r.lossPct, 1) : '+' + fmt.pct(-r.lossPct, 1), r.lossPct > 0 ? 'bad' : 'good');
      oA.set(money(r.after));
      oN.set(r.need > 0 ? '+' + fmt.pct(r.need, 1) : fmt.pct(0, 0));
      q.textContent = t('q', { a: money(amount), b: money(r.after) });
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var top = Math.max(amount, r.after);
      bar(18, [{ v: r.s, cls: 'a' }, { v: r.b, cls: 'd' }], top, t('before'), false);
      bar(96, [{ v: r.sAfter, cls: 'a' }, { v: r.bAfter, cls: 'd' }], top, t('after'), r.after < amount);
      svg.appendChild(V.s('text', { x: 110, y: 78, 'class': 'viz-note', text: money(amount) }));
      svg.appendChild(V.s('text', { x: 110, y: 156, 'class': 'viz-note', text: money(r.after) + ' (' + (r.lossPct > 0 ? '-' : '+') + p0(Math.abs(r.lossPct)) + ')' }));
    }
    paint();
  });

  // ---------- widget 2: four behaviours in a stylized crash ----------
  var WHO = [
    { k: 'panic', cls: 'bad' },
    { k: 'freeze', cls: 'c' },
    { k: 'keep', cls: 'b' },
    { k: 'band', cls: 'a' }
  ];
  V.mount('crash-paths', function (root) {
    var MONTHS = 96, FALL_M = 18, START = 10000, TARGET = 0.6;
    var fS = V.slider({ id: 'fall', label: t('fall'), min: 20, max: 60, step: 5, value: 50, format: function (v) { return '-' + v + '%'; }, onInput: paint });
    var rS = V.slider({ id: 'rec', label: t('rec'), min: 2, max: 6, step: 0.5, value: 4.5, format: function (v) { return fmt.num(v, 1); }, hint: t('recHint'), onInput: paint });
    var mS = V.slider({ id: 'mon', label: t('mon'), min: 0, max: 500, step: 25, value: 100, format: money, hint: t('monHint'), onInput: paint });
    var outs = WHO.map(function (w) { return V.readout(t('fin', { w: t(w.k) })); });
    var oPut = V.readout(t('put'));
    var chart = V.chart({ width: 640, height: 320, pad: { l: 72 }, xLabel: t('xL'), yLabel: t('yL'), label: t('chart'), xFmt: fmt.int, yFmt: function (v) { return money(v); } });
    var cap = V.h('p', { 'class': 'viz-cap' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [fS.el, rS.el, mS.el]),
      V.h('div', { 'class': 'viz-outs' }, outs.map(function (o) { return o.el; }).concat([oPut.el]))
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend(WHO.map(function (w) { return { cls: w.cls, label: t(w.k) }; })));
    root.appendChild(cap);

    function paint() {
      var fall = fS.get() / 100, recM = Math.round(rS.get() * 12);
      var mk = M.market(MONTHS, fall, FALL_M, recM, 0.07, 0.02);
      var res = WHO.map(function (w) { return M.behave(mk, START, mS.get(), TARGET, w.k, FALL_M, 0.05); });
      var best = Math.max.apply(null, res.map(function (r) { return r.final; }));
      res.forEach(function (r, i) { outs[i].set(money(r.final), r.final === best ? 'good' : (WHO[i].k === 'panic' ? 'bad' : '')); });
      oPut.set(money(res[0].put), 'muted');
      var vl = [{ x: FALL_M / 12, label: t('bottom'), cls: 'muted' }];
      if (FALL_M + recM <= MONTHS) vl.push({ x: (FALL_M + recM) / 12, label: t('back'), cls: 'muted' });
      chart.draw({
        x: [0, MONTHS / 12], yZero: true,
        series: res.map(function (r, i) { return { pts: r.path, cls: WHO[i].cls, width: WHO[i].k === 'band' ? 3 : 2.5, dash: WHO[i].k === 'freeze' }; }),
        hlines: [{ y: res[0].put, cls: 'muted' }],
        vlines: vl,
        texts: [{ x: 0.08, y: res[0].put * 1.04, text: t('putL'), cls: 'muted' }]
      });
      chart.describe(t('chart') + ': ' + WHO.map(function (w, i) { return t(w.k) + ' ' + money(res[i].final); }).join('; '));
      cap.textContent = t('capB', { f: fS.get() + '%', r: fmt.num(rS.get(), 1) });
    }
    paint();
  });
})();
