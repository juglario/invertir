// viz.js: the small kit every School entry's simulators and graphics are built with.
// No dependencies, no network, nothing stored. An entry's own script (escuela/<slug>.js)
// calls IDC.viz.mount('widget-name', function (root, ctx) { ... }) for every
// <figure data-viz="widget-name"> in the page.
//
//   IDC.viz.h(tag, attrs, kids)        build an HTML node   (attrs.text sets textContent, onclick etc. add listeners)
//   IDC.viz.s(tag, attrs, kids)        build an SVG node
//   IDC.viz.texts(TX)                  t('key', {var: 1}) with TX = {es:{}, en:{}, pt:{}} (falls back to es)
//   IDC.viz.fmt                        int, num(n, d), pct(x, d), money(n, d), compact(n)  (x in 0..1, locale aware)
//   IDC.viz.slider({id,label,min,max,step,value,format,hint,onInput})  -> {el, get(), set(v)}
//   IDC.viz.segmented({id,label,options:[{v,label}],value,onChange})   -> {el, get(), set(v)}
//   IDC.viz.button(label, onClick)     IDC.viz.readout(label, {cls}) -> {el, set(text, cls)}
//   IDC.viz.chart({width,height,pad,xFmt,yFmt,xLabel,yLabel,label})    -> {svg, draw(spec), describe(text)}
//        spec = {x:[lo,hi], y:[lo,hi], yZero:true, series:[{pts:[[x,y]], cls, dash, width, area}],
//                bars:[{x0,x1,y0,y1,cls}], hlines:[{y,label,cls}], vlines:[{x,label,cls}],
//                marks:[{x,y,label,cls}], texts:[{x,y,text,cls,anchor}]}
//        cls is one of a b c d good bad muted (colours live in escuela.css, light and night)
//   IDC.viz.legend([{cls,label}])      IDC.viz.rng(seed) -> () => [0,1)      IDC.viz.animate(ms, onFrame(t01), onDone)
//   IDC.viz.param(id, default, min, max)   reads ?s.<id>=value from the URL (used by the tests and for sharing a state)
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var doc = document;
  var LANG = (doc.documentElement.getAttribute('lang') || 'es').slice(0, 2).toLowerCase();
  if (['es', 'en', 'pt'].indexOf(LANG) === -1) LANG = 'es';
  var LOCALE = { es: 'es-AR', en: 'en-US', pt: 'pt-BR' }[LANG];
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var QS = new URLSearchParams(window.location.search);
  var uid = 0;

  // ---------- DOM builders ----------
  function el(ns, tag, attrs, kids) {
    var n = ns ? doc.createElementNS(ns, tag) : doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : String(v));
    });
    (kids || []).forEach(function (c) { if (c !== null && c !== undefined) n.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c); });
    return n;
  }
  function h(tag, attrs, kids) { return el(null, tag, attrs, kids); }
  function s(tag, attrs, kids) { return el(NS, tag, attrs, kids); }

  // ---------- numbers ----------
  function nf(n, d) {
    d = d || 0;
    return (Number(n) || 0).toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  var fmt = {
    int: function (n) { return nf(Math.round(n), 0); },
    num: nf,
    pct: function (x, d) { return nf(x * 100, d === undefined ? 1 : d) + '%'; },
    money: function (n, d) { return (n < 0 ? '-' : '') + '$' + nf(Math.abs(n), d || 0); },
    compact: function (n) {
      var a = Math.abs(n), thou = LANG === 'en' ? 'K' : ' mil', mil = LANG === 'en' ? 'M' : ' M';
      if (a >= 1e9) return nf(n / 1e9, 1) + (LANG === 'en' ? 'B' : ' mil M');
      if (a >= 1e6) return nf(n / 1e6, a >= 1e7 ? 0 : 1) + mil;
      if (a >= 1e3) return nf(n / 1e3, a >= 1e4 ? 0 : 1) + thou;
      return nf(n, 0);
    }
  };

  function texts(TX) {
    return function (key, vars) {
      var v = TX[LANG] && TX[LANG][key] !== undefined ? TX[LANG][key] : (TX.es ? TX.es[key] : undefined);
      if (v === undefined) return key;
      return String(v).replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] !== undefined ? vars[k] : ''; });
    };
  }

  function rng(seed) {   // mulberry32: small, fast, repeatable
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
    };
  }
  function param(id, def, min, max) {
    var raw = QS.get('s.' + id);
    if (raw === null) return def;
    var v = Number(raw);
    if (!isFinite(v)) return def;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return v;
  }
  function animate(ms, onFrame, onDone) {
    if (REDUCE || !window.requestAnimationFrame) { onFrame(1); if (onDone) onDone(); return; }
    var t0 = null;
    (function step(ts) {
      if (t0 === null) t0 = ts;
      var t = Math.min(1, (ts - t0) / ms);
      onFrame(t);
      if (t < 1) window.requestAnimationFrame(step); else if (onDone) onDone();
    })(0);
  }

  // ---------- controls ----------
  function slider(o) {
    var id = 'viz-' + (++uid);
    var start = o.id ? param(o.id, o.value, o.min, o.max) : o.value;
    var out = h('output', { 'for': id, 'class': 'viz-val' });
    var input = h('input', { type: 'range', id: id, min: o.min, max: o.max, step: o.step || 1, value: start });
    var node = h('div', { 'class': 'viz-ctl' }, [h('label', { 'for': id, text: o.label }), out, input, o.hint ? h('small', { text: o.hint }) : null]);
    function paint() {
      var v = Number(input.value);
      out.textContent = o.format ? o.format(v) : String(v);
      input.style.setProperty('--fill', ((v - o.min) / (o.max - o.min) * 100) + '%');
    }
    input.addEventListener('input', function () { paint(); if (o.onInput) o.onInput(Number(input.value)); });
    paint();
    return { el: node, get: function () { return Number(input.value); }, set: function (v) { input.value = v; paint(); } };
  }

  function segmented(o) {
    var cur = o.value, fromUrl = o.id ? QS.get('s.' + o.id) : null;
    if (fromUrl !== null && o.options.some(function (x) { return String(x.v) === fromUrl; })) cur = fromUrl;
    var group = h('div', { 'class': 'viz-seg', role: 'group', 'aria-label': o.label || '' });
    var btns = o.options.map(function (opt) {
      var b = h('button', { type: 'button', text: opt.label });
      b.addEventListener('click', function () { set(opt.v); if (o.onChange) o.onChange(cur); });
      group.appendChild(b);
      return { b: b, v: opt.v };
    });
    function set(v) {
      cur = v;
      btns.forEach(function (x) { x.b.setAttribute('aria-pressed', String(x.v) === String(cur) ? 'true' : 'false'); });
    }
    set(cur);
    var node = h('div', { 'class': 'viz-ctl viz-ctl-seg' }, [o.label ? h('span', { 'class': 'viz-lab', text: o.label }) : null, group]);
    return { el: node, get: function () { return cur; }, set: set };
  }

  function button(label, onClick) { return h('button', { type: 'button', 'class': 'viz-btn', text: label, onclick: onClick }); }

  function readout(label, opts) {
    var v = h('strong', { 'class': 'viz-num' });
    var node = h('div', { 'class': 'viz-out' + (opts && opts.cls ? ' ' + opts.cls : '') }, [h('span', { text: label }), v]);
    return {
      el: node,
      set: function (text, cls) {
        v.textContent = text;
        v.className = 'viz-num' + (cls ? ' ' + cls : '');
      }
    };
  }

  function legend(items) {
    return h('div', { 'class': 'viz-legend' }, items.map(function (it) {
      return h('span', {}, [s('svg', { width: 22, height: 8, 'aria-hidden': 'true' }, [s('line', { x1: 0, y1: 4, x2: 22, y2: 4, 'class': 'ln-' + it.cls + (it.dash ? ' dash' : '') })]), it.label]);
    }));
  }

  // ---------- charts ----------
  function niceStep(range, n) {
    var raw = range / n, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  }
  function ticks(lo, hi, n) {
    if (!(hi > lo)) return [lo];
    var st = niceStep(hi - lo, n || 5), out = [], v = Math.ceil(lo / st - 1e-9) * st;
    for (; v <= hi + 1e-9; v += st) out.push((Math.round(v / st) * st) || 0);  // || 0 turns -0 into 0
    return out;
  }

  function chart(o) {
    o = o || {};
    var W = o.width || 640, H = o.height || 320;
    var P = { l: 58, r: 18, t: 16, b: 44 };
    if (o.pad) Object.keys(o.pad).forEach(function (k) { P[k] = o.pad[k]; });
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'viz-svg', role: 'img', 'aria-label': o.label || '', preserveAspectRatio: 'xMidYMid meet' });
    var api = { svg: svg };

    api.draw = function (spec) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var xs = [], ys = [];
      (spec.series || []).forEach(function (sr) { sr.pts.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
      (spec.bars || []).forEach(function (b) { xs.push(b.x0, b.x1); ys.push(b.y0, b.y1); });
      (spec.marks || []).forEach(function (m) { xs.push(m.x); ys.push(m.y); });
      var x0 = spec.x ? spec.x[0] : Math.min.apply(null, xs), x1 = spec.x ? spec.x[1] : Math.max.apply(null, xs);
      var y0, y1;
      if (spec.y) { y0 = spec.y[0]; y1 = spec.y[1]; }
      else {
        y0 = Math.min.apply(null, ys); y1 = Math.max.apply(null, ys);
        if (spec.yZero) { y0 = Math.min(y0, 0); y1 = Math.max(y1, 0); }
        var padY = (y1 - y0) * 0.06 || 1; y1 += padY; if (!spec.yZero || y0 < 0) y0 -= padY;
      }
      if (!(x1 > x0)) x1 = x0 + 1;
      if (!(y1 > y0)) y1 = y0 + 1;
      var iw = W - P.l - P.r, ih = H - P.t - P.b;
      var sx = function (x) { return P.l + (x - x0) / (x1 - x0) * iw; };
      var sy = function (y) { return H - P.b - (y - y0) / (y1 - y0) * ih; };
      api.sx = sx; api.sy = sy;

      ticks(y0, y1, 5).forEach(function (t) {
        svg.appendChild(s('line', { x1: P.l, x2: W - P.r, y1: sy(t), y2: sy(t), 'class': 'viz-grid' }));
        svg.appendChild(s('text', { x: P.l - 8, y: sy(t) + 4, 'class': 'viz-tick', 'text-anchor': 'end', text: (o.yFmt || fmt.compact)(t) }));
      });
      ticks(x0, x1, 6).forEach(function (t) {
        svg.appendChild(s('line', { x1: sx(t), x2: sx(t), y1: P.t, y2: H - P.b, 'class': 'viz-grid v' }));
        svg.appendChild(s('text', { x: sx(t), y: H - P.b + 18, 'class': 'viz-tick', 'text-anchor': 'middle', text: (o.xFmt || fmt.compact)(t) }));
      });
      if (o.xLabel) svg.appendChild(s('text', { x: P.l + iw / 2, y: H - 6, 'class': 'viz-axis', 'text-anchor': 'middle', text: o.xLabel }));
      if (o.yLabel) svg.appendChild(s('text', { x: 14, y: P.t + ih / 2, 'class': 'viz-axis', 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + (P.t + ih / 2) + ')', text: o.yLabel }));
      if (y0 < 0 && y1 > 0) svg.appendChild(s('line', { x1: P.l, x2: W - P.r, y1: sy(0), y2: sy(0), 'class': 'viz-zero' }));

      (spec.bars || []).forEach(function (b) {
        svg.appendChild(s('rect', { x: sx(b.x0), y: sy(Math.max(b.y0, b.y1)), width: Math.max(0, sx(b.x1) - sx(b.x0)), height: Math.abs(sy(b.y0) - sy(b.y1)), 'class': 'fill-' + (b.cls || 'a') }));
      });
      (spec.series || []).forEach(function (sr) {
        if (!sr.pts.length) return;
        var d = sr.pts.map(function (p, i) { return (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1); }).join('');
        if (sr.area) {
          var base = sy(Math.max(y0, Math.min(y1, sr.base === undefined ? y0 : sr.base)));
          svg.appendChild(s('path', { d: d + 'L' + sx(sr.pts[sr.pts.length - 1][0]).toFixed(1) + ' ' + base.toFixed(1) + 'L' + sx(sr.pts[0][0]).toFixed(1) + ' ' + base.toFixed(1) + 'Z', 'class': 'fill-' + (sr.cls || 'a') + ' soft' }));
        }
        svg.appendChild(s('path', { d: d, 'class': 'ln-' + (sr.cls || 'a') + (sr.dash ? ' dash' : ''), style: sr.width ? 'stroke-width:' + sr.width : null }));
      });
      (spec.hlines || []).forEach(function (l) {
        svg.appendChild(s('line', { x1: P.l, x2: W - P.r, y1: sy(l.y), y2: sy(l.y), 'class': 'ln-' + (l.cls || 'muted') + ' dash' }));
        if (l.label) svg.appendChild(s('text', { x: W - P.r - 4, y: sy(l.y) - 6, 'class': 'viz-note', 'text-anchor': 'end', text: l.label }));
      });
      (spec.vlines || []).forEach(function (l) {
        svg.appendChild(s('line', { x1: sx(l.x), x2: sx(l.x), y1: P.t, y2: H - P.b, 'class': 'ln-' + (l.cls || 'muted') + ' dash' }));
        if (l.label) svg.appendChild(s('text', { x: sx(l.x) + 5, y: P.t + 12, 'class': 'viz-note', text: l.label }));
      });
      (spec.marks || []).forEach(function (m) {
        svg.appendChild(s('circle', { cx: sx(m.x), cy: sy(m.y), r: 5, 'class': 'dot-' + (m.cls || 'a') }));
        if (m.label) {
          var right = sx(m.x) < P.l + iw * 0.6;
          svg.appendChild(s('text', { x: sx(m.x) + (right ? 10 : -10), y: sy(m.y) - 9, 'class': 'viz-note strong', 'text-anchor': right ? 'start' : 'end', text: m.label }));
        }
      });
      (spec.texts || []).forEach(function (t) {
        svg.appendChild(s('text', { x: sx(t.x), y: sy(t.y), 'class': 'viz-note ' + (t.cls || ''), 'text-anchor': t.anchor || 'start', text: t.text }));
      });
    };
    api.describe = function (text) { svg.setAttribute('aria-label', text); };
    return api;
  }

  // ---------- mounting ----------
  function mount(id, build) {
    var nodes = doc.querySelectorAll('[data-viz="' + id + '"]');
    [].forEach.call(nodes, function (root) {
      try { root.classList.add('viz-on'); build(root, { lang: LANG, locale: LOCALE, reduce: REDUCE }); }
      catch (e) {
        root.appendChild(h('p', { 'class': 'viz-err', text: 'viz error (' + id + '): ' + e.message }));
        if (window.console) window.console.error(e);
      }
    });
  }

  if (QS.has('debug')) {   // ?debug shows script errors on the page (for screenshots in headless browsers)
    window.addEventListener('error', function (e) {
      var box = doc.getElementById('viz-debug') || h('pre', { id: 'viz-debug', style: 'position:fixed;left:0;right:0;bottom:0;z-index:99;margin:0;padding:8px;background:#c62828;color:#fff;font:12px/1.4 monospace;white-space:pre-wrap' });
      box.textContent += e.message + ' @' + String(e.filename || '').split('/').pop() + ':' + e.lineno + '\n';
      if (!box.parentNode) doc.body.appendChild(box);
    });
  }

  window.IDC = window.IDC || {};
  window.IDC.viz = {
    lang: LANG, locale: LOCALE, reduce: REDUCE,
    h: h, s: s, fmt: fmt, texts: texts, rng: rng, param: param, animate: animate,
    slider: slider, segmented: segmented, button: button, readout: readout, legend: legend, chart: chart, mount: mount, ticks: ticks
  };
})();
