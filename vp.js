// Shared engine for the "viento en popa" entries. Each page declares what it
// needs in markup (data-hero, data-calc with JSON defaults, .flip, .plan) and
// this file wires whatever is present. No dependencies, no network.
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  // ---------------- language (page <html lang>: es, en or pt-BR) ----------------

  var LANG = (document.documentElement.getAttribute('lang') || 'es').slice(0, 2).toLowerCase();
  if (['es', 'en', 'pt'].indexOf(LANG) === -1) LANG = 'es';
  var LOCALE = { es: 'es-AR', en: 'en-US', pt: 'pt-BR' }[LANG];
  var TX = {
    es: {
      age: 'Tu edad', saved: 'Lo que ya tenés ahorrado', reached: 'ya llegaste', forever: 'para siempre',
      yr1: '1 año', yrN: '{n} años', mo1: '1 mes', moN: '{n} meses', ageLabel: '{n} años', today: 'Hoy', yearsLater: '{n} años después',
      lt_title: '¿Cuánto podés gastar de verdad?', lt_desc: 'Lo que ganás en pocos años tiene que alcanzarte para toda la vida. Mové los números.',
      lt_years: 'Años que te quedan ganando así', lt_peak: 'Lo que te queda por año, después de impuestos', lt_after: 'Lo que ganarías por año después (otro trabajo, hasta los 65)', lt_spend: 'Lo que gastás por año hoy',
      lt_oS: 'Podés gastar por año, toda la vida (hasta los 90)', lt_oB: 'Con lo que gastás hoy, la plata te alcanza', lt_oX: 'Diferencia entre lo que gastás y lo que podés',
      lt_lg1: 'Ahorro si seguís gastando igual', lt_lg2: 'Ahorro gastando lo sostenible',
      lt_fine: 'Todo en plata de hoy, con un rendimiento de 3% por año por encima de la inflación. No incluye jubilación ni herencias. Es un mapa, no una promesa.',
      untilAge: 'hasta los {n} años', forLife: 'toda la vida', overspend: 'gastás {m} de más por año', spare: 'te sobran {m} por año', ranOut: 'se terminó a los {n}',
      sa_title: 'Pagate un sueldo', sa_desc: 'Todo lo que cobrás entra a una cuenta "empresa". De ahí, separás impuestos y te pagás un sueldo fijo a vos. Probá cuánto te podés pagar.',
      sa_avg: 'Lo que cobrás por mes, en promedio', sa_tax: 'Impuestos que tenés que separar (%)', sa_pay: 'Qué parte del promedio te pagás de sueldo (%)',
      sa_oSal: 'Tu sueldo fijo por mes', sa_oMin: 'Lo peor que le pasó a tu colchón en 24 meses', sa_oEnd: 'Lo que te sobró para invertir al final',
      sa_lg1: 'Lo que cobraste cada mes', sa_lg2: 'Tu sueldo fijo', sa_lg3: 'Tu colchón',
      sa_fine: 'Simulación de 24 meses con meses buenos y malos, que arranca con una mala racha. El colchón empieza con 3 sueldos. Promedio de los 24 meses: exactamente lo que pusiste arriba.',
      sa_broke: 'te quedaste sin plata en el mes {n}', sa_low: 'bajó hasta {m}, nunca a cero',
      fr_title: 'Tu número de libertad', fr_desc: 'Cuánta plata necesitás para que tu tren de vida se pague solo, para siempre, sin trabajar.',
      fr_spend: 'Lo que querés gastar por año, para siempre', fr_save: 'Lo que podés ahorrar por año', fr_have: 'Lo que ya tenés',
      fr_oN: 'Tu número (retiro de 3,5% por año)', fr_oN4: 'Versión menos prudente (4% por año)', fr_oY: 'Ahorrando eso por año, llegás en',
      fr_fine: 'La "regla del 4%" sale de estudios con datos de Estados Unidos: retirar 4% por año, ajustado por inflación, alcanzó para 30 años en casi todos los períodos de la historia. Si te retirás joven y la plata tiene que durar 50 años o más, conviene algo más prudente, como 3 a 3,5%. Llegar se calcula con un 3% por año por encima de la inflación.',
      over100: 'más de 100 años: hay que ahorrar más o gastar menos',
      me_title: 'Tu plan, con tus números', me_desc: 'Todo en dólares de hoy. Primero se llena el colchón y después arranca el fondo de inversión.',
      me_salary: 'Tu sueldo neto por mes', me_pct: 'Qué porcentaje separás el día que cobrás', me_spend: 'Lo que gastás por mes', me_months: 'Meses de gastos en el colchón', me_r: 'Rendimiento por año, por encima de la inflación (%)',
      me_oPer: 'Separás por mes', me_oCush: 'Tu colchón', me_oSteps: 'Lo que vas construyendo', me_oGoal: 'Llegás a tu meta (20 años de gastos)', me_oLever: 'La palanca',
      me_fine: 'Supuestos: sueldo y gastos fijos, todo en plata de hoy. El colchón no rinde y el fondo de inversión rinde lo que elijas por encima de la inflación: arranca en 5%, un poco por debajo del ~7% que usan las lecciones para acciones (el promedio histórico de EE.UU. descontando la inflación), para ser prudentes y porque un portafolio con algo de bonos rinde menos. El pasado no garantiza nada. No cuenta aumentos de sueldo ni jubilación del Estado: los dos te acercan antes.',
      ofExpenses: '{t} de gastos', short: ' (y no te alcanza para tus gastos)', haveIt: '{m}, ya lo tenés', inT: '{m} en {t}', inYears: 'En {n} años',
      invested: '{m} invertidos, {c}', filling: 'todavía llenando el colchón', noSaving: 'sin ahorro todavía',
      goalIs: 'Tu meta: {m} (20 años de gastos)', at65: 'A los 65 tendrías invertidos', start5: 'empezá con 5%: lo importante es el hábito',
      reachGoal: 'Llegás a tu meta: {m} (20 años de gastos)', atAge: 'a los {n} años',
      covers: 'Eso cubre {c}, sumado a la jubilación que tengas.', mktShare: 'El mercado pone {p}% de tu meta.', need65: 'Para llegar a la meta completa a los 65, separá {p}%.',
      plus5: 'Con {p}%, llegás a los {n}.', eachPoint: 'Cada punto que subas el porcentaje, sobre todo cuando te aumenten el sueldo, te acerca.',
      goalCovered: 'Ya cubriste la meta: lo que sigas sumando es margen.', saveMore: 'Separar más es lo que más acerca la meta.',
      hs_aria: 'Ingresos por edad comparados con lo que podés gastar cada año', hs_earn: 'Lo que ganás: {m} por año, {n} años', hs_spend: 'Lo que podés gastar cada año, toda la vida: {m}',
      hj_aria: 'Ingresos que suben y bajan cada mes, comparados con un sueldo fijo', hj_sal: 'Tu sueldo fijo: {m} por mes, todos los meses', hj_earn: 'Lo que cobrás: nunca dos meses iguales',
      hw_aria: 'Cuánto dura una plata grande según cuánto gastás por año', hw_fast: 'Gastando {p}% por año: se termina en {n} años', hw_slow: 'Gastando {p}% por año: dura {d}',
      planProg: '{d} de {t} listos'
    },
    en: {
      age: 'Your age', saved: 'What you already have saved', reached: 'you are already there', forever: 'forever',
      yr1: '1 year', yrN: '{n} years', mo1: '1 month', moN: '{n} months', ageLabel: 'age {n}', today: 'Today', yearsLater: '{n} years later',
      lt_title: 'How much can you really spend?', lt_desc: 'What you earn in a few years has to last you a lifetime. Move the numbers.',
      lt_years: 'Years you have left earning like this', lt_peak: 'What you keep per year, after taxes', lt_after: 'What you would earn per year afterwards (another job, until 65)', lt_spend: 'What you spend per year today',
      lt_oS: 'You can spend per year, for life (until 90)', lt_oB: 'At today\'s spending, the money lasts', lt_oX: 'Gap between what you spend and what you can',
      lt_lg1: 'Savings if you keep spending the same', lt_lg2: 'Savings at the sustainable amount',
      lt_fine: 'Everything in today\'s money, with a return of 3% a year above inflation. It does not include pensions or inheritances. It is a map, not a promise.',
      untilAge: 'until age {n}', forLife: 'for life', overspend: 'you overspend by {m} a year', spare: 'you have {m} a year to spare', ranOut: 'ran out at {n}',
      sa_title: 'Pay yourself a salary', sa_desc: 'Everything you earn goes into a "company" account. From there, you set aside taxes and pay yourself a fixed salary. Try how much you can pay yourself.',
      sa_avg: 'What you earn per month, on average', sa_tax: 'Taxes you need to set aside (%)', sa_pay: 'Share of the average you pay yourself as salary (%)',
      sa_oSal: 'Your fixed monthly salary', sa_oMin: 'The lowest point of your cushion in 24 months', sa_oEnd: 'What was left to invest at the end',
      sa_lg1: 'What you earned each month', sa_lg2: 'Your fixed salary', sa_lg3: 'Your cushion',
      sa_fine: 'A 24-month simulation with good and bad months, starting with a bad streak. The cushion starts with 3 salaries. The 24-month average is exactly what you entered above.',
      sa_broke: 'you ran out of money in month {n}', sa_low: 'dropped to {m}, never to zero',
      fr_title: 'Your freedom number', fr_desc: 'How much money you need for your lifestyle to pay for itself, forever, without working.',
      fr_spend: 'What you want to spend per year, forever', fr_save: 'What you can save per year', fr_have: 'What you already have',
      fr_oN: 'Your number (3.5% withdrawal per year)', fr_oN4: 'Less cautious version (4% per year)', fr_oY: 'Saving that every year, you get there in',
      fr_fine: 'The "4% rule" comes from studies with US data: withdrawing 4% a year, adjusted for inflation, lasted 30 years in almost every period in history. If you retire young and the money has to last 50 years or more, something more cautious makes sense, like 3 to 3.5%. The time to get there assumes 3% a year above inflation.',
      over100: 'over 100 years: save more or spend less',
      me_title: 'Your plan, with your numbers', me_desc: 'Everything in today\'s dollars. The cushion fills first, then the investment fund starts.',
      me_salary: 'Your monthly take-home pay', me_pct: 'What percentage you set aside on payday', me_spend: 'What you spend per month', me_months: 'Months of expenses in the cushion', me_r: 'Return per year, above inflation (%)',
      me_oPer: 'You set aside per month', me_oCush: 'Your cushion', me_oSteps: 'What you are building', me_oGoal: 'You reach your goal (20 years of expenses)', me_oLever: 'The lever',
      me_fine: 'Assumptions: fixed salary and expenses, everything in today\'s money. The cushion earns nothing and the investment fund earns what you choose above inflation: it starts at 5%, a little below the ~7% the lessons use for stocks (the US historical average after inflation), to be cautious and because a portfolio with some bonds earns less. The past guarantees nothing. It does not count raises or a state pension: both get you there sooner.',
      ofExpenses: '{t} of expenses', short: ' (and it does not cover your expenses)', haveIt: '{m}, you already have it', inT: '{m} in {t}', inYears: 'In {n} years',
      invested: '{m} invested, {c}', filling: 'still filling the cushion', noSaving: 'no savings yet',
      goalIs: 'Your goal: {m} (20 years of expenses)', at65: 'At 65 you would have invested', start5: 'start with 5%: the habit is what matters',
      reachGoal: 'You reach your goal: {m} (20 years of expenses)', atAge: 'at {n}',
      covers: 'That covers {c}, on top of any pension you have.', mktShare: 'The market puts in {p}% of your goal.', need65: 'To reach the full goal by 65, set aside {p}%.',
      plus5: 'With {p}%, you get there at {n}.', eachPoint: 'Every point you raise the percentage, especially when you get a raise, brings you closer.',
      goalCovered: 'You have covered the goal: anything you add is margin.', saveMore: 'Setting aside more is what brings the goal closest.',
      hs_aria: 'Income by age compared with what you can spend each year', hs_earn: 'What you earn: {m} a year, for {n} years', hs_spend: 'What you can spend each year, for life: {m}',
      hj_aria: 'Income that goes up and down every month, compared with a fixed salary', hj_sal: 'Your fixed salary: {m} a month, every month', hj_earn: 'What you earn: never two months alike',
      hw_aria: 'How long a large sum lasts depending on how much you spend each year', hw_fast: 'Spending {p}% a year: it runs out in {n} years', hw_slow: 'Spending {p}% a year: it lasts {d}',
      planProg: '{d} of {t} done'
    },
    pt: {
      age: 'Sua idade', saved: 'O que você já tem guardado', reached: 'você já chegou', forever: 'para sempre',
      yr1: '1 ano', yrN: '{n} anos', mo1: '1 mês', moN: '{n} meses', ageLabel: '{n} anos', today: 'Hoje', yearsLater: '{n} anos depois',
      lt_title: 'Quanto você pode gastar de verdade?', lt_desc: 'O que você ganha em poucos anos precisa durar a vida toda. Mexa nos números.',
      lt_years: 'Anos que faltam ganhando assim', lt_peak: 'O que sobra por ano, depois dos impostos', lt_after: 'O que você ganharia por ano depois (outro trabalho, até os 65)', lt_spend: 'O que você gasta por ano hoje',
      lt_oS: 'Você pode gastar por ano, a vida toda (até os 90)', lt_oB: 'Com o que você gasta hoje, o dinheiro dura', lt_oX: 'Diferença entre o que você gasta e o que pode',
      lt_lg1: 'Poupança se você continuar gastando igual', lt_lg2: 'Poupança gastando o sustentável',
      lt_fine: 'Tudo em dinheiro de hoje, com um rendimento de 3% ao ano acima da inflação. Não inclui aposentadoria nem herança. É um mapa, não uma promessa.',
      untilAge: 'até os {n} anos', forLife: 'a vida toda', overspend: 'você gasta {m} a mais por ano', spare: 'sobram {m} por ano', ranOut: 'acabou aos {n}',
      sa_title: 'Pague um salário a você mesmo', sa_desc: 'Tudo o que você recebe entra numa conta "empresa". Dali, você separa os impostos e paga um salário fixo para você. Teste quanto você pode se pagar.',
      sa_avg: 'O que você recebe por mês, em média', sa_tax: 'Impostos que você precisa separar (%)', sa_pay: 'Quanto da média você se paga de salário (%)',
      sa_oSal: 'Seu salário fixo por mês', sa_oMin: 'O pior momento da sua reserva em 24 meses', sa_oEnd: 'O que sobrou para investir no final',
      sa_lg1: 'O que você recebeu em cada mês', sa_lg2: 'Seu salário fixo', sa_lg3: 'Sua reserva',
      sa_fine: 'Simulação de 24 meses com meses bons e ruins, começando com uma fase ruim. A reserva começa com 3 salários. A média dos 24 meses é exatamente o que você colocou acima.',
      sa_broke: 'o dinheiro acabou no mês {n}', sa_low: 'caiu até {m}, nunca a zero',
      fr_title: 'Seu número da liberdade', fr_desc: 'Quanto dinheiro você precisa para que o seu padrão de vida se pague sozinho, para sempre, sem trabalhar.',
      fr_spend: 'O que você quer gastar por ano, para sempre', fr_save: 'O que você consegue poupar por ano', fr_have: 'O que você já tem',
      fr_oN: 'Seu número (retirada de 3,5% ao ano)', fr_oN4: 'Versão menos prudente (4% ao ano)', fr_oY: 'Poupando isso por ano, você chega em',
      fr_fine: 'A "regra dos 4%" vem de estudos com dados dos Estados Unidos: retirar 4% ao ano, corrigidos pela inflação, durou 30 anos em quase todos os períodos da história. Se você se aposentar jovem e o dinheiro tiver que durar 50 anos ou mais, convém algo mais prudente, como 3 a 3,5%. O tempo para chegar usa 3% ao ano acima da inflação.',
      over100: 'mais de 100 anos: é preciso poupar mais ou gastar menos',
      me_title: 'Seu plano, com seus números', me_desc: 'Tudo em dólares de hoje. Primeiro se enche a reserva e depois começa o fundo de investimento.',
      me_salary: 'Seu salário líquido por mês', me_pct: 'Que porcentagem você separa no dia do pagamento', me_spend: 'O que você gasta por mês', me_months: 'Meses de gastos na reserva', me_r: 'Rendimento por ano, acima da inflação (%)',
      me_oPer: 'Você separa por mês', me_oCush: 'Sua reserva', me_oSteps: 'O que você vai construindo', me_oGoal: 'Você chega à sua meta (20 anos de gastos)', me_oLever: 'A alavanca',
      me_fine: 'Premissas: salário e gastos fixos, tudo em dinheiro de hoje. A reserva não rende e o fundo de investimento rende o que você escolher acima da inflação: começa em 5%, um pouco abaixo dos ~7% que as lições usam para ações (a média histórica dos EUA descontada a inflação), por prudência e porque um portfólio com alguns títulos rende menos. O passado não garante nada. Não conta aumentos de salário nem aposentadoria do governo: os dois fazem você chegar antes.',
      ofExpenses: '{t} de gastos', short: ' (e não cobre seus gastos)', haveIt: '{m}, você já tem', inT: '{m} em {t}', inYears: 'Em {n} anos',
      invested: '{m} investidos, {c}', filling: 'ainda enchendo a reserva', noSaving: 'sem poupança ainda',
      goalIs: 'Sua meta: {m} (20 anos de gastos)', at65: 'Aos 65 você teria investido', start5: 'comece com 5%: o importante é o hábito',
      reachGoal: 'Você chega à sua meta: {m} (20 anos de gastos)', atAge: 'aos {n} anos',
      covers: 'Isso cobre {c}, somado à aposentadoria que você tiver.', mktShare: 'O mercado coloca {p}% da sua meta.', need65: 'Para chegar à meta completa aos 65, separe {p}%.',
      plus5: 'Com {p}%, você chega aos {n}.', eachPoint: 'Cada ponto que você aumentar na porcentagem, principalmente quando receber um aumento, deixa você mais perto.',
      goalCovered: 'Você já cobriu a meta: o que continuar somando é margem.', saveMore: 'Separar mais é o que mais aproxima a meta.',
      hs_aria: 'Renda por idade comparada com o que você pode gastar por ano', hs_earn: 'O que você ganha: {m} por ano, {n} anos', hs_spend: 'O que você pode gastar por ano, a vida toda: {m}',
      hj_aria: 'Renda que sobe e desce todo mês, comparada com um salário fixo', hj_sal: 'Seu salário fixo: {m} por mês, todo mês', hj_earn: 'O que você recebe: nunca dois meses iguais',
      hw_aria: 'Quanto dura uma grande quantia conforme quanto você gasta por ano', hw_fast: 'Gastando {p}% ao ano: acaba em {n} anos', hw_slow: 'Gastando {p}% ao ano: dura {d}',
      planProg: '{d} de {t} feitos'
    }
  }[LANG];
  // Placeholders are filled with our own computed numbers only (written via textContent).
  function tr(key, vals) { return TX[key].replace(/\{(\w+)\}/g, function (_, k) { return vals && vals[k] !== undefined ? vals[k] : ''; }); }
  function yearsTxt(n) { return n === 1 ? TX.yr1 : tr('yrN', { n: n }); }
  function monthsTxt(n) { return n === 1 ? TX.mo1 : tr('moN', { n: n }); }
  function num(n) { return n.toLocaleString(LOCALE, { maximumFractionDigits: 1 }); }

  function fmt(n) { return Math.round(n).toLocaleString(LOCALE); }
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
    var s = shell(node, d.title || TX.lt_title, d.desc || TX.lt_desc);
    var cAge = control(TX.age, { min: 15, max: 60, step: 1, value: d.age || 22, hardMax: 80 });
    var cYears = control(TX.lt_years, { min: 1, max: 25, step: 1, value: d.years || 8, hardMax: 45 });
    var cPeak = moneyControl(TX.lt_peak, d.peak || 300000);
    var cAfter = moneyControl(TX.lt_after, d.after || 30000);
    var cSpend = moneyControl(TX.lt_spend, d.spend || 180000);
    var cSaved = moneyControl(TX.saved, d.saved || 0);
    [cAge, cYears, cPeak, cAfter, cSpend, cSaved].forEach(function (c) { s.left.appendChild(c.wrap); });
    var oS = out(TX.lt_oS, true);
    var oB = out(TX.lt_oB);
    var oX = out(TX.lt_oX);
    [oS, oB, oX].forEach(function (o) { s.right.appendChild(o.box); });
    var chart = el('div', 'chart');
    node.appendChild(chart);
    node.appendChild(legend([['sw bad', TX.lt_lg1], ['sw gold', TX.lt_lg2]]));
    node.appendChild(el('p', 'fine', TX.lt_fine));

    wire([cAge, cYears, cPeak, cAfter, cSpend, cSaved], function () {
      var age = Math.round(cAge.get());
      var o = { age: age, years: Math.round(cYears.get()), peak: cPeak.get(), after: cAfter.get(), saved: cSaved.get(), r: 0.03, planTo: Math.max(age + 1, 90) };
      var S = sustainableSpend(o);
      var spend = cSpend.get();
      var now = path(o, spend), safe = path(o, S);
      oS.val.textContent = money(Math.max(0, S));
      if (now.brokeAt) { oB.val.textContent = tr('untilAge', { n: now.brokeAt }); oB.val.className = 'out-v bad'; }
      else { oB.val.textContent = TX.forLife; oB.val.className = 'out-v good'; }
      var gap = spend - S;
      oX.val.textContent = gap > 0 ? tr('overspend', { m: money(gap) }) : tr('spare', { m: money(-gap) });
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
      s.appendChild(svg('text', { x: xi, y: H + 20, class: 'c-label', 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle' }, tr('ageLabel', { n: a })));
    });
    if (now.brokeAt) {
      var bx = x(now.brokeAt - o.age - 1);
      s.appendChild(svg('circle', { cx: bx, cy: H, r: 6, class: 'c-mark' }));
      s.appendChild(svg('text', { x: Math.min(W - 4, bx + 10), y: H - 10, class: 'c-label bad' }, tr('ranOut', { n: now.brokeAt })));
    }
    container.innerHTML = '';
    container.appendChild(s);
  }

  function salaryCalc(node, d) {
    var s = shell(node, d.title || TX.sa_title, d.desc || TX.sa_desc);
    var cAvg = moneyControl(TX.sa_avg, d.avg || 3000);
    var cTax = control(TX.sa_tax, { min: 0, max: 50, step: 1, value: d.tax || 25, hardMax: 60 });
    var cPay = control(TX.sa_pay, { min: 50, max: 120, step: 5, value: d.pay || 100, hardMax: 120 });
    [cAvg, cTax, cPay].forEach(function (c) { s.left.appendChild(c.wrap); });
    var oSal = out(TX.sa_oSal, true);
    var oMin = out(TX.sa_oMin);
    var oEnd = out(TX.sa_oEnd);
    [oSal, oMin, oEnd].forEach(function (o) { s.right.appendChild(o.box); });
    var chart = el('div', 'chart');
    node.appendChild(chart);
    node.appendChild(legend([['sw box', TX.sa_lg1], ['sw gold', TX.sa_lg2], ['sw', TX.sa_lg3]]));
    node.appendChild(el('p', 'fine', TX.sa_fine));

    wire([cAvg, cTax, cPay], function () {
      var run = salaryRun(cAvg.get(), cTax.get(), cPay.get());
      oSal.val.textContent = money(run.salary);
      if (run.brokeAt) { oMin.val.textContent = tr('sa_broke', { n: run.brokeAt }); oMin.val.className = 'out-v bad'; }
      else { oMin.val.textContent = tr('sa_low', { m: money(Math.max(0, run.min)) }); oMin.val.className = 'out-v good'; }
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
    var s = shell(node, d.title || TX.fr_title, d.desc || TX.fr_desc);
    var cSpend = moneyControl(TX.fr_spend, d.spend || 60000);
    var cSave = moneyControl(TX.fr_save, d.save || 100000);
    var cHave = moneyControl(TX.fr_have, d.saved || 0);
    [cSpend, cSave, cHave].forEach(function (c) { s.left.appendChild(c.wrap); });
    var oN = out(TX.fr_oN, true);
    var oN4 = out(TX.fr_oN4);
    var oY = out(TX.fr_oY);
    [oN, oN4, oY].forEach(function (o) { s.right.appendChild(o.box); });
    node.appendChild(el('p', 'fine', TX.fr_fine));
    wire([cSpend, cSave, cHave], function () {
      var target = cSpend.get() / 0.035;
      oN.val.textContent = money(target);
      oN4.val.textContent = money(cSpend.get() / 0.04);
      var yrs = yearsToReach(target, cHave.get(), cSave.get(), 0.03);
      oY.val.textContent = yrs === 0 ? TX.reached : yrs === null ? TX.over100 : yearsTxt(yrs);
      oY.val.className = 'out-v ' + (yrs === null ? 'bad' : yrs <= 15 ? 'good' : '');
    });
  }

  function memoCalc(node, d) {
    var s = shell(node, d.title || TX.me_title, d.desc || TX.me_desc);
    var cAge = control(TX.age, { min: 16, max: 70, step: 1, value: d.age || 25 });
    var cSalary = moneyControl(TX.me_salary, d.salary || 1500);
    var cPct = control(TX.me_pct, { min: 0, max: 50, step: 1, value: d.pct != null ? d.pct : 20 });
    var cSpend = moneyControl(TX.me_spend, d.spend || 1000);
    var cMonths = control(TX.me_months, { min: 3, max: 24, step: 1, value: d.months || 6 });
    var cSaved = moneyControl(TX.saved, d.saved || 0);
    var cR = control(TX.me_r, { min: 0, max: 7, step: 0.5, value: d.r || 5 });
    var ctls = [cAge, cSalary, cPct, cSpend, cMonths, cSaved, cR];
    ctls.forEach(function (c) { s.left.appendChild(c.wrap); });
    var oPer = out(TX.me_oPer);
    var oCush = out(TX.me_oCush);
    var oSteps = out(TX.me_oSteps);
    var steps = el('ul', 'steps');
    oSteps.box.appendChild(steps);
    var oGoal = out(TX.me_oGoal, true);
    var oLever = out(TX.me_oLever);
    [oPer, oCush, oSteps, oGoal, oLever].forEach(function (o) { s.right.appendChild(o.box); });
    node.appendChild(el('p', 'fine', TX.me_fine));
    function covered(bal, spend) {
      var m = spend > 0 ? bal / spend : 0;
      if (m < 12) return tr('ofExpenses', { t: monthsTxt(Math.floor(m)) });
      var y = Math.floor(m / 12 * 10) / 10;
      return tr('ofExpenses', { t: y === 1 ? TX.yr1 : tr('yrN', { n: num(y) }) });
    }
    wire(ctls, function () {
      var age = Math.round(cAge.get()), spend = cSpend.get(), pctNow = Math.round(cPct.get());
      var o = { age: age, salary: cSalary.get(), pct: pctNow, spend: spend, months: Math.round(cMonths.get()), saved: cSaved.get(), r: cR.get() / 100 };
      var p = memoPlan(o);
      var short = p.left < spend;
      oPer.val.textContent = money(p.perMonth) + (short ? TX.short : '');
      oPer.val.className = 'out-v ' + (short ? 'bad' : '');
      oCush.val.textContent = p.cushionMonth === 0 ? tr('haveIt', { m: money(p.cushion) }) : p.cushionMonth === null ? money(p.cushion) : tr('inT', { m: money(p.cushion), t: monthsTxt(p.cushionMonth) });
      steps.innerHTML = '';
      [5, 10, 20].forEach(function (y) {
        var li = el('li');
        li.appendChild(el('b', null, tr('inYears', { n: y })));
        li.appendChild(document.createTextNode(p.milestones[y] > 0 ? tr('invested', { m: money(p.milestones[y]), c: covered(p.milestones[y], spend) }) : p.perMonth > 0 ? TX.filling : TX.noSaving));
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
        oGoal.label.textContent = tr('goalIs', { m: money(p.goal) });
        oGoal.val.textContent = TX.reached;
      } else if (late && o.age < 65 && p.perMonth > 0) {
        oGoal.label.textContent = TX.at65;
        oGoal.val.textContent = money(p.at65 || 0);
      } else if (p.perMonth <= 0) {
        oGoal.label.textContent = tr('goalIs', { m: money(p.goal) });
        oGoal.val.textContent = TX.start5;
      } else {
        oGoal.label.textContent = tr('reachGoal', { m: money(p.goal) });
        oGoal.val.textContent = tr('atAge', { n: Math.round(p.goalAge) });
      }
      var parts = [];
      if (late && o.age < 65 && p.perMonth > 0) parts.push(tr('covers', { c: covered(p.at65 || 0, spend) }));
      else if (!late && p.goalMonth > 0 && p.marketShare > 0) parts.push(tr('mktShare', { p: Math.round(p.marketShare * 100) }));
      if (need !== null) parts.push(tr('need65', { p: need }));
      else if (!late && p.goalMonth > 0 && pctNow + 5 <= 50) {
        var alt5 = memoPlan({ age: o.age, salary: o.salary, pct: pctNow + 5, spend: o.spend, months: o.months, saved: o.saved, r: o.r });
        if (alt5.goalMonth > 0) parts.push(tr('plus5', { p: pctNow + 5, n: Math.round(alt5.goalAge) }));
      } else if (late && p.perMonth > 0) parts.push(TX.eachPoint);
      oLever.val.textContent = p.goalMonth === 0 ? TX.goalCovered : parts.join(' ') || TX.saveMore;
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
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 30), role: 'img', 'aria-label': TX.hs_aria });
    for (var t = 0; t < N; t++) {
      var v = inc(t), h = (v / max) * (H - 20);
      if (h <= 0) continue;
      s.appendChild(svg('rect', { x: t * bw + 1, y: H - h, width: Math.max(1, bw - 2), height: h, class: 'h-bar grow' + (t < o.years ? '' : ' dim'), style: 'animation-delay:' + (reduceMotion ? 0 : t * 18) + 'ms' }));
    }
    s.appendChild(svg('line', { x1: 0, y1: H, x2: W, y2: H, class: 'h-axis' }));
    var sy = H - (S / max) * (H - 20);
    s.appendChild(svg('line', { x1: 0, y1: sy, x2: W, y2: sy, class: 'h-line' }));
    s.appendChild(svg('text', { x: o.years * bw + 14, y: 26, class: 'h-label gold' }, tr('hs_earn', { m: money(o.peak), n: o.years })));
    s.appendChild(svg('text', { x: W, y: sy - 10, class: 'h-label', 'text-anchor': 'end' }, tr('hs_spend', { m: money(S) })));
    s.appendChild(svg('text', { x: 0, y: H + 24, class: 'h-label' }, tr('ageLabel', { n: o.age })));
    s.appendChild(svg('text', { x: W, y: H + 24, class: 'h-label', 'text-anchor': 'end' }, tr('ageLabel', { n: 90 })));
    node.appendChild(s);
  }

  function heroJagged(node, d) {
    var avg = d.avg || 3000, pay = (d.pay || 80) / 100, tax = (d.tax || 25) / 100;
    var W = 1000, H = 260, n = CREATOR_PATTERN.length, bw = W / n;
    var max = avg * Math.max.apply(null, CREATOR_PATTERN);
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 30), role: 'img', 'aria-label': TX.hj_aria });
    CREATOR_PATTERN.forEach(function (k, i) {
      var h = (k * avg / max) * (H - 20);
      s.appendChild(svg('rect', { x: i * bw + bw * 0.15, y: H - h, width: bw * 0.7, height: h, rx: 3, class: 'h-bar grow', style: 'animation-delay:' + (reduceMotion ? 0 : i * 40) + 'ms' }));
    });
    s.appendChild(svg('line', { x1: 0, y1: H, x2: W, y2: H, class: 'h-axis' }));
    var sal = avg * (1 - tax) * pay, sy = H - (sal / max) * (H - 20);
    s.appendChild(svg('line', { x1: 0, y1: sy, x2: W, y2: sy, class: 'h-line solid' }));
    s.appendChild(svg('text', { x: W, y: sy - 10, class: 'h-label', 'text-anchor': 'end' }, tr('hj_sal', { m: money(sal) })));
    s.appendChild(svg('text', { x: 0, y: H + 24, class: 'h-label gold' }, TX.hj_earn));
    node.appendChild(s);
  }

  function heroWindfall(node, d) {
    var Wf = d.windfall || 1000000, r = 0.03, fast = d.fast || 0.08, slow = d.slow || 0.035;
    var yF = windfallYears(Wf, Wf * fast, r), yS = windfallYears(Wf, Wf * slow, r);
    var years = 40, W = 1000, H = 260;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 30), role: 'img', 'aria-label': TX.hw_aria });
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
    s.appendChild(svg('text', { x: Math.min(W - 6, fx + 10), y: H - 12, class: 'h-label bad' }, tr('hw_fast', { p: Math.round(fast * 100), n: yF })));
    s.appendChild(svg('text', { x: W, y: 30, class: 'h-label', 'text-anchor': 'end' }, tr('hw_slow', { p: num(slow * 100), d: isFinite(yS) ? yearsTxt(yS) : TX.forever })));
    s.appendChild(svg('text', { x: 0, y: H + 24, class: 'h-label' }, TX.today));
    s.appendChild(svg('text', { x: W, y: H + 24, class: 'h-label', 'text-anchor': 'end' }, tr('yearsLater', { n: years })));
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
        if (prog) prog.textContent = tr('planProg', { d: done.filter(Boolean).length, t: boxes.length });
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
