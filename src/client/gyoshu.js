(function () {
  var cur = document.querySelector('.fuda-b[aria-current="page"]');
  if (cur) { try { localStorage.setItem('gyoshu', cur.getAttribute('data-k')); } catch (e) {} }

  var pb = document.querySelector('.print-btn');
  if (pb) pb.addEventListener('click', function () { window.print(); });

  var cb = document.querySelector('.copy-btn');
  if (cb) {
    var label = cb.textContent;
    cb.addEventListener('click', function () {
      var talk = document.querySelector('.talk');
      var text = Array.prototype.map.call(talk.querySelectorAll('p'), function (p) { return p.textContent; }).join('\n');
      function done() { cb.textContent = 'コピーしました'; setTimeout(function () { cb.textContent = label; }, 1800); }
      function pick() {
        var r = document.createRange();
        r.selectNodeContents(talk);
        var sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        cb.textContent = '選んだ文章をコピーしてください';
      }
      try { navigator.clipboard.writeText(text).then(done, pick); } catch (e) { pick(); }
    });
  }
})();
