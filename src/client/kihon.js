(function () {
  var sel = { g: null, n: null };
  try { sel.g = localStorage.getItem('gyoshu'); sel.n = localStorage.getItem('ninzu'); } catch (e) {}
  var box = document.querySelector('.kp');
  var out = document.querySelector('.kres');
  var rulesEl = document.querySelector('.kres-d');
  var rules = rulesEl ? JSON.parse(rulesEl.textContent) : [];
  var need = box ? (box.getAttribute('data-need') || '').split(' ').filter(Boolean) : [];
  function has(list, v) { return !list || (v && list.indexOf(v) > -1); }
  function fits(w) { return !w || (has(w.g, sel.g) && has(w.n, sel.n)); }
  function show(el) {
    var g = el.getAttribute('data-g'), n = el.getAttribute('data-n');
    return (!g || !sel.g || g.split(' ').indexOf(sel.g) > -1) && (!n || !sel.n || n.split(' ').indexOf(sel.n) > -1);
  }
  function apply() {
    Array.prototype.forEach.call(document.querySelectorAll('.kp [data-g], .kp [data-n]'), function (b) {
      var d = b.hasAttribute('data-g') ? 'g' : 'n';
      b.setAttribute('aria-pressed', b.getAttribute('data-' + d) === sel[d] ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('main [data-g]:not(button), main [data-n]:not(button)'), function (el) { el.hidden = !show(el); });
    if (!out) return;
    var ready = need.every(function (d) { return sel[d]; });
    var hit = null;
    if (ready) for (var i = 0; i < rules.length; i++) if (fits(rules[i].when)) { hit = rules[i]; break; }
    out.textContent = hit ? hit.text : out.getAttribute('data-empty');
    out.classList.toggle('on', !!hit);
  }
  if (box) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var d = b.hasAttribute('data-g') ? 'g' : 'n';
      sel[d] = b.getAttribute('data-' + d);
      try { localStorage.setItem(d === 'g' ? 'gyoshu' : 'ninzu', sel[d]); } catch (e2) {}
      apply();
    });
  }
  apply();

  // 掲示：役目と名前（名前は端末の中だけ。送らない）
  var kd = document.querySelector('.kk-d');
  if (kd) {
    var roles = JSON.parse(kd.textContent);
    var role = document.getElementById('kk-role'), name = document.getElementById('kk-name');
    var put = function (k, v) { var el = document.querySelector('[data-kk="' + k + '"]'); if (el) el.textContent = v; };
    var draw = function () {
      var r = roles[+role.value] || roles[0];
      put('role', r.name);
      put('name', name.value.trim() || '　');
      var ol = document.querySelector('[data-kk="duties"]');
      ol.textContent = '';
      r.duties.forEach(function (d) { var li = document.createElement('li'); li.textContent = d; ol.appendChild(li); });
    };
    role.addEventListener('change', draw);
    name.addEventListener('input', draw);
  }

  var pb = document.querySelector('.print-btn');
  if (pb) pb.addEventListener('click', function () { window.print(); });
  if (window.kihonTool) window.kihonTool();
})();
