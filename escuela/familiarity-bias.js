// Widgets for "Conocer una empresa no es tener ventaja" (familiarity bias).
//   doble-golpe:    employer-stock concentration. A company shock hits the shares you
//                   hold and your paycheck at the same time. Compares it with the same
//                   person holding none of the employer's shares.
//   tres-preguntas: the three-question self-check, with a verdict.
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  // o = {savings, share (0..1 in employer), drop (0..1 company shock), salary (per month),
  //      months (without pay), expenses (per month)}
  // Simplification: the rest of the savings does not move, and in the diversified case
  // the same job loss happens but no savings are in the employer.
  function doubleHit(o) {
    var stockLoss = o.savings * o.share * o.drop;
    var incomeLoss = o.salary * o.months;
    var spent = o.expenses * o.months;   // living costs paid from savings while without pay
    var leftConc = Math.max(0, o.savings - stockLoss - spent);
    var leftDiv = Math.max(0, o.savings - spent);
    return {
      stockLoss: stockLoss, incomeLoss: incomeLoss, spent: spent,
      totalHit: stockLoss + incomeLoss,
      leftConc: leftConc, leftDiv: leftDiv,
      runwayConc: o.expenses > 0 ? leftConc / o.expenses : Infinity,
      runwayDiv: o.expenses > 0 ? leftDiv / o.expenses : Infinity
    };
  }
  // a = [knows (bool), thesisExit (bool), salarySame (bool)] -> verdict key
  function verdict(a) {
    if (!a[0]) return a[2] ? 'biasDouble' : 'bias';
    if (!a[1]) return 'priceExit';
    return a[2] ? 'informedDouble' : 'informed';
  }

  var API = { doubleHit: doubleHit, verdict: verdict };
  if (typeof module === 'object' && module.exports) module.exports = API;

  var V = typeof window !== 'undefined' && window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  var t = V.texts({
    es: {
      savings: 'Tus ahorros', share: 'Parte de tus ahorros en acciones de tu empresa', drop: 'Cuánto cae la acción en el año malo',
      salary: 'Tu sueldo por mes', months: 'Meses sin sueldo si la empresa recorta', expenses: 'Tus gastos por mes',
      shareHint: 'Incluye acciones que te dio la empresa y las que compraste vos.',
      monthsHint: 'Cero si creés que tu trabajo no corre peligro. Es un supuesto tuyo.',
      oStock: 'Lo que perdés en los ahorros', oIncome: 'El sueldo que dejás de cobrar', oTotal: 'Golpe total, el mismo año',
      oLeft: 'Ahorros al final: con / sin acciones de tu empresa', vs: '{a} / {b}',
      rowC: 'Con acciones de tu empresa', rowD: 'Sin acciones de tu empresa',
      kLeft: 'te queda', kStock: 'perdido en la acción', kSpent: 'gastado sin sueldo',
      cap: 'Con estos números, el mismo mal año de tu empresa te saca {a} de los ahorros y {b} de sueldo. Tu colchón final alcanza para {c} meses de gastos, contra {d} si nada estuviera en tu empresa.',
      capZero: 'Con cero meses sin sueldo, el golpe queda solo en los ahorros. Probá subir los meses: así se ve cuando trabajo y ahorros dependen de la misma empresa.',
      sim: 'Simulación con supuestos tuyos. Simplificación: el resto de tus ahorros no se mueve. En una crisis real, el resto del mercado también puede caer.',
      inf: 'sin límite', label: 'Ahorros al final en los dos casos'
    },
    en: {
      savings: 'Your savings', share: 'Share of your savings in your employer\'s stock', drop: 'How much the stock falls in the bad year',
      salary: 'Your monthly pay', months: 'Months without pay if the company cuts jobs', expenses: 'Your monthly expenses',
      shareHint: 'Include shares the company gave you and shares you bought yourself.',
      monthsHint: 'Zero if you think your job is safe. It is your assumption.',
      oStock: 'What you lose in savings', oIncome: 'Pay you stop receiving', oTotal: 'Total hit, in the same year',
      oLeft: 'Savings at the end: with / without employer stock', vs: '{a} / {b}',
      rowC: 'With employer stock', rowD: 'With no employer stock',
      kLeft: 'left', kStock: 'lost in the stock', kSpent: 'spent without pay',
      cap: 'With these numbers, the same bad year at your company takes {a} out of your savings and {b} out of your pay. Your final cushion covers {c} months of expenses, against {d} if none of it were in your employer.',
      capZero: 'With zero months without pay, the hit stays in your savings only. Try raising the months: that is what it looks like when job and savings depend on the same company.',
      sim: 'Simulation with your own assumptions. Simplification: the rest of your savings does not move. In a real crisis, the rest of the market can fall too.',
      inf: 'no limit', label: 'Savings at the end in both cases'
    },
    pt: {
      savings: 'Suas economias', share: 'Parte das suas economias em ações da sua empresa', drop: 'Quanto a ação cai no ano ruim',
      salary: 'Seu salário por mês', months: 'Meses sem salário se a empresa cortar', expenses: 'Seus gastos por mês',
      shareHint: 'Inclui ações que a empresa te deu e as que você comprou.',
      monthsHint: 'Zero se você acha que seu emprego não corre risco. É uma premissa sua.',
      oStock: 'O que você perde nas economias', oIncome: 'O salário que você deixa de receber', oTotal: 'Golpe total, no mesmo ano',
      oLeft: 'Economias no fim: com / sem ações da sua empresa', vs: '{a} / {b}',
      rowC: 'Com ações da sua empresa', rowD: 'Sem ações da sua empresa',
      kLeft: 'sobra', kStock: 'perdido na ação', kSpent: 'gasto sem salário',
      cap: 'Com esses números, o mesmo ano ruim da sua empresa tira {a} das suas economias e {b} de salário. Sua reserva final dá para {c} meses de gastos, contra {d} se nada estivesse na sua empresa.',
      capZero: 'Com zero meses sem salário, o golpe fica só nas economias. Tente subir os meses: é assim que fica quando emprego e economias dependem da mesma empresa.',
      sim: 'Simulação com premissas suas. Simplificação: o resto das suas economias não se mexe. Em uma crise real, o resto do mercado também pode cair.',
      inf: 'sem limite', label: 'Economias no fim nos dois casos'
    }
  });

  V.mount('doble-golpe', function (root) {
    var st = {};
    function sl(id, min, max, step, value, f, hint) {
      var s = V.slider({ id: id, label: t(id), min: min, max: max, step: step, value: value, format: f, hint: hint,
        onInput: function (v) { st[id] = v; paint(); } });
      st[id] = s.get();
      return s;
    }
    var money = function (v) { return fmt.money(v); }, pct = function (v) { return v + '%'; };
    var sS = sl('savings', 1000, 100000, 1000, 20000, money);
    var sh = sl('share', 0, 100, 5, 40, pct, t('shareHint'));
    var dr = sl('drop', 10, 90, 5, 50, pct);
    var sa = sl('salary', 500, 10000, 100, 2000, money);
    var mo = sl('months', 0, 12, 1, 6, function (v) { return fmt.int(v); }, t('monthsHint'));
    var ex = sl('expenses', 300, 8000, 100, 1500, money);

    var oStock = V.readout(t('oStock')), oIncome = V.readout(t('oIncome')), oTotal = V.readout(t('oTotal')), oLeft = V.readout(t('oLeft'));
    var svg = V.s('svg', { viewBox: '0 0 640 170', 'class': 'viz-svg', role: 'img', 'aria-label': t('label') });
    var cap = V.h('p', { 'class': 'viz-cap' }), sim = V.h('p', { 'class': 'viz-cap', text: t('sim') });

    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [sS.el, sh.el, dr.el]),
      V.h('div', { 'class': 'viz-controls' }, [sa.el, mo.el, ex.el])
    ]));
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-outs' }, [oStock.el, oIncome.el]),
      V.h('div', { 'class': 'viz-outs' }, [oTotal.el, oLeft.el])
    ]));
    root.appendChild(svg);
    root.appendChild(cap);
    root.appendChild(sim);

    var COL = { left: 'var(--ny-accent)', stock: 'var(--ny-bad)', spent: 'var(--ny-muted)' };
    function bar(y, label, parts, total) {
      var X0 = 190, W = 430, x = X0, g = V.s('g', {});
      g.appendChild(V.s('text', { x: 0, y: y + 22, 'class': 'viz-note strong', text: label }));
      parts.forEach(function (p) {
        var w = total > 0 ? W * p.v / total : 0;
        if (w > 0.5) g.appendChild(V.s('rect', { x: x, y: y, width: w, height: 34, style: 'fill:' + COL[p.k] + ';opacity:' + (p.k === 'left' ? 0.85 : 0.7) }));
        x += w;
      });
      svg.appendChild(g);
    }
    function key(x, k, label) {
      svg.appendChild(V.s('rect', { x: x, y: 140, width: 14, height: 14, style: 'fill:' + COL[k] }));
      svg.appendChild(V.s('text', { x: x + 20, y: 152, 'class': 'viz-note', text: label }));
    }

    function paint() {
      var r = doubleHit({ savings: st.savings, share: st.share / 100, drop: st.drop / 100, salary: st.salary, months: st.months, expenses: st.expenses });
      oStock.set(fmt.money(r.stockLoss), r.stockLoss > 0 ? 'bad' : '');
      oIncome.set(fmt.money(r.incomeLoss), r.incomeLoss > 0 ? 'bad' : '');
      oTotal.set(fmt.money(r.totalHit), 'bad');
      oLeft.set(t('vs', { a: fmt.money(r.leftConc), b: fmt.money(r.leftDiv) }), r.leftConc < r.leftDiv ? 'bad' : '');
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var stock = Math.min(r.stockLoss, st.savings), spentC = Math.min(r.spent, st.savings - stock), spentD = Math.min(r.spent, st.savings);
      bar(10, t('rowC'), [{ k: 'left', v: r.leftConc }, { k: 'stock', v: stock }, { k: 'spent', v: spentC }], st.savings);
      bar(70, t('rowD'), [{ k: 'left', v: r.leftDiv }, { k: 'spent', v: spentD }], st.savings);
      key(190, 'left', t('kLeft')); key(330, 'stock', t('kStock')); key(500, 'spent', t('kSpent'));
      var rw = function (n) { return isFinite(n) ? fmt.num(n, 1) : t('inf'); };
      cap.textContent = st.months === 0 ? t('capZero') :
        t('cap', { a: fmt.money(r.stockLoss), b: fmt.money(r.incomeLoss), c: rw(r.runwayConc), d: rw(r.runwayDiv) });
      svg.setAttribute('aria-label', t('label') + ': ' + fmt.money(r.leftConc) + ' / ' + fmt.money(r.leftDiv));
    }
    paint();
  });

  // ---------- tres-preguntas ----------
  var Q = V.texts({
    es: {
      yes: 'Sí', no: 'No', out: 'Lo que dicen tus respuestas',
      q1: '1. ¿Sabés algo concreto del negocio que el mercado todavía no puso en el precio, lo tenés escrito y lo mantenés al día?',
      q2: '2. ¿Tu regla de salida habla del negocio (hechos que pueden fallar) y no solo de un precio?',
      q3: '3. ¿Tu sueldo depende de esa misma empresa?',
      pending: 'Contestá las tres preguntas.',
      bias: 'Se parece a sesgo de familiaridad. Conocer el producto o la marca no es información que el mercado no tenga. Si querés invertir igual, que sea una parte chica y decidida de antemano.',
      biasDouble: 'Sesgo de familiaridad con doble exposición. Sin una ventaja de información, y con el sueldo en la misma empresa, un mal año te pega dos veces. Es el caso más delicado de los cuatro.',
      priceExit: 'Tenés información, pero tu salida es un precio. Ahí se esconde la tesis que se desliza: escribí los hechos que te harían vender (ver la entrada sobre thesis creep).',
      informed: 'Se parece a concentración informada: tesis escrita, hechos que la refutarían y salida por el negocio. Falta lo último: decidir el tamaño antes, no después.',
      informedDouble: 'Concentración informada con doble exposición. Puede tener sentido, pero el tamaño va por regla, con un colchón que no dependa de tu empresa y revisado una vez por año.'
    },
    en: {
      yes: 'Yes', no: 'No', out: 'What your answers say',
      q1: '1. Do you know something concrete about the business that the market has not priced in yet, written down and kept up to date?',
      q2: '2. Is your exit rule about the business (facts that can fail) and not only a price?',
      q3: '3. Does your paycheck depend on that same company?',
      pending: 'Answer all three questions.',
      bias: 'This looks like familiarity bias. Knowing the product or the brand is not information the market lacks. If you want to invest anyway, keep it a small share, decided in advance.',
      biasDouble: 'Familiarity bias with double exposure. With no information edge, and with your pay at the same company, a bad year hits you twice. This is the most delicate of the four cases.',
      priceExit: 'You have information, but your exit is a price. That is where thesis creep hides: write down the facts that would make you sell (see the thesis creep entry).',
      informed: 'This looks like informed concentration: a written thesis, facts that would disprove it and an exit based on the business. One thing left: decide the size before, not after.',
      informedDouble: 'Informed concentration with double exposure. It can make sense, but the size follows a rule, with a cushion that does not depend on your company, reviewed once a year.'
    },
    pt: {
      yes: 'Sim', no: 'Não', out: 'O que suas respostas dizem',
      q1: '1. Você sabe algo concreto do negócio que o mercado ainda não colocou no preço, tem isso escrito e mantém atualizado?',
      q2: '2. Sua regra de saída fala do negócio (fatos que podem falhar) e não só de um preço?',
      q3: '3. Seu salário depende dessa mesma empresa?',
      pending: 'Responda as três perguntas.',
      bias: 'Parece viés de familiaridade. Conhecer o produto ou a marca não é informação que o mercado não tenha. Se quiser investir mesmo assim, que seja uma parte pequena e decidida antes.',
      biasDouble: 'Viés de familiaridade com dupla exposição. Sem vantagem de informação, e com o salário na mesma empresa, um ano ruim te atinge duas vezes. É o caso mais delicado dos quatro.',
      priceExit: 'Você tem informação, mas sua saída é um preço. É aí que a tese escorrega: escreva os fatos que te fariam vender (veja a entrada sobre thesis creep).',
      informed: 'Parece concentração informada: tese escrita, fatos que a refutariam e saída pelo negócio. Falta o último: decidir o tamanho antes, não depois.',
      informedDouble: 'Concentração informada com dupla exposição. Pode fazer sentido, mas o tamanho segue uma regra, com uma reserva que não dependa da sua empresa, revisada uma vez por ano.'
    }
  });

  V.mount('tres-preguntas', function (root) {
    var ans = [null, null, null];
    var out = V.h('p', { 'aria-live': 'polite', style: 'font-size:18px;line-height:1.5;margin:8px 0 0' });
    [1, 2, 3].forEach(function (n, i) {
      var seg = V.segmented({ id: 'q' + n, label: Q('q' + n), value: null,
        options: [{ v: 'y', label: Q('yes') }, { v: 'n', label: Q('no') }],
        onChange: function (v) { ans[i] = v === 'y'; paint(); } });
      var g = seg.get(); if (g === 'y' || g === 'n') ans[i] = g === 'y';
      root.appendChild(seg.el);
    });
    root.appendChild(V.h('div', { 'class': 'viz-out' }, [V.h('span', { text: Q('out') })]));
    root.appendChild(out);
    function paint() {
      if (ans.some(function (a) { return a === null; })) { out.textContent = Q('pending'); out.style.color = 'var(--ny-muted)'; return; }
      var k = verdict(ans);
      out.textContent = Q(k);
      out.style.color = k.indexOf('informed') === 0 ? 'var(--ny-ink)' : 'var(--ny-bad)';
    }
    paint();
  });
})();
