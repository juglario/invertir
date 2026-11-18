// Widgets for "Más barato no siempre es más seguro" (thesis creep).
//   banco-modelo: a scripted, fictional bank over 12 quarters. A price-only rule
//                 ("it fell 40%, buy more") against a thesis rule (exit when two of
//                 three written facts fail, for 1 or 2 quarters in a row).
//   falsable:     sort eight sentences into "a fact that can fail", "a sentence that
//                 never fails" and "talks about the price or opinions".
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  // Fictional, scripted data. Not a real company. q = 0..12 (quarters).
  var PATHS = {
    rota: {   // the thesis really breaks
      price: [100, 96, 88, 80, 70, 62, 55, 48, 40, 33, 26, 20, 15],
      roe:   [12, 11.5, 11, 10, 9.5, 8.5, 8, 7, 6, 5, 4, 3, 2],
      mora:  [2.5, 2.8, 3.1, 3.6, 4.2, 4.8, 5.3, 5.9, 6.5, 7, 7.5, 8, 8.5],
      dep:   [2, 1.5, 1, 0.5, -0.5, -1, -1.5, -2, -2.5, -3, -3, -3.5, -4]
    },
    bache: {  // a real but temporary setback
      price: [100, 92, 80, 66, 58, 60, 68, 78, 88, 98, 108, 118, 126],
      roe:   [12, 11, 9.5, 9, 9.8, 10.5, 11.5, 12, 12.5, 13, 13, 13.5, 14],
      mora:  [2.5, 3.2, 4.1, 3.9, 3.7, 3.5, 3.2, 3.0, 2.8, 2.7, 2.6, 2.5, 2.5],
      dep:   [2, 1, 0.5, 0.3, 0.8, 1, 1.5, 2, 2, 2.5, 2.5, 3, 3]
    }
  };

  // How many of the three written facts fail in quarter q.
  function failsAt(p, q, th) {
    var n = 0;
    if (p.roe[q] < th.roe) n++;        // fact 1: return on equity at least th.roe %
    if (p.mora[q] > th.mora) n++;      // fact 2: late loans at most th.mora %
    if (p.dep[q] <= 0) n++;            // fact 3: deposits keep growing
    return n;
  }
  // First quarter where at least two facts failed for `persist` quarters in a row, or -1.
  function thesisExit(p, th, persist) {
    var run = 0;
    for (var q = 1; q < p.price.length; q++) {
      run = failsAt(p, q, th) >= 2 ? run + 1 : 0;
      if (run >= persist) return q;
    }
    return -1;
  }
  // Price-only rule: buy `amount` at q0, then another `amount` every time the price is
  // `drop` below the last purchase price, at most `maxAdds` times. Never sells.
  function priceRule(p, drop, maxAdds, amount) {
    var units = amount / p.price[0], invested = amount, last = p.price[0], buys = [];
    for (var q = 1; q < p.price.length; q++) {
      if (buys.length < maxAdds && p.price[q] <= last * (1 - drop) + 1e-9) {
        units += amount / p.price[q]; invested += amount; last = p.price[q]; buys.push(q);
      }
    }
    return { invested: invested, value: units * p.price[p.price.length - 1], buys: buys };
  }
  // Thesis rule: buy `amount` at q0, sell everything at the exit quarter and keep cash (0%).
  function thesisRule(p, th, persist, amount) {
    var ex = thesisExit(p, th, persist), N = p.price.length - 1;
    var px = ex >= 0 ? p.price[ex] : p.price[N];
    return { invested: amount, value: amount * px / p.price[0], exit: ex };
  }

  var API = { PATHS: PATHS, failsAt: failsAt, thesisExit: thesisExit, priceRule: priceRule, thesisRule: thesisRule };
  if (typeof module === 'object' && module.exports) module.exports = API;

  var V = typeof window !== 'undefined' && window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  var t = V.texts({
    es: {
      path: 'Qué le pasa al banco', rota: 'La tesis se rompe', bache: 'Un bache pasajero',
      roe: 'Hecho 1: la rentabilidad sobre el capital es de al menos', roeHint: 'Cuánto gana el banco por cada $100 de capital propio, por año.',
      mora: 'Hecho 2: la mora es como mucho de', moraHint: 'Préstamos que la gente dejó de pagar a tiempo, como % del total.',
      persist: 'La tesis se rompe si fallan dos hechos', p1: '1 trimestre', p2: '2 trimestres seguidos',
      fact3: 'Hecho 3, fijo: los depósitos siguen creciendo.',
      outPrice: 'Regla de precio ("bajó 40%, compro más"): lo que pusiste → lo que tenés al final', outThesis: 'Regla de tesis (salgo si fallan dos hechos): lo que pusiste → lo que tenés al final',
      putIn: '{a} → {b}',
      xl: 'trimestre', yl: 'precio de la acción', label: 'Precio de Banco Modelo, trimestre a trimestre',
      buyMore: 'compra más', exitL: 'sale', strip: 'hechos que fallan:',
      lgPrice: 'Precio (inventado)', lgExit: 'Salida de la tesis',
      capNoExit: 'Con estos hechos la tesis nunca se rompe: quien la escribió se queda hasta el final.',
      capExit: 'La regla de tesis vende en el trimestre {q}, a {px}, porque dos hechos fallaron. ',
      capRota: 'En este camino, cada compra extra de la regla de precio fue plata nueva puesta en un negocio que se estaba rompiendo.',
      capBache: 'En este camino el negocio se recupera: comprar en la baja salió bien, y una tesis escrita muy finita habría vendido de más. Desde adentro del trimestre 2 o 3 no se puede saber cuál de los dos caminos es el tuyo.',
      sim: 'Simulación con datos inventados. Supuestos: $1.000 por compra, hasta 3 compras extra, la plata que sale queda en efectivo sin rendir nada.'
    },
    en: {
      path: 'What happens to the bank', rota: 'The thesis breaks', bache: 'A temporary setback',
      roe: 'Fact 1: return on equity is at least', roeHint: 'How much the bank earns per $100 of its own capital, per year.',
      mora: 'Fact 2: bad loans are at most', moraHint: 'Loans people stopped paying on time, as a % of all loans.',
      persist: 'The thesis breaks if two facts fail for', p1: '1 quarter', p2: '2 quarters in a row',
      fact3: 'Fact 3, fixed: deposits keep growing.',
      outPrice: 'Price rule ("it fell 40%, buy more"): what you put in → what you have at the end', outThesis: 'Thesis rule (exit if two facts fail): what you put in → what you have at the end',
      putIn: '{a} → {b}',
      xl: 'quarter', yl: 'share price', label: 'Banco Modelo share price, quarter by quarter',
      buyMore: 'buys more', exitL: 'exits', strip: 'facts failing:',
      lgPrice: 'Price (made up)', lgExit: 'Thesis exit',
      capNoExit: 'With these facts the thesis never breaks: whoever wrote it stays to the end.',
      capExit: 'The thesis rule sells in quarter {q}, at {px}, because two facts failed. ',
      capRota: 'On this path, every extra purchase by the price rule was new money put into a business that was breaking.',
      capBache: 'On this path the business recovers: buying the dip worked, and a thesis written too tightly would have sold too early. From inside quarter 2 or 3 you cannot tell which of the two paths is yours.',
      sim: 'Simulation with made-up data. Assumptions: $1,000 per purchase, up to 3 extra purchases, money that leaves stays in cash earning nothing.'
    },
    pt: {
      path: 'O que acontece com o banco', rota: 'A tese quebra', bache: 'Um tropeço passageiro',
      roe: 'Fato 1: o retorno sobre o patrimônio é de pelo menos', roeHint: 'Quanto o banco ganha a cada $100 de capital próprio, por ano.',
      mora: 'Fato 2: a inadimplência é no máximo de', moraHint: 'Empréstimos que as pessoas deixaram de pagar em dia, como % do total.',
      persist: 'A tese quebra se dois fatos falharem por', p1: '1 trimestre', p2: '2 trimestres seguidos',
      fact3: 'Fato 3, fixo: os depósitos continuam crescendo.',
      outPrice: 'Regra de preço ("caiu 40%, compro mais"): o que você colocou → o que tem no fim', outThesis: 'Regra de tese (saio se dois fatos falharem): o que você colocou → o que tem no fim',
      putIn: '{a} → {b}',
      xl: 'trimestre', yl: 'preço da ação', label: 'Preço do Banco Modelo, trimestre a trimestre',
      buyMore: 'compra mais', exitL: 'sai', strip: 'fatos que falham:',
      lgPrice: 'Preço (inventado)', lgExit: 'Saída da tese',
      capNoExit: 'Com esses fatos a tese nunca quebra: quem a escreveu fica até o fim.',
      capExit: 'A regra de tese vende no trimestre {q}, a {px}, porque dois fatos falharam. ',
      capRota: 'Neste caminho, cada compra extra da regra de preço foi dinheiro novo colocado em um negócio que estava quebrando.',
      capBache: 'Neste caminho o negócio se recupera: comprar na queda deu certo, e uma tese escrita apertada demais teria vendido cedo. De dentro do trimestre 2 ou 3 não dá para saber qual dos dois caminhos é o seu.',
      sim: 'Simulação com dados inventados. Premissas: $1.000 por compra, até 3 compras extras, o dinheiro que sai fica em caixa sem render nada.'
    }
  });

  V.mount('banco-modelo', function (root) {
    var AMOUNT = 1000, DROP = 0.4, ADDS = 3;
    var st = { path: 'rota', roe: 10, mora: 4, persist: 2 };
    var pathSeg = V.segmented({ id: 'path', label: t('path'), value: 'rota',
      options: [{ v: 'rota', label: t('rota') }, { v: 'bache', label: t('bache') }],
      onChange: function (v) { st.path = v; paint(); } });
    var roeS = V.slider({ id: 'roe', label: t('roe'), min: 6, max: 14, step: 0.5, value: 10, hint: t('roeHint'),
      format: function (v) { return fmt.num(v, 1) + '%'; }, onInput: function (v) { st.roe = v; paint(); } });
    var moraS = V.slider({ id: 'mora', label: t('mora'), min: 2, max: 8, step: 0.5, value: 4, hint: t('moraHint'),
      format: function (v) { return fmt.num(v, 1) + '%'; }, onInput: function (v) { st.mora = v; paint(); } });
    var perSeg = V.segmented({ id: 'persist', label: t('persist'), value: '2',
      options: [{ v: '1', label: t('p1') }, { v: '2', label: t('p2') }],
      onChange: function (v) { st.persist = Number(v); paint(); } });
    st.path = pathSeg.get(); st.roe = roeS.get(); st.mora = moraS.get(); st.persist = Number(perSeg.get());

    var outP = V.readout(t('outPrice')), outT = V.readout(t('outThesis'));
    var chart = V.chart({ width: 640, height: 320, xLabel: t('xl'), yLabel: t('yl'), label: t('label'),
      xFmt: function (v) { return fmt.int(v); }, yFmt: function (v) { return '$' + fmt.int(v); } });
    var cap = V.h('p', { 'class': 'viz-cap' }), sim = V.h('p', { 'class': 'viz-cap' }, [t('sim')]);

    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [pathSeg.el, roeS.el, moraS.el, V.h('p', { 'class': 'viz-cap', text: t('fact3') }), perSeg.el]),
      V.h('div', { 'class': 'viz-outs' }, [outP.el, outT.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'a', label: t('lgPrice') }, { cls: 'bad', label: t('lgExit'), dash: true }]));
    root.appendChild(cap);
    root.appendChild(sim);

    function paint() {
      var p = PATHS[st.path], th = { roe: st.roe, mora: st.mora };
      var pr = priceRule(p, DROP, ADDS, AMOUNT), tr = thesisRule(p, th, st.persist, AMOUNT);
      outP.set(t('putIn', { a: fmt.money(pr.invested), b: fmt.money(pr.value) }), pr.value < pr.invested ? 'bad' : 'good');
      outT.set(t('putIn', { a: fmt.money(tr.invested), b: fmt.money(tr.value) }), tr.value < tr.invested ? 'bad' : 'good');
      var pts = p.price.map(function (v, q) { return [q, v]; });
      var marks = pr.buys.map(function (q) { return { x: q, y: p.price[q], label: t('buyMore'), cls: 'bad' }; });
      var texts = [{ x: 0, y: 145, text: t('strip'), cls: 'strong' }];
      for (var q = 1; q < p.price.length; q++) {
        var f = failsAt(p, q, th);
        texts.push({ x: q, y: 135, text: String(f), cls: f >= 2 ? 'bad strong' : '', anchor: 'middle' });
      }
      var vlines = [];
      if (tr.exit >= 0) {
        vlines.push({ x: tr.exit, cls: 'bad' });
        marks.push({ x: tr.exit, y: p.price[tr.exit], label: t('exitL'), cls: 'a' });
      }
      chart.draw({ x: [0, 12], y: [0, 150], series: [{ pts: pts, cls: 'a' }], marks: marks, vlines: vlines, texts: texts });
      var c = tr.exit >= 0 ? t('capExit', { q: tr.exit, px: '$' + fmt.int(p.price[tr.exit]) }) : t('capNoExit') + ' ';
      cap.textContent = c + (st.path === 'rota' ? t('capRota') : t('capBache'));
      chart.describe(t('label') + ': ' + p.price.join(', '));
    }
    paint();
  });

  // ---------- falsable ----------
  var F = V.texts({
    es: {
      intro: 'Para cada frase, elegí qué es. Las respuestas aparecen al tocar.',
      c1: 'Hecho que puede fallar', c2: 'Frase que nunca falla', c3: 'Habla del precio o de opiniones',
      score: 'Acertaste', of: '{a} de {b}', ok: 'Bien. ', no: 'No exactamente. ',
      s1: 'Las ventas del producto nuevo crecen más de 15% por año en los próximos dos años.',
      e1: 'Tiene un número, un plazo y puede salir mal. Eso es una tesis que se puede revisar.',
      s2: 'Es una gran empresa, ya va a volver.',
      e2: 'No dice cuándo ni cuánto. Pase lo que pase, la frase sigue "en pie". Ahí se esconde la tesis que se desliza.',
      s3: 'Bajó 40%, no puede valer tan poco.',
      e3: 'Es el precio convertido en argumento: el error exacto que cuenta Eisman.',
      s4: 'La mora se mantiene por debajo de 4% durante dos trimestres seguidos.',
      e4: 'Número, plazo y persistencia. Sale en cada reporte y puede fallar.',
      s5: 'Un analista famoso la recomendó.',
      e5: 'Una opinión puede ser un motivo para revisar, pero no es la revisión. No dice nada del negocio.',
      s6: 'La gerencia es excelente.',
      e6: 'Puede ser cierto, pero así escrito nunca falla. ¿Qué tendría que hacer la gerencia para que dejes de pensarlo?',
      s7: 'El cliente más grande renueva su contrato este año, y la empresa lo confirma.',
      e7: 'Es concreto, tiene fecha y lo confirma una fuente que se puede chequear.',
      s8: 'El gráfico se ve lindo para que suba.',
      e8: 'Habla del dibujo del precio, no del negocio.'
    },
    en: {
      intro: 'For each sentence, pick what it is. The answers appear when you tap.',
      c1: 'A fact that can fail', c2: 'A sentence that never fails', c3: 'Talks about the price or opinions',
      score: 'You got', of: '{a} of {b}', ok: 'Right. ', no: 'Not quite. ',
      s1: 'Sales of the new product grow more than 15% a year over the next two years.',
      e1: 'It has a number, a deadline, and it can turn out wrong. That is a thesis you can check.',
      s2: 'It is a great company, it will come back.',
      e2: 'It does not say when or how much. Whatever happens, the sentence still "stands". That is where thesis creep hides.',
      s3: 'It fell 40%, it cannot be worth this little.',
      e3: 'This is the price turned into the argument: the exact mistake Eisman describes.',
      s4: 'Bad loans stay below 4% for two quarters in a row.',
      e4: 'Number, deadline and persistence. It shows up in every report and it can fail.',
      s5: 'A famous analyst recommended it.',
      e5: 'An opinion can be a reason to re-check, but it is not the check. It says nothing about the business.',
      s6: 'Management is excellent.',
      e6: 'It may be true, but written like this it never fails. What would management have to do for you to stop believing it?',
      s7: 'The largest customer renews its contract this year, and the company confirms it.',
      e7: 'It is concrete, it has a date, and a source you can check confirms it.',
      s8: 'The chart looks ready to go up.',
      e8: 'It talks about the drawing of the price, not about the business.'
    },
    pt: {
      intro: 'Para cada frase, escolha o que ela é. As respostas aparecem ao tocar.',
      c1: 'Fato que pode falhar', c2: 'Frase que nunca falha', c3: 'Fala do preço ou de opiniões',
      score: 'Você acertou', of: '{a} de {b}', ok: 'Isso. ', no: 'Não exatamente. ',
      s1: 'As vendas do produto novo crescem mais de 15% ao ano nos próximos dois anos.',
      e1: 'Tem um número, um prazo e pode dar errado. Isso é uma tese que dá para revisar.',
      s2: 'É uma grande empresa, ela vai voltar.',
      e2: 'Não diz quando nem quanto. Aconteça o que acontecer, a frase continua "de pé". É aí que a tese escorrega.',
      s3: 'Caiu 40%, não pode valer tão pouco.',
      e3: 'É o preço virando argumento: o erro exato que Eisman conta.',
      s4: 'A inadimplência fica abaixo de 4% por dois trimestres seguidos.',
      e4: 'Número, prazo e persistência. Sai em cada relatório e pode falhar.',
      s5: 'Um analista famoso recomendou.',
      e5: 'Uma opinião pode ser motivo para revisar, mas não é a revisão. Não diz nada do negócio.',
      s6: 'A gestão é excelente.',
      e6: 'Pode ser verdade, mas escrito assim nunca falha. O que a gestão teria que fazer para você deixar de pensar isso?',
      s7: 'O maior cliente renova o contrato este ano, e a empresa confirma.',
      e7: 'É concreto, tem data e uma fonte que dá para checar confirma.',
      s8: 'O gráfico está bonito para subir.',
      e8: 'Fala do desenho do preço, não do negócio.'
    }
  });

  V.mount('falsable', function (root) {
    var KEY = [1, 2, 3, 1, 3, 2, 1, 3];
    var answers = KEY.map(function () { return null; });
    var score = V.readout(F('score'));
    root.appendChild(V.h('p', { 'class': 'viz-cap', text: F('intro') }));
    KEY.forEach(function (right, i) {
      var fb = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });
      var seg = V.segmented({ label: F('s' + (i + 1)), value: null,
        options: [{ v: 1, label: F('c1') }, { v: 2, label: F('c2') }, { v: 3, label: F('c3') }],
        onChange: function (v) {
          answers[i] = Number(v);
          fb.textContent = (answers[i] === right ? F('ok') : F('no')) + F('e' + (i + 1));
          fb.style.color = answers[i] === right ? 'var(--ny-green)' : 'var(--ny-bad)';
          paint();
        } });
      root.appendChild(V.h('div', { style: 'padding:12px 0;border-bottom:1px solid var(--ny-hair)' }, [seg.el, fb]));
    });
    var box = V.h('div', { 'class': 'viz-outs', style: 'margin-top:16px' }, [score.el]);
    root.appendChild(box);
    function paint() {
      var done = answers.filter(function (a) { return a !== null; }).length;
      var good = answers.filter(function (a, i) { return a === KEY[i]; }).length;
      score.set(F('of', { a: good, b: done || KEY.length }), done && good === done ? 'good' : '');
    }
    paint();
  });
})();
