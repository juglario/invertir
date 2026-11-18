// contenidos.html: three small enhancements, none required to read the page.
// 1) live search over the index, 2) the nav chip of the section in view, 3) a share button.
// No dependencies, no network, nothing stored.
(function () {
  'use strict';

  var form = document.querySelector('.ix-search');
  var input = document.getElementById('ix-q');
  var none = document.getElementById('ix-none');
  var items = [].slice.call(document.querySelectorAll('.ix-item'));
  var sections = [].slice.call(document.querySelectorAll('.ix-sec'));

  function norm(s) {
    s = String(s).toLowerCase();
    return s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
  }

  // ---------------- search ----------------
  if (form && input) {
    form.hidden = false;
    var keys = items.map(function (li) { return norm(li.getAttribute('data-q') || ''); });
    var run = function () {
      var words = norm(input.value).split(/\s+/).filter(Boolean);
      var shown = 0;
      items.forEach(function (li, i) {
        var ok = words.every(function (w) { return keys[i].indexOf(w) !== -1; });
        li.hidden = !ok;
        if (ok) shown++;
      });
      sections.forEach(function (sec) {
        var any = sec.querySelector('.ix-item:not([hidden])');
        sec.hidden = !any;
        [].forEach.call(sec.querySelectorAll('.ix-part'), function (h) {
          var next = h.nextElementSibling, has = false;
          while (next && !next.classList.contains('ix-part')) {
            if (next.querySelector && next.querySelector('.ix-item:not([hidden])')) has = true;
            next = next.nextElementSibling;
          }
          h.hidden = !has;
        });
      });
      var paths = document.getElementById('rutas');
      if (paths) paths.hidden = words.length > 0;
      if (none) {
        none.hidden = shown > 0 || !words.length;
        none.textContent = none.hidden ? '' : input.getAttribute('data-none');
      }
    };
    input.addEventListener('input', run);
  }

  // ---------------- active chip ----------------
  var chips = [].slice.call(document.querySelectorAll('.ix-nav a'));
  if (chips.length && 'IntersectionObserver' in window) {
    var byId = {};
    chips.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (a) { a.classList.remove('on'); });
        var a = byId[e.target.id];
        if (a) a.classList.add('on');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // ---------------- share ----------------
  var btn = document.querySelector('.ix-share');
  if (btn) {
    var canShare = !!navigator.share;
    var canCopy = !!(navigator.clipboard && navigator.clipboard.writeText);
    if (canShare || canCopy) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var url = location.href.split('#')[0];
        if (canShare) {
          navigator.share({ title: btn.getAttribute('data-title'), text: btn.getAttribute('data-text'), url: url }).catch(function () {});
        } else {
          navigator.clipboard.writeText(url).then(function () {
            var old = btn.textContent;
            btn.textContent = btn.getAttribute('data-copied');
            setTimeout(function () { btn.textContent = old; }, 2000);
          }).catch(function () {});
        }
      });
    }
  }
})();
