/* theme.js: day/night switch. Loaded in <head> before the stylesheets (no defer)
   so <html data-theme> is set before first paint: no flash. The choice is saved
   in localStorage; with nothing saved it follows the OS preference. */
(function () {
  'use strict';
  var KEY = 'idc.theme', root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var WORDS = { es: ['Modo noche', 'Modo día'], en: ['Night mode', 'Day mode'], pt: ['Modo noturno', 'Modo diurno'] };
  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'day' || v === 'night' ? v : null; } catch (e) { return null; }
  }
  function meta(name, value) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); }
    m.content = value;
  }
  function paint() {
    var night = root.getAttribute('data-theme') === 'night';
    var w = WORDS[(root.lang || 'es').slice(0, 2)] || WORDS.es;
    var bs = document.querySelectorAll('.theme-btn');
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute('aria-pressed', night ? 'true' : 'false');
      bs[i].setAttribute('aria-label', w[0]);
      bs[i].title = night ? w[1] : w[0];
    }
  }
  function apply(mode) {
    root.setAttribute('data-theme', mode);
    meta('color-scheme', mode === 'night' ? 'dark' : 'light');
    meta('theme-color', mode === 'night' ? '#0b0a0f' : '#7b2cbf');
    paint();
  }
  apply(saved() || (mq && mq.matches ? 'night' : 'day'));
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) { if (!saved()) apply(e.matches ? 'night' : 'day'); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.theme-btn') : null;
    if (!b) return;
    var next = root.getAttribute('data-theme') === 'night' ? 'day' : 'night';
    try { localStorage.setItem(KEY, next); } catch (err) { /* file:// or private mode: session only */ }
    apply(next);
  });
  document.addEventListener('DOMContentLoaded', paint);
  window.IDCTheme = { paint: paint };
})();
