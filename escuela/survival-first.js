// Widgets for "Primero, sobrevivir".
//   loss-gain: how much you need to gain back after a loss, and how long it takes at a steady growth rate.
//   bet-size:  a repeated bet with an edge. Same edge, different bet sizes: overbetting turns a winning game into a losing one.
(function () {
  'use strict';

  // ---------- pure math (tested with node) ----------
  var M = {
    gainNeeded: function (d) { return d >= 1 ? Infinity : d / (1 - d); },
    yearsBack: function (d, g) { return d >= 1 || g <= 0 ? Infinity : Math.log(1 / (1 - d)) / Math.log(1 + g); },
    // typical (median) growth per round when betting a fraction f of your money, win prob p, even money
    growthPerRound: function (p, f) { return f >= 1 ? -Infinity : p * Math.log(1 + f) + (1 - p) * Math.log(1 - f); },
    kelly: function (p) { return Math.max(0, 2 * p - 1); },
    // many players, same rules; returns stats and a few sample paths (in dollars)
    simulate: function (rand, p, f, rounds, players, keep) {
      var finals = [], belowHalf = 0, belowStart = 0, paths = [];
      for (var i = 0; i < players; i++) {
        var w = 100, touched = false, path = i < keep ? [[0, w]] : null;
        for (var r = 1; r <= rounds; r++) {
          var bet = w * f;
          w = rand() < p ? w + bet : w - bet;
          if (w < 50) touched = true;
          if (path) path.push([r, w]);
        }
        finals.push(w);
        if (touched) belowHalf++;
        if (w < 100) belowStart++;
        if (path) paths.push(path);
      }
      finals.sort(function (a, b) { return a - b; });
      var mid = finals.length >> 1;
      return {
        median: finals.length % 2 ? finals[mid] : (finals[mid - 1] + finals[mid]) / 2,
        mean: finals.reduce(function (a, b) { return a + b; }, 0) / finals.length,
        pHalf: belowHalf / players,
        pLoss: belowStart / players,
        paths: paths
      };
    }
  };
  if (typeof window === 'undefined') { module.exports = M; return; }

  var V = window.IDC && window.IDC.viz;
  if (!V) return;
  var fmt = V.fmt;
  var t = V.texts({
    es: {
      loss: 'Cuánto perdés', lossHint: 'Arrastrá y mirá cómo se dispara la curva al final.',
      grow: 'Crecimiento después, por año', growHint: 'Un supuesto, no una promesa.',
      left: 'Lo que te queda de $100', need: 'Suba que necesitás para volver', yrs: 'Años para volver, a ese ritmo',
      chartL: 'Suba necesaria para recuperar una pérdida', xL: 'pérdida', yL: 'suba necesaria para volver',
      years: '{n} años', never: 'nunca',
      capL: 'Perder {d} te deja con {l}. Para volver a $100 tenés que ganar {g} sobre lo que quedó. Las primeras pérdidas son casi simétricas; las grandes no: de 50% para arriba la curva se va al cielo.',
      p: 'Probabilidad de ganar cada tirada', pHint: 'Si ganás, cobrás lo que apostaste. Si perdés, lo perdés.',
      f: 'Qué parte de tu plata apostás cada vez', fHint: 'La misma ventaja, distintos tamaños de apuesta.',
      med: 'Jugador típico (mediana) después de 100 tiradas', half: 'Jugadores que cayeron por debajo de $50 en algún momento', lossEnd: 'Jugadores que terminaron con menos de $100',
      reroll: 'Otras 1.000 personas', kel: 'la apuesta de Kelly',
      chartB: 'Doce jugadores de ejemplo con las mismas reglas', xB: 'tirada', yB: 'plata (escala por 10)',
      lgMed: 'el jugador típico, según la fórmula', lgOne: 'algunos jugadores de la simulación',
      capB: 'Simulación con 1.000 jugadores que empiezan con $100 y tiran 100 veces una moneda que sale a su favor {p} de las veces. La apuesta que más hace crecer al jugador típico es {k} de su plata (la fórmula de Kelly). Apostando {f}, el jugador típico termina con {m}.',
      capB0: 'Sin ventaja (50%), ningún tamaño de apuesta hace crecer al jugador típico: lo mejor es no apostar.',
      chartG: 'Crecimiento típico por tirada según cuánto apostás', xG: 'parte de tu plata en cada tirada', yG: 'crecimiento típico por tirada',
      you: 'vos'
    },
    en: {
      loss: 'How much you lose', lossHint: 'Drag it and watch the curve shoot up at the end.',
      grow: 'Growth afterwards, per year', growHint: 'An assumption, not a promise.',
      left: 'What is left of $100', need: 'Gain you need to get back', yrs: 'Years to get back, at that pace',
      chartL: 'Gain needed to recover from a loss', xL: 'loss', yL: 'gain needed to get back',
      years: '{n} years', never: 'never',
      capL: 'Losing {d} leaves you with {l}. To get back to $100 you need to gain {g} on what is left. Small losses are almost symmetric; big ones are not: past 50% the curve shoots up.',
      p: 'Chance of winning each flip', pHint: 'If you win, you collect what you bet. If you lose, you lose it.',
      f: 'Share of your money you bet each time', fHint: 'Same edge, different bet sizes.',
      med: 'Typical player (median) after 100 flips', half: 'Players who fell below $50 at some point', lossEnd: 'Players who ended with less than $100',
      reroll: 'Another 1,000 people', kel: 'the Kelly bet',
      chartB: 'Twelve sample players with the same rules', xB: 'flip', yB: 'money (x10 scale)',
      lgMed: 'the typical player, from the formula', lgOne: 'some players from the simulation',
      capB: 'Simulation with 1,000 players who start with $100 and flip 100 times a coin that lands in their favour {p} of the time. The bet that grows the typical player fastest is {k} of their money (the Kelly formula). Betting {f}, the typical player ends with {m}.',
      capB0: 'With no edge (50%), no bet size grows the typical player: the best bet is no bet.',
      chartG: 'Typical growth per flip by bet size', xG: 'share of your money on each flip', yG: 'typical growth per flip',
      you: 'you'
    },
    pt: {
      loss: 'Quanto você perde', lossHint: 'Arraste e veja a curva disparar no final.',
      grow: 'Crescimento depois, por ano', growHint: 'Uma suposição, não uma promessa.',
      left: 'O que sobra de $100', need: 'Alta necessária para voltar', yrs: 'Anos para voltar, nesse ritmo',
      chartL: 'Alta necessária para recuperar uma perda', xL: 'perda', yL: 'alta necessária para voltar',
      years: '{n} anos', never: 'nunca',
      capL: 'Perder {d} deixa você com {l}. Para voltar a $100 você precisa ganhar {g} sobre o que sobrou. Perdas pequenas são quase simétricas; as grandes não: acima de 50% a curva dispara.',
      p: 'Chance de ganhar cada jogada', pHint: 'Se ganha, recebe o que apostou. Se perde, perde.',
      f: 'Parte do seu dinheiro que você aposta a cada vez', fHint: 'A mesma vantagem, tamanhos diferentes de aposta.',
      med: 'Jogador típico (mediana) depois de 100 jogadas', half: 'Jogadores que caíram abaixo de $50 em algum momento', lossEnd: 'Jogadores que terminaram com menos de $100',
      reroll: 'Outras 1.000 pessoas', kel: 'a aposta de Kelly',
      chartB: 'Doze jogadores de exemplo com as mesmas regras', xB: 'jogada', yB: 'dinheiro (escala x10)',
      lgMed: 'o jogador típico, pela fórmula', lgOne: 'alguns jogadores da simulação',
      capB: 'Simulação com 1.000 jogadores que começam com $100 e jogam 100 vezes uma moeda que cai a seu favor {p} das vezes. A aposta que mais faz crescer o jogador típico é {k} do dinheiro (a fórmula de Kelly). Apostando {f}, o jogador típico termina com {m}.',
      capB0: 'Sem vantagem (50%), nenhum tamanho de aposta faz o jogador típico crescer: o melhor é não apostar.',
      chartG: 'Crescimento típico por jogada conforme a aposta', xG: 'parte do seu dinheiro em cada jogada', yG: 'crescimento típico por jogada',
      you: 'você'
    }
  });
  var pct0 = function (x) { return fmt.pct(x, 0); };
  var money = function (n) { return n >= 100 ? fmt.money(n, 0) : fmt.money(n, n >= 1 ? 2 : 2); };

  // ---------- widget 1: loss -> gain needed ----------
  V.mount('loss-gain', function (root) {
    var dS = V.slider({ id: 'loss', label: t('loss'), min: 1, max: 90, step: 1, value: 50, format: function (v) { return v + '%'; }, hint: t('lossHint'), onInput: paint });
    var gS = V.slider({ id: 'grow', label: t('grow'), min: 1, max: 12, step: 0.5, value: 7, format: function (v) { return fmt.num(v, 1) + '%'; }, hint: t('growHint'), onInput: paint });
    var oL = V.readout(t('left')), oN = V.readout(t('need')), oY = V.readout(t('yrs'));
    var chart = V.chart({ width: 640, pad: { l: 72 }, height: 300, xLabel: t('xL'), yLabel: t('yL'), label: t('chartL'), xFmt: function (v) { return v + '%'; }, yFmt: function (v) { return fmt.int(v) + '%'; } });
    var cap = V.h('p', { 'class': 'viz-cap' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [dS.el, gS.el]),
      V.h('div', { 'class': 'viz-outs' }, [oL.el, oN.el, oY.el])
    ]));
    root.appendChild(chart.svg);
    root.appendChild(cap);
    var curve = [], sym = [];
    for (var x = 0; x <= 90; x += 1) { curve.push([x, M.gainNeeded(x / 100) * 100]); sym.push([x, x]); }

    function paint() {
      var d = dS.get() / 100, g = gS.get() / 100, need = M.gainNeeded(d), yb = M.yearsBack(d, g);
      oL.set(fmt.money(100 * (1 - d), 0), d >= 0.5 ? 'bad' : '');
      oN.set('+' + fmt.pct(need, 0), need >= 1 ? 'bad' : '');
      oY.set(isFinite(yb) ? t('years', { n: fmt.num(yb, 1) }) : t('never'), yb > 10 ? 'bad' : '');
      chart.draw({
        x: [0, 90], y: [0, 900],
        series: [{ pts: sym, cls: 'muted', dash: true }, { pts: curve, cls: 'a', area: true }],
        marks: [{ x: d * 100, y: need * 100, cls: 'bad', label: '+' + fmt.pct(need, 0) }]
      });
      cap.textContent = t('capL', { d: pct0(d), l: fmt.money(100 * (1 - d), 0), g: '+' + pct0(need) });
      chart.describe(t('chartL'));
    }
    paint();
  });

  // ---------- widget 2: bet size with an edge ----------
  V.mount('bet-size', function (root) {
    var seed = V.param('seed', 11, 1, 1e9), ROUNDS = 100, PLAYERS = 1000, KEEP = 12;
    var pS = V.slider({ id: 'p', label: t('p'), min: 50, max: 70, step: 1, value: 60, format: function (v) { return v + '%'; }, hint: t('pHint'), onInput: paint });
    var fS = V.slider({ id: 'f', label: t('f'), min: 0, max: 100, step: 5, value: 50, format: function (v) { return v + '%'; }, hint: t('fHint'), onInput: paint });
    var oM = V.readout(t('med')), oH = V.readout(t('half')), oE = V.readout(t('lossEnd'));
    var gchart = V.chart({ width: 640, pad: { l: 72 }, height: 240, xLabel: t('xG'), yLabel: t('yG'), label: t('chartG'), xFmt: function (v) { return v + '%'; }, yFmt: function (v) { return (v > 0 ? '+' : '') + fmt.num(v, 0) + '%'; } });
    var chart = V.chart({ width: 640, height: 300, xLabel: t('xB'), yLabel: t('yB'), label: t('chartB'), xFmt: fmt.int, pad: { l: 72 }, yFmt: function (v) { return fmt.money(Math.pow(10, v - 2), v < 2 ? 2 : 0); } });
    var cap = V.h('p', { 'class': 'viz-cap' });
    root.appendChild(V.h('div', { 'class': 'viz-grid-2' }, [
      V.h('div', { 'class': 'viz-controls' }, [pS.el, fS.el, V.button(t('reroll'), function () { seed = (seed * 48271 + 11) % 2147483647; paint(); })]),
      V.h('div', { 'class': 'viz-outs' }, [oM.el, oH.el, oE.el])
    ]));
    root.appendChild(gchart.svg);
    root.appendChild(chart.svg);
    root.appendChild(V.legend([{ cls: 'bad', label: t('lgMed') }, { cls: 'muted', label: t('lgOne') }]));
    root.appendChild(cap);

    function paint() {
      var p = pS.get() / 100, f = fS.get() / 100, k = M.kelly(p);
      var sim = M.simulate(V.rng(seed), p, f, ROUNDS, PLAYERS, KEEP);
      oM.set(money(sim.median), sim.median < 100 ? 'bad' : 'good');
      oH.set(pct0(sim.pHalf), sim.pHalf > 0.25 ? 'bad' : '');
      oE.set(pct0(sim.pLoss), sim.pLoss > 0.5 ? 'bad' : '');

      // growth curve by bet size (percent per flip, typical player)
      var gpts = [];
      for (var x = 0; x <= 95; x += 1) {
        var gr = (Math.exp(M.growthPerRound(p, x / 100)) - 1) * 100;
        if (gr < -6) break;
        gpts.push([x, gr]);
      }
      var gHere = f >= 1 ? -100 : (Math.exp(M.growthPerRound(p, f)) - 1) * 100;
      var top = (Math.exp(M.growthPerRound(p, k)) - 1) * 100;
      gchart.draw({
        x: [0, 100], y: [-6, Math.max(3, Math.ceil(top + 0.5))],
        series: [{ pts: gpts, cls: 'a' }],
        vlines: k > 0 ? [{ x: k * 100, label: t('kel'), cls: 'muted' }] : [],
        marks: [{ x: f * 100, y: Math.max(gHere, -6), cls: 'bad', label: t('you') }]
      });
      gchart.describe(t('chartG'));

      var LO = 0, HI = 7;   // $0.01 to $100,000 on a log scale (axis value = log10(dollars) + 2)
      var lg = function (w) { return Math.max(LO, Math.min(HI, Math.log(Math.max(w, 1e-9)) / Math.LN10 + 2)); };
      var series = sim.paths.map(function (path) { return { pts: path.map(function (q) { return [q[0], lg(q[1])]; }), cls: 'muted', width: 1.2 }; });
      var gr0 = M.growthPerRound(p, f), med = [];
      for (var r = 0; r <= ROUNDS; r += 2) med.push([r, lg(f >= 1 ? (r === 0 ? 100 : 0) : 100 * Math.exp(gr0 * r))]);
      series.push({ pts: med, cls: 'bad', width: 3 });
      chart.draw({ x: [0, ROUNDS], y: [LO, HI], series: series, hlines: [{ y: 4, label: fmt.money(100, 0), cls: 'muted' }] });
      chart.describe(t('chartB'));
      cap.textContent = k > 0 ? t('capB', { p: pct0(p), k: pct0(k), f: pct0(f), m: money(sim.median) }) : t('capB0');
    }
    paint();
  });
})();
