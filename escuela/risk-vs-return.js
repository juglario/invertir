// Drawdown simulator for "Riesgo no es que el precio se mueva" (es, en, pt).
// Two people hold $100 in the same thing. The market falls by d in year 1, then
// grows at g a year. One holds; the other sells at the bottom and keeps cash (0%).
(function () {
  'use strict';
  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;

  var t = V.texts({
    es: {
      d_label: 'Cuánto cae en el año 1', d_hint: 'Una caída de 50% puede pasar en una crisis fuerte.',
      g_label: 'Cuánto crece después, por año', g_hint: 'Un supuesto, no una promesa. Algunos años sube, otros baja.',
      r_years: 'Años para volver al punto de partida', r_lost: 'Pérdida de quien vendió en el fondo', r_held: 'Quien aguantó, a los 15 años',
      x: 'años', y: 'valor de $100', chart: 'Dos caminos después de una caída',
      held: 'Aguantó', sold: 'Vendió en el fondo', one: ' año', many: ' años', forever: '−{p} para siempre',
      start: '$100 (lo que tenías)', bottom: 'el fondo',
      note: 'Quien aguantó vuelve a $100 en {n} años. Quien vendió en el fondo se queda en ${f}, y esa pérdida no vuelve sola: necesita una decisión (volver a entrar) y un precio (que sea más bajo).',
      never: 'Con 0% de crecimiento, nadie vuelve a $100: quien aguantó y quien vendió se quedan en ${f}. Sin crecimiento, aguantar no alcanza.',
      desc: 'Caída de {d} y crecimiento de {g}% por año'
    },
    en: {
      d_label: 'How much it falls in year 1', d_hint: 'A 50% fall can happen in a severe crisis.',
      g_label: 'How much it grows afterwards, per year', g_hint: 'An assumption, not a promise. Some years it goes up, some years down.',
      r_years: 'Years to get back to where you started', r_lost: 'Loss for the one who sold at the bottom', r_held: 'The one who held, after 15 years',
      x: 'years', y: 'value of $100', chart: 'Two paths after a fall',
      held: 'Held on', sold: 'Sold at the bottom', one: ' year', many: ' years', forever: '−{p} for good',
      start: '$100 (what you had)', bottom: 'the bottom',
      note: 'The one who held gets back to $100 in {n} years. The one who sold at the bottom stays at ${f}, and that loss does not come back by itself: it needs a decision (buying back in) and a price (a lower one).',
      never: 'With 0% growth, nobody gets back to $100: the one who held and the one who sold both stay at ${f}. Without growth, holding on is not enough.',
      desc: 'A {d} fall and {g}% growth per year'
    },
    pt: {
      d_label: 'Quanto cai no ano 1', d_hint: 'Uma queda de 50% pode acontecer numa crise forte.',
      g_label: 'Quanto cresce depois, por ano', g_hint: 'Uma suposição, não uma promessa. Alguns anos sobe, outros cai.',
      r_years: 'Anos para voltar ao ponto de partida', r_lost: 'Perda de quem vendeu no fundo', r_held: 'Quem segurou, depois de 15 anos',
      x: 'anos', y: 'valor de $100', chart: 'Dois caminhos depois de uma queda',
      held: 'Segurou', sold: 'Vendeu no fundo', one: ' ano', many: ' anos', forever: '−{p} para sempre',
      start: '$100 (o que você tinha)', bottom: 'o fundo',
      note: 'Quem segurou volta a $100 em {n} anos. Quem vendeu no fundo fica com ${f}, e essa perda não volta sozinha: precisa de uma decisão (voltar a comprar) e de um preço (que seja mais baixo).',
      never: 'Com 0% de crescimento, ninguém volta a $100: quem segurou e quem vendeu ficam em ${f}. Sem crescimento, segurar não basta.',
      desc: 'Queda de {d} e crescimento de {g}% por ano'
    }
  });

  V.mount('drawdown', function (root) {
    var YEARS = 15;
    var st = { d: 0.5, g: 0.07 };

    var dSlider = V.slider({
      id: 'd', label: t('d_label'), min: 5, max: 80, step: 1, value: 50,
      format: function (v) { return v + '%'; }, hint: t('d_hint'),
      onInput: function (v) { st.d = v / 100; paint(); }
    });
    var gSlider = V.slider({
      id: 'g', label: t('g_label'), min: 0, max: 12, step: 0.5, value: 7,
      format: function (v) { return fmt.num(v, 1) + '%'; }, hint: t('g_hint'),
      onInput: function (v) { st.g = v / 100; paint(); }
    });
    st.d = dSlider.get() / 100; st.g = gSlider.get() / 100;

    var yrs = V.readout(t('r_years'));
    var lost = V.readout(t('r_lost'));
    var held = V.readout(t('r_held'));

    var chart = V.chart({ width: 640, height: 300, xLabel: t('x'), yLabel: t('y'), label: t('chart'), yFmt: function (v) { return '$' + fmt.num(v, 0); } });
    var legend = V.legend([{ cls: 'a', label: t('held') }, { cls: 'bad', label: t('sold') }]);
    var note = V.h('p', { 'class': 'viz-cap', 'aria-live': 'polite' });

    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [dSlider.el, gSlider.el]),
      V.h('div', { 'class': 'viz-outs' }, [yrs.el, lost.el, held.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(legend);
    root.appendChild(note);

    function paint() {
      var d = st.d, g = st.g;
      var floor = 100 * (1 - d);
      var sellerPts = [], holderPts = [];
      for (var k = 0; k <= YEARS; k++) {
        holderPts.push([k, k === 0 ? 100 : floor * Math.pow(1 + g, k - 1)]);
        sellerPts.push([k, k === 0 ? 100 : floor]);
      }
      var n = g > 0 ? Math.log(1 / (1 - d)) / Math.log(1 + g) : Infinity;
      var nTxt = isFinite(n) ? fmt.num(n, 1) : '∞';
      yrs.set(isFinite(n) ? nTxt + (n === 1 ? t('one') : t('many')) : nTxt, n > 10 ? 'bad' : '');
      lost.set(t('forever', { p: fmt.pct(d, 0) }), 'bad');
      var heldEnd = holderPts[YEARS][1];
      held.set('$' + fmt.num(heldEnd, 0), heldEnd >= 100 ? 'good' : '');

      chart.draw({
        x: [0, YEARS],
        y: [0, 140],
        series: [{ pts: holderPts, cls: 'a' }, { pts: sellerPts, cls: 'bad', width: 3 }],
        hlines: [{ y: 100, label: t('start'), cls: 'muted' }],
        marks: [{ x: 1, y: floor, label: t('bottom'), cls: 'bad' }]
      });

      note.textContent = isFinite(n)
        ? t('note', { n: fmt.num(n, 1), f: fmt.num(floor, 0) })
        : t('never', { f: fmt.num(floor, 0) });
      chart.describe(t('desc', { d: fmt.pct(d, 0), g: fmt.num(g * 100, 1) }));
    }

    paint();
  });
})();
