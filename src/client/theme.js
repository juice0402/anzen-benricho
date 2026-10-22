(function () {
  var KEY = 'gyoshu';
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.fuda-b[role="tab"]'));
  var keys = tabs.map(function (b) { return b.getAttribute('data-k'); });

  function show(k, save, focus) {
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-k') === k;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
      document.getElementById('p-' + b.getAttribute('data-k')).hidden = !on;
    });
    if (save) { try { localStorage.setItem(KEY, k); } catch (e) {} }
  }

  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { show(b.getAttribute('data-k'), true, false); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      show(keys[(i + d + keys.length) % keys.length], true, true);
    });
  });

  function fromHash() {
    var h = (location.hash || '').slice(1);
    if (keys.indexOf(h) >= 0) { show(h, true, false); return true; }
    return false;
  }
  if (!fromHash()) {
    var s = null;
    try { s = localStorage.getItem(KEY); } catch (e) {}
    if (keys.indexOf(s) >= 0) show(s, false, false);
  }
  window.addEventListener('hashchange', fromHash);

  Array.prototype.forEach.call(document.querySelectorAll('.print-btn'), function (b) {
    b.addEventListener('click', function () { window.print(); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('.copy-btn'), function (b) {
    var label = b.textContent;
    b.addEventListener('click', function () {
      var talk = b.parentNode.querySelector('.talk');
      var text = Array.prototype.map.call(talk.querySelectorAll('p'), function (p) { return p.textContent; }).join('\n');
      function done() { b.textContent = 'コピーしました'; setTimeout(function () { b.textContent = label; }, 1800); }
      function pick() {
        var r = document.createRange();
        r.selectNodeContents(talk);
        var sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        b.textContent = '選んだ文章をコピーしてください';
      }
      try { navigator.clipboard.writeText(text).then(done, pick); } catch (e) { pick(); }
    });
  });
})();
