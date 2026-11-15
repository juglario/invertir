// Renders content.js as one editorial scroll. No dependencies, no network
// calls: works opened straight from disk (file://).
(function () {
  'use strict';

  var LS_LANG = 'idc.lang';
  var LS_DONE = 'idc.done';
  var ROMAN = { 1: 'I', 2: 'II', 3: 'III' };

  var page = document.getElementById('page');
  var railList = document.getElementById('rail-list');
  var railProgress = document.getElementById('rail-progress');
  var nowLabel = document.getElementById('now');
  var progressBar = document.getElementById('progress');

  var lang = readLang();
  var quizState = {};
  var railLinks = {};
  var observers = [];
  var activeId = null;
  var uid = 0;
  var hasIO = typeof window.IntersectionObserver === 'function';
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- storage (localStorage can throw in private mode / file://) ----------

  function readLang() {
    var saved = null;
    try { saved = localStorage.getItem(LS_LANG); } catch (e) { /* ignore */ }
    if (saved === 'es' || saved === 'en') return saved;
    var nav = (navigator.language || 'es').toLowerCase();
    return nav.indexOf('en') === 0 ? 'en' : 'es';
  }
  function saveLang() { try { localStorage.setItem(LS_LANG, lang); } catch (e) { /* ignore */ } }
  function readDone() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS_DONE));
      return Array.isArray(raw) ? raw.filter(function (id) { return typeof id === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function markDone(id) {
    var done = readDone();
    if (done.indexOf(id) === -1) done.push(id);
    try { localStorage.setItem(LS_DONE, JSON.stringify(done)); } catch (e) { /* ignore */ }
  }
  function resetDone() { try { localStorage.removeItem(LS_DONE); } catch (e) { /* ignore */ } }

  // ---------- helpers ----------

  function t(key) { return window.UI[lang][key]; }

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    // html is only ever our own static copy from content.js, never reader input.
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function svg(tag, attrs) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function locale() { return lang === 'es' ? 'es-AR' : 'en-US'; }
  function money(n) { return '$' + Math.round(n).toLocaleString(locale()); }
  function pct(n) { return n.toLocaleString(locale(), { maximumFractionDigits: 1 }) + '%'; }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function fill(str, vals) { return str.replace(/\{(\w+)\}/g, function (_, k) { return vals[k]; }); }
  // Lesson prose = core body (content.js) + depth layer (deep.js), read as one.
  function paragraphs(lesson) {
    var deep = (window.DEEP && window.DEEP[lesson.id] && window.DEEP[lesson.id][lang]) || [];
    return lesson[lang].body.concat(deep);
  }

  var WPM = 220;
  function words(str) { return str.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; }
  function lessonWords(lesson) {
    var c = lesson[lang];
    return words([c.title, c.oneLine, c.analogy].concat(paragraphs(lesson)).join(' '));
  }
  function minutes(w) { return Math.max(1, Math.round(w / WPM)); }

  function clampNum(raw, min, max) {
    var v = parseFloat(raw);
    if (!isFinite(v)) v = min;
    return Math.min(max, Math.max(min, v));
  }

  // ---------- render ----------

  function render() {
    disconnectObservers();
    quizState = {};
    document.documentElement.lang = lang;
    document.title = t('siteTitle');
    document.getElementById('brand').textContent = t('siteTitle');
    document.getElementById('lang-toggle').textContent = t('langToggle');
    document.getElementById('rail-title').textContent = t('indexTitle');
    document.getElementById('disclaimer').textContent = t('disclaimer');

    page.innerHTML = '';
    page.appendChild(buildHero());
    window.PARTS.forEach(function (part) {
      page.appendChild(buildPartDivider(part));
      window.LESSONS.forEach(function (lesson, i) {
        if (lesson.part === part.id) page.appendChild(buildLesson(lesson, i));
      });
    });
    page.appendChild(buildEnd());

    buildRail();
    setupReveal();
    setupActiveTracking();
    onScroll();
  }

  function buildHero() {
    var sec = el('section', 'hero');
    sec.id = 'top';
    var inner = el('div', 'hero-inner');
    var total = 0;
    window.LESSONS.forEach(function (l) { total += lessonWords(l); });
    inner.appendChild(el('p', 'kicker', t('heroKicker') + ' · ~' + minutes(total) + ' ' + t('readTime')));
    var h = el('h1', 'hero-title');
    h.textContent = t('siteTitle');
    h.appendChild(el('span', 'dot', '.'));
    inner.appendChild(h);
    inner.appendChild(el('p', 'hero-sub', t('tagline')));

    var pts = compoundSeries(0, 100, 30, 7);
    var last = pts[pts.length - 1];
    var fig = el('figure', 'hero-fig');
    fig.appendChild(heroCurve(pts));
    var cap = el('figcaption', 'hero-cap');
    cap.textContent = fill(t('heroCaption'), { put: money(last.contributed), end: money(last.bal) });
    fig.appendChild(cap);
    inner.appendChild(fig);

    var cue = el('a', 'scroll-cue');
    cue.href = '#' + window.LESSONS[0].id;
    cue.textContent = t('scrollCue') + ' ↓';
    var ctas = el('div', 'hero-ctas');
    ctas.appendChild(cue);
    inner.appendChild(ctas);
    // Independent entry points for specific audiences (Spanish-only pages).
    var entries = el('nav', 'entries');
    entries.setAttribute('aria-label', t('entriesLabel'));
    entries.appendChild(el('span', 'entries-label', t('entriesLabel')));
    [['empezar.html', 'entryEmpezar'], ['la-casa.html', 'entryKids'], ['futbolistas.html', 'entryFutbol'], ['creadores.html', 'entryCreadores'], ['de-golpe.html', 'entryGolpe'], ['academia.html', 'entryAcademia']].forEach(function (e) {
      var a = el('a', 'entry');
      a.href = e[0];
      a.textContent = t(e[1]);
      entries.appendChild(a);
    });
    inner.appendChild(entries);
    sec.appendChild(inner);
    return sec;
  }

  // The hero figure is the site's thesis: what you put in vs what time adds.
  function heroCurve(pts) {
    var W = 800, H = 260, padR = 120;
    var max = pts[pts.length - 1].bal;
    var x = function (i) { return ((i + 1) / pts.length) * (W - padR); };
    var y = function (v) { return H - (v / max) * (H - 20); };
    var bal = 'M0,' + H, put = 'M0,' + H, area = 'M0,' + H;
    pts.forEach(function (p, i) {
      bal += ' L' + x(i).toFixed(1) + ',' + y(p.bal).toFixed(1);
      put += ' L' + x(i).toFixed(1) + ',' + y(p.contributed).toFixed(1);
      area += ' L' + x(i).toFixed(1) + ',' + y(p.bal).toFixed(1);
    });
    area += ' L' + x(pts.length - 1).toFixed(1) + ',' + H + ' Z';
    var lastX = x(pts.length - 1);
    var last = pts[pts.length - 1];

    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': t('heroCaption').replace(/\{(\w+)\}/g, '') });
    var defs = svg('defs');
    var grad = svg('linearGradient', { id: 'heroGrad', x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.appendChild(svg('stop', { offset: '0%', 'stop-color': '#ff5a1f', 'stop-opacity': '0.28' }));
    grad.appendChild(svg('stop', { offset: '100%', 'stop-color': '#ff5a1f', 'stop-opacity': '0' }));
    defs.appendChild(grad);
    s.appendChild(defs);
    s.appendChild(svg('line', { x1: 0, y1: H, x2: W - padR, y2: H, class: 'curve-axis' }));
    s.appendChild(svg('path', { d: area, class: 'curve-area fade-late' }));
    s.appendChild(svg('path', { d: put, class: 'curve-put' }));
    s.appendChild(svg('path', { d: bal, class: 'curve-bal draw', pathLength: 1 }));
    var lb = svg('text', { x: lastX + 12, y: y(last.bal) + 5, class: 'curve-label fade-late' });
    lb.textContent = money(last.bal);
    var lp = svg('text', { x: lastX + 12, y: y(last.contributed) + 5, class: 'curve-label put fade-late' });
    lp.textContent = money(last.contributed);
    s.appendChild(lb);
    s.appendChild(lp);
    return s;
  }

  function buildPartDivider(part) {
    var sec = el('section', 'part-divider');
    var inner = el('div', 'part-inner reveal');
    inner.appendChild(el('span', 'part-num', ROMAN[part.id]));
    var box = el('div');
    box.appendChild(el('p', 'eyebrow', t('part') + ' ' + ROMAN[part.id]));
    box.appendChild(el('h2', 'part-title', part[lang].title));
    box.appendChild(el('p', 'part-desc', part[lang].desc));
    inner.appendChild(box);
    sec.appendChild(inner);
    return sec;
  }

  function buildLesson(lesson, idx) {
    var c = lesson[lang];
    var sec = el('section', 'lesson');
    sec.id = lesson.id;

    var head = el('header', 'lesson-head reveal');
    head.appendChild(el('span', 'lesson-num', pad2(idx + 1)));
    var hb = el('div');
    hb.appendChild(el('p', 'eyebrow', t('lesson') + ' ' + pad2(idx + 1) + ' / ' + pad2(window.LESSONS.length) + ' · ' + minutes(lessonWords(lesson)) + ' ' + t('readShort')));
    hb.appendChild(el('h2', 'lesson-title', c.title));
    head.appendChild(hb);
    sec.appendChild(head);

    var col = el('div', 'col');
    var pull = el('blockquote', 'pull reveal');
    pull.appendChild(el('span', 'label', t('inOneLine')));
    pull.appendChild(el('p', null, c.oneLine));
    col.appendChild(pull);
    paragraphs(lesson).forEach(function (p) { col.appendChild(el('p', 'body reveal', p)); });
    var an = el('aside', 'analogy reveal');
    an.appendChild(el('span', 'label', t('thinkOfIt')));
    an.appendChild(el('p', null, c.analogy));
    col.appendChild(an);
    sec.appendChild(col);

    if (lesson.tool) {
      var wrap = el('div', 'instrument-wrap reveal');
      wrap.appendChild(buildTool(lesson.tool));
      sec.appendChild(wrap);
    }

    var col2 = el('div', 'col');
    col2.appendChild(buildQuiz(lesson));
    col2.appendChild(buildBookRef(lesson));
    if (lesson.guide) col2.appendChild(buildGuideRef(lesson));
    sec.appendChild(col2);
    return sec;
  }

  function buildEnd() {
    var sec = el('section', 'end');
    var inner = el('div', 'end-inner reveal');
    inner.appendChild(el('p', 'kicker', t('endKicker')));
    inner.appendChild(el('h2', 'end-title', t('endTitle')));
    var ol = el('ol', 'steps');
    ['endStep1', 'endStep2', 'endStep3'].forEach(function (k) { ol.appendChild(el('li', null, t(k))); });
    inner.appendChild(ol);
    inner.appendChild(el('p', 'end-body', t('endBody')));
    var top = el('a', 'end-top');
    top.href = '#top';
    top.textContent = t('backTop') + ' ↑';
    inner.appendChild(top);
    sec.appendChild(inner);
    return sec;
  }

  // ---------- rail + progress ----------

  function buildRail() {
    railList.innerHTML = '';
    railLinks = {};
    var done = readDone();
    window.LESSONS.forEach(function (lesson, i) {
      var li = el('li');
      var a = el('a', 'rail-link' + (done.indexOf(lesson.id) !== -1 ? ' is-done' : ''));
      a.href = '#' + lesson.id;
      a.appendChild(el('span', 'rail-num', pad2(i + 1)));
      var label = el('span', 'rail-label');
      label.textContent = lesson[lang].title;
      a.appendChild(label);
      li.appendChild(a);
      railList.appendChild(li);
      railLinks[lesson.id] = a;
    });
    updateRailProgress();
  }

  function updateRailProgress() {
    var done = readDone().filter(function (id) { return !!railLinks[id]; });
    railProgress.innerHTML = '';
    railProgress.appendChild(document.createTextNode(done.length + ' ' + t('progressOf')));
    if (done.length > 0) {
      var reset = el('button');
      reset.type = 'button';
      reset.textContent = t('resetProgress');
      reset.addEventListener('click', function () { resetDone(); buildRail(); setActive(activeId); });
      railProgress.appendChild(reset);
    }
    railProgress.title = t('progressHint');
  }

  function setActive(id) {
    activeId = id;
    Object.keys(railLinks).forEach(function (k) { railLinks[k].classList.remove('is-active'); });
    var idx = -1;
    window.LESSONS.forEach(function (l, i) { if (l.id === id) idx = i; });
    if (idx === -1) { nowLabel.classList.remove('show'); return; }
    railLinks[id].classList.add('is-active');
    nowLabel.textContent = pad2(idx + 1) + ' / ' + pad2(window.LESSONS.length) + ' · ' + window.LESSONS[idx][lang].title;
    nowLabel.classList.add('show');
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    raf(function () {
      var doc = document.documentElement;
      var max = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      var ratio = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || 0) / max)) : 0;
      progressBar.style.transform = 'scaleX(' + ratio + ')';
      ticking = false;
    });
  }

  // ---------- observers ----------

  function disconnectObservers() {
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
  }

  function allWithClass(rootNode, cls, out) {
    out = out || [];
    var kids = rootNode.children || [];
    for (var i = 0; i < kids.length; i++) {
      if ((' ' + (kids[i].className || '') + ' ').indexOf(' ' + cls + ' ') !== -1) out.push(kids[i]);
      allWithClass(kids[i], cls, out);
    }
    return out;
  }

  function setupReveal() {
    var items = allWithClass(page, 'reveal');
    if (!hasIO || reduceMotion) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (n) { io.observe(n); });
    observers.push(io);
  }

  function setupActiveTracking() {
    if (!hasIO) return;
    var io = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    window.LESSONS.forEach(function (l) {
      var node = document.getElementById(l.id);
      if (node) io.observe(node);
    });
    // The hero clears the active lesson when you scroll back to the top.
    var heroIO = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(null); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    var hero = document.getElementById('top');
    if (hero) heroIO.observe(hero);
    observers.push(io, heroIO);
  }

  // ---------- quiz ----------

  function buildQuiz(lesson) {
    var box = el('section', 'quiz reveal');
    box.appendChild(el('h3', 'quiz-title', t('quiz')));
    quizState[lesson.id] = {};
    lesson[lang].quiz.forEach(function (item, qi) { box.appendChild(buildQuestion(lesson, item, qi)); });
    return box;
  }

  function buildQuestion(lesson, item, qi) {
    var wrap = el('div', 'question');
    wrap.appendChild(el('p', 'q', (qi + 1) + '. ' + item.q));
    var opts = el('div', 'options');
    var feedback = el('div', 'feedback');
    feedback.setAttribute('aria-live', 'polite');

    item.options.forEach(function (opt, oi) {
      var b = el('button', 'option', opt);
      b.type = 'button';
      b.addEventListener('click', function () {
        var right = oi === item.answer;
        Array.prototype.forEach.call(opts.children, function (btn, k) {
          btn.disabled = true;
          if (k === item.answer) btn.classList.add('is-right');
        });
        if (!right) b.classList.add('is-wrong');
        feedback.innerHTML = '';
        feedback.appendChild(el('strong', null, right ? t('correct') : t('wrong')));
        feedback.appendChild(document.createTextNode(' ' + item.why));
        if (!right) {
          var again = el('button', 'retry', t('retry'));
          again.type = 'button';
          again.addEventListener('click', function () { wrap.replaceWith(buildQuestion(lesson, item, qi)); });
          feedback.appendChild(again);
        }
        quizState[lesson.id][qi] = right;
        var all = lesson[lang].quiz.every(function (_, k) { return quizState[lesson.id][k] === true; });
        if (all) {
          markDone(lesson.id);
          if (railLinks[lesson.id]) railLinks[lesson.id].classList.add('is-done');
          updateRailProgress();
        }
      });
      opts.appendChild(b);
    });

    wrap.appendChild(opts);
    wrap.appendChild(feedback);
    return wrap;
  }

  // ---------- book reference ----------

  function chapterLabel(ch) {
    var title = window.CHAPTERS[ch];
    var name = ch === 'epilogo' ? t('bookEpilogue') : t('bookChapter') + ' ' + ch;
    return lang === 'en' ? name + ' ("' + title.es + '", ' + title.en + ')' : name + ' ("' + title.es + '")';
  }

  function buildBookRef(lesson) {
    var p = el('p', 'book');
    var labels = lesson.chapters.map(chapterLabel);
    var joined = labels.length > 1
      ? labels.slice(0, -1).join(', ') + ' ' + t('and') + ' ' + labels[labels.length - 1]
      : labels[0];
    p.appendChild(document.createTextNode('→ ' + t('bookShort') + ' ' + joined + ' ' + t('bookOf') + ' '));
    var title;
    if (window.SITE.BOOK_URL) {
      title = el('a');
      title.href = window.SITE.BOOK_URL;
      title.rel = 'noopener';
    } else {
      title = el('em');
    }
    title.textContent = t('bookTitle');
    p.appendChild(title);
    p.appendChild(document.createTextNode('.'));
    return p;
  }

  // Link to the matching section of the practical guide (empezar.html).
  function buildGuideRef(lesson) {
    var p = el('p', 'book guide');
    p.appendChild(document.createTextNode('→ ' + t('guideLead') + ' '));
    var a = el('a');
    a.href = 'empezar.html#' + encodeURIComponent(lesson.guide);
    a.textContent = t('guideName');
    p.appendChild(a);
    p.appendChild(document.createTextNode('.'));
    return p;
  }

  // ---------- instruments ----------

  // Slider for quick play + an editable number for exact (or larger) values.
  // The number accepts up to hardMax; the slider just pins at its own max.
  function control(label, o) {
    var wrap = el('div', 'ctl');
    var top = el('div', 'ctl-top');
    var id = 'ctl' + (++uid);
    var lab = el('label', 'ctl-label');
    lab.textContent = label;
    lab.htmlFor = id;
    var hardMax = o.hardMax || o.max;
    var numIn = document.createElement('input');
    numIn.type = 'number';
    numIn.id = id;
    numIn.className = 'ctl-num';
    numIn.inputMode = 'decimal';
    numIn.min = o.min; numIn.max = hardMax; numIn.step = o.step; numIn.value = o.value;
    top.appendChild(lab);
    top.appendChild(numIn);
    var range = document.createElement('input');
    range.type = 'range';
    range.className = 'ctl-range';
    range.min = o.min; range.max = o.max; range.step = o.step; range.value = Math.min(o.value, o.max);
    range.setAttribute('aria-label', label);
    wrap.appendChild(top);
    wrap.appendChild(range);

    var api = { wrap: wrap, onChange: function () {} };
    api.get = function () { return clampNum(numIn.value, o.min, hardMax); };
    function paint() {
      var p = ((Number(range.value) - o.min) / (o.max - o.min)) * 100;
      range.style.setProperty('--fill', p + '%');
    }
    range.addEventListener('input', function () { numIn.value = range.value; paint(); api.onChange(); });
    numIn.addEventListener('input', function () { range.value = Math.min(api.get(), o.max); paint(); api.onChange(); });
    paint();
    return api;
  }

  function readout(label, main) {
    var box = el('div', 'readout' + (main ? ' main' : ''));
    box.appendChild(el('span', 'ro-label', label));
    var val = el('span', 'ro-val');
    box.appendChild(val);
    return { box: box, val: val };
  }

  function shell(titleKey, descKey) {
    var box = el('div', 'instrument');
    var head = el('div', 'inst-head');
    head.appendChild(el('h3', 'inst-title', t(titleKey)));
    head.appendChild(el('p', 'inst-desc', t(descKey)));
    box.appendChild(head);
    var grid = el('div', 'inst-grid');
    var left = el('div', 'inst-controls');
    var right = el('div', 'readouts');
    grid.appendChild(left);
    grid.appendChild(right);
    box.appendChild(grid);
    return { box: box, left: left, right: right };
  }

  function wire(ctls, fn) { ctls.forEach(function (c) { c.onChange = fn; }); fn(); }

  function buildTool(name) {
    if (name === 'compound') return compoundTool();
    if (name === 'inflation') return inflationTool();
    if (name === 'emergency') return emergencyTool();
    if (name === 'portfolio') return portfolioTool();
    return el('div');
  }

  // Monthly contributions, compounding monthly at the equivalent of the yearly rate.
  function compoundSeries(initial, monthly, years, ratePct) {
    var rm = Math.pow(1 + ratePct / 100, 1 / 12) - 1;
    var bal = initial, contributed = initial, out = [];
    for (var m = 1; m <= years * 12; m++) {
      bal = bal * (1 + rm) + monthly;
      contributed += monthly;
      if (m % 12 === 0) out.push({ bal: bal, contributed: contributed });
    }
    return out;
  }

  function compoundTool() {
    var s = shell('cCompoundTitle', 'cCompoundDesc');
    var cInit = control(t('cInitial'), { min: 0, max: 50000, step: 500, value: 0, hardMax: 1e9 });
    var cMon = control(t('cMonthly'), { min: 0, max: 2000, step: 10, value: 100, hardMax: 1e8 });
    var cYrs = control(t('cYears'), { min: 1, max: 50, step: 1, value: 30, hardMax: 60 });
    var cRate = control(t('cRate'), { min: 0, max: 15, step: 0.5, value: 7, hardMax: 30 });
    [cInit, cMon, cYrs, cRate].forEach(function (c) { s.left.appendChild(c.wrap); });
    var rFinal = readout(t('cFinal'), true);
    var rCont = readout(t('cContributed'));
    var rGain = readout(t('cGains'));
    [rFinal, rCont, rGain].forEach(function (r) { s.right.appendChild(r.box); });
    var chart = el('div', 'chart');
    s.box.appendChild(chart);
    s.box.appendChild(el('div', 'legend',
      '<span><i class="sw sw-c"></i>' + t('cChartLegendC') + '</span>' +
      '<span><i class="sw sw-g"></i>' + t('cChartLegendG') + '</span>'));

    wire([cInit, cMon, cYrs, cRate], function () {
      var pts = compoundSeries(cInit.get(), cMon.get(), Math.round(cYrs.get()), cRate.get());
      var last = pts[pts.length - 1];
      rFinal.val.textContent = money(last.bal);
      rCont.val.textContent = money(last.contributed);
      rGain.val.textContent = money(Math.max(0, last.bal - last.contributed));
      drawBars(chart, pts);
    });
    return s.box;
  }

  function drawBars(container, pts) {
    var W = 900, H = 200;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-hidden': 'true' });
    var max = 0;
    pts.forEach(function (p) { if (p.bal > max) max = p.bal; });
    if (max <= 0) max = 1;
    var bw = W / pts.length;
    pts.forEach(function (p, i) {
      var x = i * bw + bw * 0.14, w = bw * 0.72;
      var hc = (Math.min(p.contributed, p.bal) / max) * (H - 4);
      var hg = (Math.max(0, p.bal - p.contributed) / max) * (H - 4);
      s.appendChild(svg('rect', { x: x, y: H - hc, width: w, height: hc, rx: 2, class: 'bar-c' }));
      s.appendChild(svg('rect', { x: x, y: H - hc - hg, width: w, height: hg, rx: 2, class: 'bar-g' }));
    });
    container.innerHTML = '';
    container.appendChild(s);
  }

  function inflationTool() {
    var s = shell('cInflationTitle', 'cInflationDesc');
    var cAmt = control(t('cAmount'), { min: 0, max: 1000000, step: 1000, value: 100000, hardMax: 1e10 });
    var cInf = control(t('cInflation'), { min: 0, max: 100, step: 1, value: 10, hardMax: 1000 });
    var cYrs = control(t('cYears'), { min: 1, max: 30, step: 1, value: 5, hardMax: 50 });
    [cAmt, cInf, cYrs].forEach(function (c) { s.left.appendChild(c.wrap); });
    var rLike = readout(t('cBuysLike'), true);
    var rCost = readout(t('cWillCost'));
    var rLost = readout(t('cLost'));
    [rLike, rCost, rLost].forEach(function (r) { s.right.appendChild(r.box); });

    wire([cAmt, cInf, cYrs], function () {
      var amt = cAmt.get();
      var factor = Math.pow(1 + cInf.get() / 100, Math.round(cYrs.get()));
      rLike.val.textContent = money(amt / factor);
      rLike.box.firstChild.textContent = t('cBuysLike') + ' (' + t('cBuysLikeTail') + ')';
      rCost.val.textContent = money(amt * factor);
      rLost.val.textContent = pct((1 - 1 / factor) * 100);
    });
    return s.box;
  }

  function emergencyTool() {
    var s = shell('cEmergencyTitle', 'cEmergencyDesc');
    var cExp = control(t('cExpenses'), { min: 0, max: 5000, step: 50, value: 500, hardMax: 1e8 });
    var cMon = control(t('cMonthsCover'), { min: 1, max: 12, step: 1, value: 6, hardMax: 12 });
    var cHave = control(t('cAlready'), { min: 0, max: 50000, step: 100, value: 0, hardMax: 1e9 });
    var cSave = control(t('cSaving'), { min: 0, max: 2000, step: 10, value: 100, hardMax: 1e8 });
    [cExp, cMon, cHave, cSave].forEach(function (c) { s.left.appendChild(c.wrap); });
    var rTarget = readout(t('cTarget'), true);
    var rMissing = readout(t('cMissing'));
    var rTime = readout(t('cTimeToGoal'));
    [rTarget, rMissing, rTime].forEach(function (r) { s.right.appendChild(r.box); });
    var meter = el('div', 'meter');
    var meterFill = el('div', 'meter-fill');
    meter.appendChild(meterFill);
    var meterCap = el('p', 'meter-cap');
    s.right.appendChild(meter);
    s.right.appendChild(meterCap);

    wire([cExp, cMon, cHave, cSave], function () {
      var target = cExp.get() * Math.round(cMon.get());
      var have = cHave.get();
      var missing = Math.max(0, target - have);
      var save = cSave.get();
      rTarget.val.textContent = money(target);
      rMissing.val.textContent = money(missing);
      if (missing === 0) rTime.val.textContent = t('cGoalReached');
      else if (save <= 0) rTime.val.textContent = t('cNeverReach');
      else rTime.val.textContent = Math.ceil(missing / save) + ' ' + t('cMonthsUnit');
      var ratio = target > 0 ? Math.min(1, have / target) : 1;
      meterFill.style.width = Math.round(ratio * 100) + '%';
      meterCap.textContent = Math.round(ratio * 100) + '% ' + t('cFilled');
    });
    return s.box;
  }

  // Educational, inflation-adjusted long-run assumptions (US history), and
  // calendar 2008 as the "very bad year". Printed on screen verbatim.
  var ASSUME = { avg: { stocks: 7, bonds: 2, cash: 0 }, bad: { stocks: -37, bonds: 5, cash: 0 } };

  function pctSlider(label, value) {
    var wrap = el('div', 'ctl');
    var top = el('div', 'ctl-top');
    top.appendChild(el('span', 'ctl-label', label));
    var val = el('strong', 'ctl-num');
    top.appendChild(val);
    var range = document.createElement('input');
    range.type = 'range';
    range.className = 'ctl-range';
    range.min = 0; range.max = 100; range.step = 5; range.value = value;
    range.setAttribute('aria-label', label);
    wrap.appendChild(top);
    wrap.appendChild(range);
    return { wrap: wrap, range: range, val: val };
  }

  function portfolioTool() {
    var s = shell('cPortfolioTitle', 'cPortfolioDesc');
    var split = el('div', 'pf-split');
    var sliders = el('div');
    var sS = pctSlider(t('cStocks'), 60);
    var sB = pctSlider(t('cBonds'), 30);
    sliders.appendChild(sS.wrap);
    sliders.appendChild(sB.wrap);
    var cashLine = el('p', 'pf-cash');
    sliders.appendChild(cashLine);
    split.appendChild(sliders);
    var donut = el('div', 'donut');
    var hole = el('div', 'donut-hole');
    donut.appendChild(hole);
    split.appendChild(donut);
    s.left.appendChild(split);
    s.left.appendChild(el('div', 'legend',
      '<span><i class="sw sw-s"></i>' + t('cStocks') + '</span>' +
      '<span><i class="sw sw-b"></i>' + t('cBonds') + '</span>' +
      '<span><i class="sw sw-k"></i>' + t('cCash') + '</span>'));
    var cAmt = control(t('cInvest'), { min: 0, max: 200000, step: 1000, value: 10000, hardMax: 1e10 });
    var cYrs = control(t('cYears'), { min: 1, max: 50, step: 1, value: 20, hardMax: 60 });
    s.left.appendChild(cAmt.wrap);
    s.left.appendChild(cYrs.wrap);

    var rAvg = readout(t('cAvgReturn'));
    var rAfter = readout(t('cAfterYears'), true);
    var rBad = readout(t('cBadYear'));
    [rAvg, rAfter, rBad].forEach(function (r) { s.right.appendChild(r.box); });
    s.box.appendChild(el('p', 'inst-warn', t('cCanYou')));
    s.box.appendChild(el('p', 'inst-fine', t('cAssumptions') + ' ' + t('cCashAuto')));

    function weights() {
      var st = parseInt(sS.range.value, 10) || 0;
      var bo = parseInt(sB.range.value, 10) || 0;
      return { stocks: st, bonds: bo, cash: Math.max(0, 100 - st - bo) };
    }
    function update() {
      var w = weights();
      sS.val.textContent = w.stocks + '%';
      sB.val.textContent = w.bonds + '%';
      sS.range.style.setProperty('--fill', w.stocks + '%');
      sB.range.style.setProperty('--fill', w.bonds + '%');
      cashLine.textContent = t('cCash') + ': ' + w.cash + '%';
      var a = w.stocks, b = a + w.bonds;
      donut.style.background = 'conic-gradient(var(--c-stocks) 0 ' + a + '%, var(--c-bonds) ' + a + '% ' + b + '%, var(--c-cash) ' + b + '% 100%)';
      hole.textContent = w.stocks + '/' + w.bonds + '/' + w.cash;
      var avg = (w.stocks * ASSUME.avg.stocks + w.bonds * ASSUME.avg.bonds + w.cash * ASSUME.avg.cash) / 100;
      var bad = (w.stocks * ASSUME.bad.stocks + w.bonds * ASSUME.bad.bonds + w.cash * ASSUME.bad.cash) / 100;
      var amt = cAmt.get();
      rAvg.val.textContent = pct(avg);
      rAfter.val.textContent = money(amt * Math.pow(1 + avg / 100, Math.round(cYrs.get())));
      rBad.val.textContent = money(amt * (1 + bad / 100)) + ' (' + (bad >= 0 ? '+' : '') + pct(bad) + ')';
    }
    // Stocks + bonds can never exceed 100: moving one pushes the other down.
    sS.range.addEventListener('input', function () {
      var st = parseInt(sS.range.value, 10) || 0;
      if (st + (parseInt(sB.range.value, 10) || 0) > 100) sB.range.value = 100 - st;
      update();
    });
    sB.range.addEventListener('input', function () {
      var bo = parseInt(sB.range.value, 10) || 0;
      if (bo + (parseInt(sS.range.value, 10) || 0) > 100) sS.range.value = 100 - bo;
      update();
    });
    wire([cAmt, cYrs], update);
    return s.box;
  }

  // ---------- boot ----------

  document.getElementById('lang-toggle').addEventListener('click', function () {
    var keep = activeId;
    lang = lang === 'es' ? 'en' : 'es';
    saveLang();
    render();
    // Stay on the lesson you were reading instead of jumping to the top.
    if (keep) {
      var node = document.getElementById(keep);
      if (node && node.scrollIntoView) node.scrollIntoView({ block: 'start' });
      setActive(keep);
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  render();
  // Arriving from another page at index.html#<lesson>: the lessons are built by
  // script, so jump to the target once it exists.
  if (location.hash.length > 1) {
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.scrollIntoView) target.scrollIntoView({ block: 'start' });
  }
})();
