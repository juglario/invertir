// Shared engine for the "viento en popa" entries. Each page declares what it
// needs in markup (data-hero, data-calc with JSON defaults, .flip, .plan) and
// this file wires whatever is present. No dependencies, no network.
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  function fmt(n) { return Math.round(n).toLocaleString('es-AR'); }
  function money(n) { return '$' + fmt(n); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function svg(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function clamp(raw, min, max) {
    var v = parseFloat(raw);
    if (!isFinite(v)) v = min;
    return Math.min(max, Math.max(min, v));
  }
  function readDefaults(node) {
    try { return JSON.parse(node.getAttribute('data-defaults') || '{}'); } catch (e) { return {}; }
  }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  // ---------------- core math (exported for tests via window.VP) ----------------

  // Year-by-year balance with end-of-year flows: B <- B*(1+r) + income(t) - spend.
  function incomeFn(o) {
    return function (t) {
      if (t < o.years) return o.peak;
      return o.age + t < 65 ? o.after : 0;
    };
  }
  // Level real spend from now to planTo that leaves exactly zero at the end.
  function sustainableSpend(o) {
    var N = o.planTo - o.age, inc = incomeFn(o), r = o.r;
    var num = o.saved * Math.pow(1 + r, N), den = 0;
    for (var t = 0; t < N; t++) { num += inc(t) * Math.pow(1 + r, N - 1 - t); den += Math.pow(1 + r, N - 1 - t); }
    return num / den;
  }
  function path(o, spend) {
    var N = o.planTo - o.age, inc = incomeFn(o), b = o.saved, out = [], broke = null;
    for (var t = 0; t < N; t++) {
      b = b * (1 + o.r) + inc(t) - spend;
      if (b < 0 && broke === null) broke = o.age + t + 1;
      out.push(b);
    }
    return { balances: out, brokeAt: broke };
  }

  // Irregular income: 24 months, mean exactly 1. Starts with an 8-month bad
  // streak ("the algorithm changed"). Tuned so paying yourself 100% of the
  // average breaks a 3-salary cushion in month 7 and 80% never does.
  var CREATOR_PATTERN = [0.5, 0.6, 0.4, 0.7, 0.5, 0.6, 0.5, 0.7, 2.6, 1.1, 0.4, 1.9, 0.6, 2.4, 0.5, 1.3, 0.3, 1.8, 2.2, 0.6, 0.4, 1.5, 0.9, 1.0];
  function salaryRun(avg, taxPct, payPct) {
    var netAvg = avg * (1 - taxPct / 100);
    var salary = netAvg * payPct / 100;
    var buf = 3 * salary, min = buf, brokeAt = null, rows = [];
    CREATOR_PATTERN.forEach(function (k, i) {
      var income = avg * k;
      buf += income * (1 - taxPct / 100) - salary;
      // tiny epsilon so a cushion that lands exactly on zero is not "broke"
      if (buf < -0.005 * Math.max(1, salary) && brokeAt === null) brokeAt = i + 1;
      if (buf < min) min = buf;
      rows.push({ income: income, buf: buf });
    });
    return { salary: salary, startBuf: 3 * salary, min: min, brokeAt: brokeAt, end: buf, rows: rows };
  }

  function yearsToReach(target, saved, perYear, r) {
    var b = saved;
    if (b >= target) return 0;
    for (var n = 1; n <= 100; n++) { b = b * (1 + r) + perYear; if (b >= target) return n; }
    return null;
  }

  function windfallYears(W, spend, r) {
    var b = W;
    for (var t = 1; t <= 200; t++) { b = b * (1 + r) - spend; if (b < 0) return t; }
    return Infinity;
  }

  // The memo's plan, month by month: the saved slice fills the cushion first,
  // then goes to the investment fund, compounding monthly at the equivalent of
  // the yearly real rate. Reports milestones (5/10/20 years from today), the
  // age the goal (20 years of spending) is reached and how much of it the
  // market put in. Never loops more than 100 years.
  function memoPlan(o) {
    var per = o.salary * o.pct / 100;
    var cushion = o.spend * o.months, goal = o.spend * 12 * 20;
    var rm = Math.pow(1 + o.r, 1 / 12) - 1;
    var cush = Math.min(o.saved, cushion), inv = Math.max(0, o.saved - cushion), put = inv;
    var cushionMonth = cush >= cushion ? 0 : null, goalMonth = inv >= goal && cushionMonth === 0 ? 0 : null;
    var goalPut = put, goalBal = inv, at = {}, to65 = Math.max(0, Math.round((65 - o.age) * 12)), at65 = to65 === 0 ? inv : null;
    for (var m = 1; m <= 1200 && (goalMonth === null || m <= 240 || m <= to65); m++) {
      var rest = per;
      if (cush < cushion) {
        var add = Math.min(per, cushion - cush);
        cush += add; rest -= add;
        if (cush >= cushion && cushionMonth === null) cushionMonth = m;
      }
      inv = inv * (1 + rm) + rest; put += rest;
      if (m === 60 || m === 120 || m === 240) at[m / 12] = inv;
      if (m === to65) at65 = inv;
      if (goalMonth === null && inv >= goal) { goalMonth = m; goalPut = put; goalBal = inv; }
    }
    return {
      perMonth: per, left: o.salary - per, cushion: cushion, goal: goal,
      cushionMonth: cushionMonth, milestones: at, at65: at65,
      goalMonth: goalMonth,
      goalAge: goalMonth === null ? null : o.age + goalMonth / 12,
      marketShare: goalMonth === null || goalBal <= 0 ? 0 : Math.max(0, (goalBal - goalPut) / goalBal),
    };
  }

  window.VP = { sustainableSpend: sustainableSpend, path: path, salaryRun: salaryRun, yearsToReach: yearsToReach, windfallYears: windfallYears, memoPlan: memoPlan, CREATOR_PATTERN: CREATOR_PATTERN };

  // ---------------- controls ----------------

  function control(label, o) {
    var wrap = el('div', 'ctl');
    var top = el('div', 'ctl-top');
    var id = 'vp' + (++uid);
    var lab = el('label', 'ctl-label', label);
    lab.htmlFor = id;
    var hardMax = o.hardMax || o.max;
    var num = document.createElement('input');
    num.type = 'number'; num.id = id; num.className = 'ctl-num'; num.inputMode = 'decimal';
    num.min = o.min; num.max = hardMax; num.step = o.step; num.value = o.value;
    top.appendChild(lab); top.appendChild(num);
    var range = document.createElement('input');
    range.type = 'range'; range.className = 'ctl-range';
    range.min = o.min; range.max = o.max; range.step = o.step; range.value = Math.min(o.value, o.max);
    range.setAttribute('aria-label', label);
    wrap.appendChild(top); wrap.appendChild(range);
    var api = { wrap: wrap, onChange: function () {} };
    api.get = function () { return clamp(num.value, o.min, hardMax); };
    function paint() { range.style.setProperty('--fill', ((Number(range.value) - o.min) / (o.max - o.min)) * 100 + '%'); }
    range.addEventListener('input', function () { num.value = range.value; paint(); api.onChange(); });
    num.addEventListener('input', function () { range.value = Math.min(api.get(), o.max); paint(); api.onChange(); });
    paint();
    return api;
  }
  // Money slider scaled from a profile's default value.
  function moneyControl(label, value, minVal) {
    var step = Math.max(1, Math.pow(10, Math.floor(Math.log10(Math.max(value, 10))) - 1));
    return control(label, { min: minVal || 0, max: Math.max(value * 4, step * 20), step: step, value: value, hardMax: 1e12 });
  }
  function out(label, main) {
    var b = el('div', 'out' + (main ? ' main' : ''));
    b.appendChild(el('span', 'out-l', label));
    var v = el('span', 'out-v');
    b.appendChild(v);
    return { box: b, val: v, label: b.firstChild };
  }
  function shell(node, title, desc) {
    node.innerHTML = '';
    node.classList.add('calc');
    node.appendChild(el('h3', null, title));
    node.appendChild(el('p', 'desc', desc));
    var grid = el('div', 'calc-grid');
    var left = el('div'), right = el('div', 'outs');
    grid.appendChild(left); grid.appendChild(right);
    node.appendChild(grid);
    return { left: left, right: right };
  }
  // items: [[swatchClass, label], ...]
  function legend(items) {
    var box = el('div', 'legend');
    items.forEach(function (it) {
      var item = el('span');
      item.appendChild(el('i', it[0]));
      item.appendChild(document.createTextNode(it[1]));
      box.appendChild(item);
    });
    return box;
  }
  function wire(ctls, fn) { ctls.forEach(function (c) { c.onChange = fn; }); fn(); }

  // ---------------- calculators ----------------

  function lifetimeCalc(node, d) {
    var s = shell(node, d.title || '¿Cuánto podés gastar de verdad?', d.desc || 'Lo que ganás en pocos años tiene que alcanzarte para toda la vida. Mové los números.');
    var cAge = control('Tu edad', { min: 15, max: 60, step: 1, value: d.age || 22, hardMax: 80 });
    var cYears = control('Años que te quedan ganando así', { min: 1, max: 25, step: 1, value: d.years || 8, hardMax: 45 });
    var cPeak = moneyControl('Lo que te queda por año, después de impuestos', d.peak || 300000);
    var cAfter = moneyControl('Lo que ganarías por año después (otro trabajo, hasta los 65)', d.after || 30000);
    var cSpend = moneyControl('Lo que gastás por año hoy', d.spend || 180000);
    var cSaved = moneyControl('Lo que ya tenés ahorrado', d.saved || 0);
    [cAge, cYears, cPeak, cAfter, cSpend, cSaved].forEach(function (c) { s.left.appendChild(c.wrap); });
    var oS = out('Podés gastar por año, toda la vida (hasta los 90)', true);
    var oB = out('Con lo que gastás hoy, la plata te alcanza');
    var oX = out('Diferencia entre lo que gastás y lo que podés');
    [oS, oB, oX].forEach(function (o) { s.right.appendChild(o.box); });
    var chart = el('div', 'chart');
    node.appendChild(chart);
    node.appendChild(legend([['sw bad', 'Ahorro si seguís gastando igual'], ['sw gold', 'Ahorro gastando lo sostenible']]));
    node.appendChild(el('p', 'fine', 'Todo en plata de hoy, con un rendimiento de 3% por año por encima de la inflación. No incluye jubilación ni herencias. Es un mapa, no una promesa.'));

    wire([cAge, cYears, cPeak, cAfter, cSpend, cSaved], function () {
      var age = Math.round(cAge.get());
      var o = { age: age, years: Math.round(cYears.get()), peak: cPeak.get(), after: cAfter.get(), saved: cSaved.get(), r: 0.03, planTo: Math.max(age + 1, 90) };
      var S = sustainableSpend(o);
      var spend = cSpend.get();
      var now = path(o, spend), safe = path(o, S);
      oS.val.textContent = money(Math.max(0, S));
      if (now.brokeAt) { oB.val.textContent = 'hasta los ' + now.brokeAt + ' años'; oB.val.className = 'out-v bad'; }
      else { oB.val.textContent = 'toda la vida'; oB.val.className = 'out-v good'; }
      var gap = spend - S;
      oX.val.textContent = (gap > 0 ? 'gastás ' + money(gap) + ' de más' : 'te sobran ' + money(-gap)) + ' por año';
      oX.val.className = 'out-v ' + (gap > 0 ? 'bad' : 'good');
      drawLifetime(chart, o, now, safe);
    });
  }

  function drawLifetime(container, o, now, safe) {
    var W = 900, H = 230, top = 10;
    var max = 1;
    now.balances.concat(safe.balances).forEach(function (b) { if (b > max) max = b; });
    var N = now.balances.length;
    var x = function (i) { return ((i + 1) / N) * W; };
    var y = function (b) { return top + (H - top) - (Math.max(0, b) / max) * (H - top); };
    var line = function (bal) {
      return bal.map(function (b, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(b).toFixed(1); }).join(' ');
    };
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 26), role: 'img', 'aria-hidden': 'true' });
    s.appendChild(svg('line', { x1: 0, y1: H, x2: W, y2: H, class: 'c-zero' }));
    s.appendChild(svg('path', { d: line(safe.balances), class: 'c-line gold' }));
    s.appendChild(svg('path', { d: line(now.balances), class: 'c-line bad' }));
    [o.age, Math.round((o.age + o.planTo) / 2), o.planTo].forEach(function (a, i) {
      var xi = i === 0 ? 0 : i === 2 ? W : x(a - o.age - 1);
      s.appendChild(svg('text', { x: xi, y: H + 20, class: 'c-label', 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle' }, a + ' años'));
    });
    if (now.brokeAt) {
      var bx = x(now.brokeAt - o.age - 1);
      s.appendChild(svg('circle', { cx: bx, cy: H, r: 6, class: 'c-mark' }));
      s.appendChild(svg('text', { x: Math.min(W - 4, bx + 10), y: H - 10, class: 'c-label bad' }, 'se terminó a los ' + now.brokeAt));
    }
    container.innerHTML = '';
    container.appendChild(s);
  }

  function salaryCalc(node, d) {
    var s = shell(node, d.title || 'Pagate un sueldo', d.desc || 'Todo lo que cobrás entra a una cuenta "empresa". De ahí, separás impuestos y te pagás un sueldo fijo a vos. Probá cuánto te podés pagar.');
    var cAvg = moneyControl('Lo que cobrás por mes, en promedio', d.avg || 3000);
    var cTax = control('Impuestos que tenés que separar (%)', { min: 0, max: 50, step: 1, value: d.tax || 25, hardMax: 60 });
    var cPay = control('Qué parte del promedio te pagás de sueldo (%)', { min: 50, max: 120, step: 5, value: d.pay || 100, hardMax: 120 });
    [cAvg, cTax, cPay].forEach(function (c) { s.left.appendChild(c.wrap); });
    var oSal = out('Tu sueldo fijo por mes', true);
    var oMin = out('Lo peor que le pasó a tu colchón en 24 meses');
    var oEnd = out('Lo que te sobró para invertir al final');
    [oSal, oMin, oEnd].forEach(function (o) { s.right.appendChild(o.box); });
    var chart = el('div', 'chart');
    node.appendChild(chart);
    node.appendChild(legend([['sw box', 'Lo que cobraste cada mes'], ['sw gold', 'Tu sueldo fijo'], ['sw', 'Tu colchón']]));
    node.appendChild(el('p', 'fine', 'Simulación de 24 meses con meses buenos y malos, que arranca con una mala racha. El colchón empieza con 3 sueldos. Promedio de los 24 meses: exactamente lo que pusiste arriba.'));

    wire([cAvg, cTax, cPay], function () {
      var run = salaryRun(cAvg.get(), cTax.get(), cPay.get());
      oSal.val.textContent = money(run.salary);
      if (run.brokeAt) { oMin.val.textContent = 'te quedaste sin plata en el mes ' + run.brokeAt; oMin.val.className = 'out-v bad'; }
      else { oMin.val.textContent = 'bajó hasta ' + money(Math.max(0, run.min)) + ', nunca a cero'; oMin.val.className = 'out-v good'; }
      oEnd.val.textContent = money(Math.max(0, run.end - run.startBuf));
      oEnd.val.className = 'out-v';
      drawSalary(chart, run);
    });
  }

  function drawSalary(container, run) {
    var W = 900, H = 220;
    var max = 1;
    run.rows.forEach(function (r) { max = Math.max(max, r.income, Math.abs(r.buf)); });
    max = Math.max(max, run.salary);
    var n = run.rows.length, bw = W / n;
    var zero = H * 0.78;
    var scale = function (v) { return (v / max) * zero * 0.95; };
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 8), role: 'img', 'aria-hidden': 'true' });
    run.rows.forEach(function (r, i) {
      var h = scale(r.income);
      s.appendChild(svg('rect', { x: i * bw + bw * 0.15, y: zero - h, width: bw * 0.7, height: h, rx: 2, class: 'c-bar' }));
    });
    s.appendChild(svg('line', { x1: 0, y1: zero, x2: W, y2: zero, class: 'c-zero' }));
    var sy = zero - scale(run.salary);
    s.appendChild(svg('line', { x1: 0, y1: sy, x2: W, y2: sy, class: 'c-line gold' }));
    var d = run.rows.map(function (r, i) { return (i ? 'L' : 'M') + (i * bw + bw / 2).toFixed(1) + ',' + (zero - scale(r.buf)).toFixed(1); }).join(' ');
    s.appendChild(svg('path', { d: d, class: 'c-line' + (run.brokeAt ? ' bad' : '') }));
    if (run.brokeAt) {
      var bx = (run.brokeAt - 1) * bw + bw / 2;
      s.appendChild(svg('circle', { cx: bx, cy: zero - scale(run.rows[run.brokeAt - 1].buf), r: 6, class: 'c-mark' }));
    }
    container.innerHTML = '';
    container.appendChild(s);
  }

  function freedomCalc(node, d) {
    var s = shell(node, d.title || 'Tu número de libertad', d.desc || 'Cuánta plata necesitás para que tu tren de vida se pague solo, para siempre, sin trabajar.');
    var cSpend = moneyControl('Lo que querés gastar por año, para siempre', d.spend || 60000);
    var cSave = moneyControl('Lo que podés ahorrar por año', d.save || 100000);
    var cHave = moneyControl('Lo que ya tenés', d.saved || 0);
    [cSpend, cSave, cHave].forEach(function (c) { s.left.appendChild(c.wrap); });
    var oN = out('Tu número (retiro de 3,5% por año)', true);
    var oN4 = out('Versión menos prudente (4% por año)');
    var oY = out('Ahorrando eso por año, llegás en');
    [oN, oN4, oY].forEach(function (o) { s.right.appendChild(o.box); });
    node.appendChild(el('p', 'fine', 'La "regla del 4%" sale de estudios con datos de Estados Unidos: retirar 4% por año, ajustado por inflación, alcanzó para 30 años en casi todos los períodos de la historia. Si te retirás joven y la plata tiene que durar 50 años o más, conviene algo más prudente, como 3 a 3,5%. Llegar se calcula con un 3% por año por encima de la inflación.'));
    wire([cSpend, cSave, cHave], function () {
      var target = cSpend.get() / 0.035;
      oN.val.textContent = money(target);
      oN4.val.textContent = money(cSpend.get() / 0.04);
      var yrs = yearsToReach(target, cHave.get(), cSave.get(), 0.03);
      oY.val.textContent = yrs === 0 ? 'ya llegaste' : yrs === null ? 'más de 100 años: hay que ahorrar más o gastar menos' : yrs + (yrs === 1 ? ' año' : ' años');
      oY.val.className = 'out-v ' + (yrs === null ? 'bad' : yrs <= 15 ? 'good' : '');
    });
  }

  function memoCalc(node, d) {
    var s = shell(node, d.title || 'Tu plan, con tus números', d.desc || 'Todo en dólares de hoy. Primero se llena el colchón y después arranca el fondo de inversión.');
    var cAge = control('Tu edad', { min: 16, max: 70, step: 1, value: d.age || 25 });
    var cSalary = moneyControl('Tu sueldo neto por mes', d.salary || 1500);
    var cPct = control('Qué porcentaje separás el día que cobrás', { min: 0, max: 50, step: 1, value: d.pct != null ? d.pct : 20 });
    var cSpend = moneyControl('Lo que gastás por mes', d.spend || 1000);
    var cMonths = control('Meses de gastos en el colchón', { min: 3, max: 24, step: 1, value: d.months || 6 });
    var cSaved = moneyControl('Lo que ya tenés ahorrado', d.saved || 0);
    var cR = control('Rendimiento por año, por encima de la inflación (%)', { min: 0, max: 7, step: 0.5, value: d.r || 5 });
    var ctls = [cAge, cSalary, cPct, cSpend, cMonths, cSaved, cR];
    ctls.forEach(function (c) { s.left.appendChild(c.wrap); });
    var oPer = out('Separás por mes');
    var oCush = out('Tu colchón');
    var oSteps = out('Lo que vas construyendo');
    var steps = el('ul', 'steps');
    oSteps.box.appendChild(steps);
    var oGoal = out('Llegás a tu meta (20 años de gastos)', true);
    var oLever = out('La palanca');
    [oPer, oCush, oSteps, oGoal, oLever].forEach(function (o) { s.right.appendChild(o.box); });
    node.appendChild(el('p', 'fine', 'Supuestos: sueldo y gastos fijos, todo en plata de hoy. El colchón no rinde y el fondo de inversión rinde lo que elijas por encima de la inflación: arranca en 5%, un poco por debajo del ~7% que usan las lecciones para acciones (el promedio histórico de EE.UU. descontando la inflación), para ser prudentes y porque un portafolio con algo de bonos rinde menos. El pasado no garantiza nada. No cuenta aumentos de sueldo ni jubilación del Estado: los dos te acercan antes.'));
    function yearsWord(n) { return n === 1 ? '1 año' : n + ' años'; }
    function covered(bal, spend) {
      var months = spend > 0 ? bal / spend : 0;
      if (months < 12) return Math.floor(months) + (Math.floor(months) === 1 ? ' mes' : ' meses') + ' de gastos';
      var y = Math.floor(months / 12 * 10) / 10;
      return String(y).replace('.', ',') + (y === 1 ? ' año' : ' años') + ' de gastos';
    }
    wire(ctls, function () {
      var age = Math.round(cAge.get()), spend = cSpend.get(), pctNow = Math.round(cPct.get());
      var o = { age: age, salary: cSalary.get(), pct: pctNow, spend: spend, months: Math.round(cMonths.get()), saved: cSaved.get(), r: cR.get() / 100 };
      var p = memoPlan(o);
      var short = p.left < spend;
      oPer.val.textContent = money(p.perMonth) + (short ? ' (y no te alcanza para tus gastos)' : '');
      oPer.val.className = 'out-v ' + (short ? 'bad' : '');
      oCush.val.textContent = p.cushionMonth === 0 ? money(p.cushion) + ', ya lo tenés' : p.cushionMonth === null ? money(p.cushion) : money(p.cushion) + ' en ' + p.cushionMonth + (p.cushionMonth === 1 ? ' mes' : ' meses');
      steps.innerHTML = '';
      [5, 10, 20].forEach(function (y) {
        var li = el('li');
        li.appendChild(el('b', null, 'En ' + y + ' años'));
        li.appendChild(document.createTextNode(p.milestones[y] > 0 ? money(p.milestones[y]) + ' invertidos, ' + covered(p.milestones[y], spend) : p.perMonth > 0 ? 'todavía llenando el colchón' : 'sin ahorro todavía'));
        steps.appendChild(li);
      });
      // A goal past 75 is not a useful answer: show what is there at 65 instead,
      // and the savings rate that would reach the goal by 65.
      var late = p.goalMonth === null || p.goalAge > 75;
      var need = null;
      if (p.goalMonth !== 0 && (late || p.goalAge > 65) && o.age < 65) {
        for (var q = pctNow + 1; q <= 50; q++) {
          var alt = memoPlan({ age: o.age, salary: o.salary, pct: q, spend: o.spend, months: o.months, saved: o.saved, r: o.r });
          if (alt.goalMonth !== null && alt.goalAge <= 65) { need = q; break; }
        }
      }
      if (p.goalMonth === 0) {
        oGoal.label.textContent = 'Tu meta: ' + money(p.goal) + ' (20 años de gastos)';
        oGoal.val.textContent = 'ya llegaste';
      } else if (late && o.age < 65 && p.perMonth > 0) {
        oGoal.label.textContent = 'A los 65 tendrías invertidos';
        oGoal.val.textContent = money(p.at65 || 0);
      } else if (p.perMonth <= 0) {
        oGoal.label.textContent = 'Tu meta: ' + money(p.goal) + ' (20 años de gastos)';
        oGoal.val.textContent = 'empezá con 5%: lo importante es el hábito';
      } else {
        oGoal.label.textContent = 'Llegás a tu meta: ' + money(p.goal) + ' (20 años de gastos)';
        oGoal.val.textContent = 'a los ' + Math.round(p.goalAge) + ' años';
      }
      var parts = [];
      if (late && o.age < 65 && p.perMonth > 0) parts.push('Eso cubre ' + covered(p.at65 || 0, spend) + ', sumado a la jubilación que tengas.');
      else if (!late && p.goalMonth > 0 && p.marketShare > 0) parts.push('El mercado pone ' + Math.round(p.marketShare * 100) + '% de tu meta.');
      if (need !== null) parts.push('Para llegar a la meta completa a los 65, separá ' + need + '%.');
      else if (!late && p.goalMonth > 0 && pctNow + 5 <= 50) {
        var alt5 = memoPlan({ age: o.age, salary: o.salary, pct: pctNow + 5, spend: o.spend, months: o.months, saved: o.saved, r: o.r });
        if (alt5.goalMonth > 0) parts.push('Con ' + (pctNow + 5) + '%, llegás a los ' + Math.round(alt5.goalAge) + '.');
      } else if (late && p.perMonth > 0) parts.push('Cada punto que subas el porcentaje, sobre todo cuando te aumenten el sueldo, te acerca.');
      oLever.val.textContent = p.goalMonth === 0 ? 'Ya cubriste la meta: lo que sigas sumando es margen.' : parts.join(' ') || 'Separar más es lo que más acerca la meta.';
      oLever.val.className = 'out-v small';
    });
  }

  // ---------------- hero charts ----------------

  function heroSpike(node, d) {
    // Income by age (bars) vs the level spend that income can actually support (line).
    var o = { age: d.age || 22, years: d.years || 8, peak: d.peak || 300000, after: d.after || 30000, saved: 0, r: 0.03, planTo: 90 };
    var S = sustainableSpend(o);
    var inc = incomeFn(o), N = o.planTo - o.age;
    var W = 1000, H = 280, bw = W / N, max = o.peak;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 30), role: 'img', 'aria-label': 'Ingresos por edad comparados con lo que podés gastar cada año' });
    for (var t = 0; t < N; t++) {
      var v = inc(t), h = (v / max) * (H - 20);
      if (h <= 0) continue;
      s.appendChild(svg('rect', { x: t * bw + 1, y: H - h, width: Math.max(1, bw - 2), height: h, class: 'h-bar grow' + (t < o.years ? '' : ' dim'), style: 'animation-delay:' + (reduceMotion ? 0 : t * 18) + 'ms' }));
    }
    s.appendChild(svg('line', { x1: 0, y1: H, x2: W, y2: H, class: 'h-axis' }));
    var sy = H - (S / max) * (H - 20);
    s.appendChild(svg('line', { x1: 0, y1: sy, x2: W, y2: sy, class: 'h-line' }));
    s.appendChild(svg('text', { x: o.years * bw + 14, y: 26, class: 'h-label gold' }, 'Lo que ganás: ' + money(o.peak) + ' por año, ' + o.years + ' años'));
    s.appendChild(svg('text', { x: W, y: sy - 10, class: 'h-label', 'text-anchor': 'end' }, 'Lo que podés gastar cada año, toda la vida: ' + money(S)));
    s.appendChild(svg('text', { x: 0, y: H + 24, class: 'h-label' }, o.age + ' años'));
    s.appendChild(svg('text', { x: W, y: H + 24, class: 'h-label', 'text-anchor': 'end' }, '90 años'));
    node.appendChild(s);
  }

  function heroJagged(node, d) {
    var avg = d.avg || 3000, pay = (d.pay || 80) / 100, tax = (d.tax || 25) / 100;
    var W = 1000, H = 260, n = CREATOR_PATTERN.length, bw = W / n;
    var max = avg * Math.max.apply(null, CREATOR_PATTERN);
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 30), role: 'img', 'aria-label': 'Ingresos que suben y bajan cada mes, comparados con un sueldo fijo' });
    CREATOR_PATTERN.forEach(function (k, i) {
      var h = (k * avg / max) * (H - 20);
      s.appendChild(svg('rect', { x: i * bw + bw * 0.15, y: H - h, width: bw * 0.7, height: h, rx: 3, class: 'h-bar grow', style: 'animation-delay:' + (reduceMotion ? 0 : i * 40) + 'ms' }));
    });
    s.appendChild(svg('line', { x1: 0, y1: H, x2: W, y2: H, class: 'h-axis' }));
    var sal = avg * (1 - tax) * pay, sy = H - (sal / max) * (H - 20);
    s.appendChild(svg('line', { x1: 0, y1: sy, x2: W, y2: sy, class: 'h-line solid' }));
    s.appendChild(svg('text', { x: W, y: sy - 10, class: 'h-label', 'text-anchor': 'end' }, 'Tu sueldo fijo: ' + money(sal) + ' por mes, todos los meses'));
    s.appendChild(svg('text', { x: 0, y: H + 24, class: 'h-label gold' }, 'Lo que cobrás: nunca dos meses iguales'));
    node.appendChild(s);
  }

  function heroWindfall(node, d) {
    var Wf = d.windfall || 1000000, r = 0.03, fast = d.fast || 0.08, slow = d.slow || 0.035;
    var yF = windfallYears(Wf, Wf * fast, r), yS = windfallYears(Wf, Wf * slow, r);
    var years = 40, W = 1000, H = 260;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 30), role: 'img', 'aria-label': 'Cuánto dura una plata grande según cuánto gastás por año' });
    function line(rate, cls) {
      var b = Wf, pts = ['M0,' + (H - (b / Wf) * (H - 30)).toFixed(1)];
      for (var t = 1; t <= years; t++) {
        b = Math.max(0, b * (1 + r) - Wf * rate);
        pts.push('L' + ((t / years) * W).toFixed(1) + ',' + (H - Math.min(1.4, b / Wf) * (H - 30)).toFixed(1));
      }
      s.appendChild(svg('path', { d: pts.join(' '), class: 'h-line ' + cls }));
    }
    s.appendChild(svg('line', { x1: 0, y1: H, x2: W, y2: H, class: 'h-axis' }));
    line(fast, 'bad');
    line(slow, 'solid');
    var fx = Math.min(W, (yF / years) * W);
    s.appendChild(svg('text', { x: Math.min(W - 6, fx + 10), y: H - 12, class: 'h-label bad' }, 'Gastando ' + Math.round(fast * 100) + '% por año: se termina en ' + yF + ' años'));
    s.appendChild(svg('text', { x: W, y: 30, class: 'h-label', 'text-anchor': 'end' }, 'Gastando ' + String(slow * 100).replace('.', ',') + '% por año: dura ' + (isFinite(yS) ? yS + ' años' : 'para siempre')));
    s.appendChild(svg('text', { x: 0, y: H + 24, class: 'h-label' }, 'Hoy'));
    s.appendChild(svg('text', { x: W, y: H + 24, class: 'h-label', 'text-anchor': 'end' }, years + ' años después'));
    node.appendChild(s);
  }

  // ---------------- flips + plan ----------------

  function wireFlips() {
    each('.flip', function (card) {
      card.addEventListener('click', function () {
        card.setAttribute('aria-pressed', card.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
    });
  }

  function wirePlan() {
    each('.plan', function (list) {
      var key = 'vp.plan.' + (list.getAttribute('data-key') || 'x');
      var boxes = Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"]'));
      var saved = [];
      try { saved = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { saved = []; }
      var prog = document.getElementById(list.getAttribute('data-progress'));
      function update() {
        var done = boxes.map(function (b) { return !!b.checked; });
        try { localStorage.setItem(key, JSON.stringify(done)); } catch (e) { /* ignore */ }
        if (prog) prog.textContent = done.filter(Boolean).length + ' de ' + boxes.length + ' listos';
      }
      boxes.forEach(function (b, i) { b.checked = !!saved[i]; b.addEventListener('change', update); });
      update();
    });
  }

  // ---------------- boot ----------------

  var HEROES = { spike: heroSpike, jagged: heroJagged, windfall: heroWindfall };
  var CALCS = { lifetime: lifetimeCalc, salary: salaryCalc, freedom: freedomCalc, memo: memoCalc };
  each('[data-hero]', function (n) { var f = HEROES[n.getAttribute('data-hero')]; if (f) f(n, readDefaults(n)); });
  each('[data-calc]', function (n) { var f = CALCS[n.getAttribute('data-calc')]; if (f) f(n, readDefaults(n)); });
  wireFlips();
  wirePlan();
})();
