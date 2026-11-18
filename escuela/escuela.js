// escuela.js: marks the table-of-contents link of the section being read.
// Without JS (or IntersectionObserver) the contents list is still a plain list of anchors.
(function () {
  'use strict';
  var toc = document.querySelector('.esc-toc');
  if (!toc || !('IntersectionObserver' in window)) return;
  var links = {}, order = [];
  [].forEach.call(toc.querySelectorAll('a[href^="#"]'), function (a) {
    var id = a.getAttribute('href').slice(1), sec = document.getElementById(id);
    if (sec) { links[id] = a; order.push(sec); }
  });
  if (!order.length) return;
  var visible = {};
  function mark() {
    var cur = null;
    for (var i = 0; i < order.length; i++) { if (visible[order[i].id]) { cur = order[i].id; break; } }
    if (!cur) return;
    Object.keys(links).forEach(function (id) {
      if (id === cur) links[id].setAttribute('aria-current', 'location');
      else links[id].removeAttribute('aria-current');
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
    mark();
  }, { rootMargin: '-20% 0px -55% 0px' });
  order.forEach(function (s) { io.observe(s); });
})();
