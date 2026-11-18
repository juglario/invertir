// Widgets for "¿Se puede deshacer?" (reversibility).
//   puertas:        sort ten decisions into two-way doors and one-way doors, with feedback.
//   costo-deshacer: what it costs to undo buying a home (paid in cash) if you have to
//                   leave after N years, against renting. Every percentage is the reader's.
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  // o = {price, buy, sell, upkeep, rent, growth, alt} (all rates as decimals, per year where it applies)
  // Cost of buying and then undoing it (selling) after n years:
  //   entry costs + upkeep each year + what the money would have earned elsewhere
  //   + exit costs on the price at that time - the change in the home's price.
  function costBuy(o, n) {
    var later = o.price * Math.pow(1 + o.growth, n);
    return o.price * o.buy + o.price * o.upkeep * n + o.price * (Math.pow(1 + o.alt, n) - 1) +
      later * o.sell - (later - o.price);
  }
  // Rent paid over n years; rent starts at rent * price and moves with the home's price.
  function costRent(o, n) {
    var c = 0;
    for (var y = 0; y < n; y++) c += o.price * o.rent * Math.pow(1 + o.growth, y);
    return c;
  }
  // First whole year (1..maxN) from which buying costs less than renting, or -1.
  function breakEven(o, maxN) {
    for (var n = 1; n <= maxN; n++) if (costBuy(o, n) < costRent(o, n)) return n;
    return -1;
  }
  // The "door" itself: what entering and leaving costs, ignoring time.
  function doorCost(o, n) { return o.price * o.buy + o.price * Math.pow(1 + o.growth, n) * o.sell; }

  var API = { costBuy: costBuy, costRent: costRent, breakEven: breakEven, doorCost: doorCost };
  if (typeof module === 'object' && module.exports) module.exports = API;

  var V = typeof window !== 'undefined' && window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  // ---------- puertas ----------
  var D = V.texts({
    es: {
      intro: 'Para cada decisión, elegí qué tipo de puerta es.', two: 'Ida y vuelta', one: 'Un solo sentido',
      score: 'Acertaste', of: '{a} de {b}', ok: 'Bien. ', no: 'Mirala de nuevo. ',
      d1: 'Comprar una parte chica de un fondo que sigue al mercado.',
      e1: 'Si cambiás de idea, vendés. Puede costarte algo si bajó, pero la puerta se abre para los dos lados.',
      d2: 'Firmar como garante del préstamo de un amigo.',
      e2: 'Si tu amigo no paga, la deuda pasa a ser tuya y no podés "des-firmar". Es una de las clásicas puertas de un solo sentido.',
      d3: 'Probar durante un mes una app para anotar tus gastos.',
      e3: 'Si no te sirve, la borrás. El costo es un poco de tiempo.',
      d4: 'Poner todos tus ahorros en un negocio propio.',
      e4: 'Si el negocio cierra, la plata no vuelve. Por eso conviene probar en chiquito antes y no poner todo.',
      d5: 'Compartir la clave de tu billetera de cripto con alguien.',
      e5: 'Una clave compartida no se puede "descompartir", y una transferencia en una cadena de bloques normalmente no se puede revertir.',
      d6: 'Alquilar un año en un barrio nuevo.',
      e6: 'Tiene un costo (mudarte de nuevo), pero al año podés volver o quedarte. Es una forma de probar antes de comprar.',
      d7: 'Pedir un préstamo para invertir en algo que "no puede fallar".',
      e7: 'La deuda queda aunque la inversión se caiga. Si sale mal, no podés volver al punto de partida: quedás más abajo.',
      d8: 'Cambiar de banco la cuenta donde cobrás.',
      e8: 'Es un trámite. Si el banco nuevo no te gusta, volvés o probás otro.',
      d9: 'Transferir hoy a una "oportunidad garantizada" que te escribió por mensaje.',
      e9: 'La urgencia y la promesa de garantía son señales de estafa, y una plata transferida a un estafador casi nunca vuelve.',
      d10: 'Invertir $10 por mes durante seis meses para aprender.',
      e10: 'Poca plata, poco tiempo y se puede parar cuando quieras. Es la forma barata de equivocarse.'
    },
    en: {
      intro: 'For each decision, pick what kind of door it is.', two: 'Two-way door', one: 'One-way door',
      score: 'You got', of: '{a} of {b}', ok: 'Right. ', no: 'Look at it again. ',
      d1: 'Buying a small piece of a fund that tracks the market.',
      e1: 'If you change your mind, you sell. It may cost you something if it fell, but the door opens both ways.',
      d2: 'Co-signing a friend\'s loan.',
      e2: 'If your friend does not pay, the debt becomes yours and you cannot "un-sign". It is one of the classic one-way doors.',
      d3: 'Trying an expense-tracking app for a month.',
      e3: 'If it does not help, you delete it. The cost is a bit of time.',
      d4: 'Putting all your savings into your own business.',
      e4: 'If the business closes, the money does not come back. That is why it pays to test small first and not put in everything.',
      d5: 'Sharing your crypto wallet key with someone.',
      e5: 'A shared key cannot be "unshared", and a transfer on a blockchain usually cannot be reversed.',
      d6: 'Renting for a year in a new neighborhood.',
      e6: 'It has a cost (moving again), but after a year you can go back or stay. It is a way to test before buying.',
      d7: 'Borrowing money to invest in something that "can\'t fail".',
      e7: 'The debt stays even if the investment collapses. If it goes wrong, you cannot get back to where you started: you end up lower.',
      d8: 'Moving the account where you get paid to another bank.',
      e8: 'It is paperwork. If you do not like the new bank, you go back or try another.',
      d9: 'Sending money today to a "guaranteed opportunity" that messaged you.',
      e9: 'Urgency and a promised guarantee are signs of a scam, and money sent to a scammer almost never comes back.',
      d10: 'Investing $10 a month for six months to learn.',
      e10: 'Little money, little time, and you can stop whenever you want. It is the cheap way to be wrong.'
    },
    pt: {
      intro: 'Para cada decisão, escolha que tipo de porta ela é.', two: 'Ida e volta', one: 'Mão única',
      score: 'Você acertou', of: '{a} de {b}', ok: 'Isso. ', no: 'Olhe de novo. ',
      d1: 'Comprar uma parte pequena de um fundo que segue o mercado.',
      e1: 'Se mudar de ideia, você vende. Pode custar algo se caiu, mas a porta abre para os dois lados.',
      d2: 'Ser fiador do empréstimo de um amigo.',
      e2: 'Se seu amigo não pagar, a dívida passa a ser sua e você não pode "desassinar". É uma das clássicas portas de mão única.',
      d3: 'Testar por um mês um app para anotar seus gastos.',
      e3: 'Se não servir, você apaga. O custo é um pouco de tempo.',
      d4: 'Colocar todas as suas economias em um negócio próprio.',
      e4: 'Se o negócio fechar, o dinheiro não volta. Por isso convém testar pequeno antes e não colocar tudo.',
      d5: 'Compartilhar a chave da sua carteira de cripto com alguém.',
      e5: 'Uma chave compartilhada não pode ser "descompartilhada", e uma transferência em uma blockchain normalmente não pode ser revertida.',
      d6: 'Alugar por um ano em um bairro novo.',
      e6: 'Tem um custo (mudar de novo), mas depois de um ano você pode voltar ou ficar. É um jeito de testar antes de comprar.',
      d7: 'Pegar um empréstimo para investir em algo que "não pode dar errado".',
      e7: 'A dívida fica mesmo que o investimento caia. Se der errado, você não volta ao ponto de partida: fica mais embaixo.',
      d8: 'Mudar de banco a conta onde você recebe o salário.',
      e8: 'É burocracia. Se não gostar do banco novo, você volta ou testa outro.',
      d9: 'Transferir hoje para uma "oportunidade garantida" que te mandou mensagem.',
      e9: 'A urgência e a promessa de garantia são sinais de golpe, e dinheiro transferido para um golpista quase nunca volta.',
      d10: 'Investir $10 por mês durante seis meses para aprender.',
      e10: 'Pouco dinheiro, pouco tempo e dá para parar quando quiser. É o jeito barato de errar.'
    }
  });

  V.mount('puertas', function (root) {
    var KEY = ['two', 'one', 'two', 'one', 'one', 'two', 'one', 'two', 'one', 'two'];
    var ans = KEY.map(function () { return null; });
    var score = V.readout(D('score'));
    root.appendChild(V.h('p', { 'class': 'viz-cap', text: D('intro') }));
    KEY.forEach(function (right, i) {
      var fb = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
      var seg = V.segmented({ label: D('d' + (i + 1)), value: null,
        options: [{ v: 'two', label: D('two') }, { v: 'one', label: D('one') }],
        onChange: function (v) {
          ans[i] = v;
          fb.textContent = (v === right ? D('ok') : D('no')) + D('e' + (i + 1));
          fb.style.color = v === right ? 'var(--ny-green)' : 'var(--ny-bad)';
          paint();
        } });
      root.appendChild(V.h('div', { style: 'padding:12px 0;border-bottom:1px solid var(--ny-hair)' }, [seg.el, fb]));
    });
    root.appendChild(V.h('div', { 'class': 'viz-outs', style: 'margin-top:16px' }, [score.el]));
    function paint() {
      var done = ans.filter(function (a) { return a !== null; }).length;
      var good = ans.filter(function (a, i) { return a === KEY[i]; }).length;
      score.set(D('of', { a: good, b: done || KEY.length }), done && good === done ? 'good' : '');
    }
    paint();
  });

  // ---------- costo-deshacer ----------
  var C = V.texts({
    es: {
      buy: 'Costo de comprar (escritura, impuestos, comisiones)', sell: 'Costo de vender (comisión, impuestos)',
      upkeep: 'Mantenimiento e impuestos de la casa, por año', rent: 'Alquiler por año, como % del precio de la casa',
      growth: 'Cuánto cambia el precio de la casa por año', alt: 'Cuánto rendiría la plata en otra cosa, por año',
      years: 'Años hasta que te tenés que mudar',
      hint: 'Valor inicial elegido solo para empezar a mover. Buscá el número de tu país y tu ciudad.',
      hintG: 'Puede ser negativo: los precios de las casas también bajan.',
      oBuy: 'Comprar y deshacerlo en {n} años te cuesta', oRent: 'Alquilar {n} años te cuesta', oDoor: 'Solo entrar y salir por la puerta',
      oBe: 'Comprar sale menos que alquilar a partir de', be: '{n} años', beNo: 'no pasa en 20 años',
      xl: 'años hasta mudarte', yl: 'costo total', label: 'Costo de comprar y deshacerlo contra alquilar, según los años',
      lgBuy: 'Comprar y después vender', lgRent: 'Alquilar',
      cap: 'Con tus números, si te tenés que mudar a los {n} años, comprar te cuesta {d} {w} que alquilar. ',
      more: 'más', less: 'menos',
      capDoor: 'Solo los costos de entrar y salir ya son {c}: eso es lo que vale "deshacer" una compra, y lo pagás aunque la casa no haya cambiado de precio.',
      sim: 'Simulación con una casa de $100.000 pagada al contado, sin crédito. Supuestos: el alquiler y el precio de la casa se mueven igual, el mantenimiento es fijo, no hay impuestos sobre la ganancia. Todos los porcentajes los elegís vos.'
    },
    en: {
      buy: 'Cost of buying (deed, taxes, fees)', sell: 'Cost of selling (fees, taxes)',
      upkeep: 'Upkeep and property taxes, per year', rent: 'Rent per year, as a % of the home\'s price',
      growth: 'How much the home\'s price changes per year', alt: 'What the money would earn elsewhere, per year',
      years: 'Years until you have to move',
      hint: 'Starting value chosen only to get you moving. Look up the number for your country and city.',
      hintG: 'It can be negative: home prices also fall.',
      oBuy: 'Buying and undoing it after {n} years costs you', oRent: 'Renting for {n} years costs you', oDoor: 'Just walking in and out the door',
      oBe: 'Buying costs less than renting from', be: '{n} years', beNo: 'not within 20 years',
      xl: 'years until you move', yl: 'total cost', label: 'Cost of buying and undoing it against renting, by years',
      lgBuy: 'Buy, then sell', lgRent: 'Rent',
      cap: 'With your numbers, if you have to move after {n} years, buying costs you {d} {w} than renting. ',
      more: 'more', less: 'less',
      capDoor: 'The costs of getting in and out alone are already {c}: that is what "undoing" a purchase is worth, and you pay it even if the home\'s price did not change.',
      sim: 'Simulation with a $100,000 home paid in cash, no loan. Assumptions: rent and the home\'s price move together, upkeep is fixed, no tax on the gain. You choose every percentage.'
    },
    pt: {
      buy: 'Custo de comprar (escritura, impostos, comissões)', sell: 'Custo de vender (comissão, impostos)',
      upkeep: 'Manutenção e impostos da casa, por ano', rent: 'Aluguel por ano, como % do preço da casa',
      growth: 'Quanto muda o preço da casa por ano', alt: 'Quanto o dinheiro renderia em outra coisa, por ano',
      years: 'Anos até você precisar se mudar',
      hint: 'Valor inicial escolhido só para começar a mexer. Procure o número do seu país e da sua cidade.',
      hintG: 'Pode ser negativo: o preço das casas também cai.',
      oBuy: 'Comprar e desfazer em {n} anos te custa', oRent: 'Alugar por {n} anos te custa', oDoor: 'Só entrar e sair pela porta',
      oBe: 'Comprar sai mais barato que alugar a partir de', be: '{n} anos', beNo: 'não acontece em 20 anos',
      xl: 'anos até se mudar', yl: 'custo total', label: 'Custo de comprar e desfazer contra alugar, segundo os anos',
      lgBuy: 'Comprar e depois vender', lgRent: 'Alugar',
      cap: 'Com seus números, se você precisar se mudar em {n} anos, comprar te custa {d} {w} que alugar. ',
      more: 'a mais', less: 'a menos',
      capDoor: 'Só os custos de entrar e sair já são {c}: é isso que vale "desfazer" uma compra, e você paga mesmo que o preço da casa não tenha mudado.',
      sim: 'Simulação com uma casa de $100.000 paga à vista, sem financiamento. Premissas: o aluguel e o preço da casa se movem juntos, a manutenção é fixa, não há imposto sobre o ganho. Todas as porcentagens você escolhe.'
    }
  });

  V.mount('costo-deshacer', function (root) {
    var MAXN = 20, st = { price: 100000 };
    var pf = function (v) { return fmt.num(v, 1) + '%'; };
    function sl(id, min, max, step, value, hint) {
      var s = V.slider({ id: id, label: C(id), min: min, max: max, step: step, value: value, format: id === 'years' ? fmt.int : pf, hint: hint,
        onInput: function (v) { st[id] = v; paint(); } });
      st[id] = s.get();
      return s;
    }
    var sBuy = sl('buy', 0, 15, 0.5, 6, C('hint')), sSell = sl('sell', 0, 15, 0.5, 4);
    var sUp = sl('upkeep', 0, 5, 0.1, 1.5), sRent = sl('rent', 1, 10, 0.1, 4);
    var sG = sl('growth', -3, 8, 0.5, 2, C('hintG')), sAlt = sl('alt', 0, 10, 0.5, 3);
    var sY = sl('years', 1, MAXN, 1, 3);

    var oBuy = V.readout(''), oRent = V.readout(''), oDoor = V.readout(C('oDoor')), oBe = V.readout(C('oBe'));
    var chart = V.chart({ width: 640, height: 300, pad: { l: 76 }, xLabel: C('xl'), yLabel: C('yl'), label: C('label'),
      xFmt: function (v) { return fmt.int(v); }, yFmt: function (v) { return '$' + fmt.compact(v); } });
    var cap = V.h('p', { 'class': 'viz-cap' }), sim = V.h('p', { 'class': 'viz-cap', text: C('sim') });

    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [sBuy.el, sSell.el, sUp.el, sY.el]),
      V.h('div', { 'class': 'viz-controls' }, [sRent.el, sG.el, sAlt.el])
    ]));
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-outs' }, [oBuy.el, oRent.el]),
      V.h('div', { 'class': 'viz-outs' }, [oDoor.el, oBe.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'bad', label: C('lgBuy') }, { cls: 'a', label: C('lgRent') }]));
    root.appendChild(cap);
    root.appendChild(sim);

    function paint() {
      var o = { price: st.price, buy: st.buy / 100, sell: st.sell / 100, upkeep: st.upkeep / 100, rent: st.rent / 100, growth: st.growth / 100, alt: st.alt / 100 };
      var n = st.years, cb = costBuy(o, n), cr = costRent(o, n), be = breakEven(o, MAXN), door = doorCost(o, n);
      var lb = oBuy.el.querySelector('span'), lr = oRent.el.querySelector('span');
      lb.textContent = C('oBuy', { n: n }); lr.textContent = C('oRent', { n: n });
      oBuy.set(fmt.money(cb), cb > cr ? 'bad' : 'good');
      oRent.set(fmt.money(cr), cr > cb ? 'bad' : 'good');
      oDoor.set(fmt.money(door), 'bad');
      oBe.set(be > 0 ? C('be', { n: be }) : C('beNo'), '');
      var pb = [], pr = [];
      for (var y = 1; y <= MAXN; y++) { pb.push([y, costBuy(o, y)]); pr.push([y, costRent(o, y)]); }
      chart.draw({ x: [1, MAXN], yZero: true, series: [{ pts: pr, cls: 'a' }, { pts: pb, cls: 'bad' }],
        vlines: [{ x: n, cls: 'muted' }], marks: [{ x: n, y: cb, cls: 'bad' }, { x: n, y: cr, cls: 'a' }] });
      cap.textContent = C('cap', { n: n, d: fmt.money(Math.abs(cb - cr)), w: cb > cr ? C('more') : C('less') }) + C('capDoor', { c: fmt.money(door) });
      chart.describe(C('label'));
    }
    paint();
  });
})();
