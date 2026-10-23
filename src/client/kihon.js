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
  // 計算の道具
  var tb = document.querySelector('.ktool');
  if (tb) {
    var td = JSON.parse(tb.querySelector('.kt-d').textContent);
    var ko = tb.querySelector('.kt-out');
    var val = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };
    var line = function (a, b) { return '<p><b>' + a + '</b>' + (b ? '<span>' + b + '</span>' : '') + '</p>'; };
    var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var calc = {
      toilet: function () {
        var m = +val('kt-m') || 0, f = +val('kt-f') || 0, k = +val('kt-k') || 0;
        if (!m && !f) return '';
        var law = td.law[sel.g === 'jimusho' ? 'jimusho' : 'other'];
        var h = '';
        if (m + f <= td.small.max) h += line(esc(td.small.text), law.small) + '<p class="kt-law">男女別にするときの数</p>';
        td.rows.forEach(function (r) {
          var n = r.who === 'm' ? m : f;
          if (!n) return;
          var c = Math.max(td.kojitsu.min, Math.ceil((n - k * td.kojitsu.minus) / r.per));
          h += line(esc(r.label) + '　' + c + 'つ以上', '1つを' + r.per + '人以内ごとに' + (k ? '（独立個室型' + k + 'つぶん、' + (k * td.kojitsu.minus) + '人を引いて数える）' : ''));
        });
        return h + '<p class="kt-law">' + esc(law.base) + (k ? '・' + esc(law.kojitsu) : '') + '</p>';
      },
      shishobyo: function () {
        var a = val('kt-a'), b = val('kt-b'), dead = document.getElementById('kt-x').checked;
        if (!a || (!b && !dead)) return '';
        var r;
        if (dead) r = td.rules[0];
        else {
          var days = Math.round((Date.parse(b) - Date.parse(a)) / 864e5) - 1;
          if (days < 0) return line('もどった日が、けがの日より前になっています', '');
          r = td.rules.filter(function (x) { var w = x.when; return w !== 'death' && (w.minDays === undefined || days >= w.minDays) && (w.maxDays === undefined || days <= w.maxDays); })[0];
          var head = '休んだ日数　' + days + '日';
        }
        if (!r.form) return line(head, '') + line(esc(r.text), '');
        var due = r.due;
        if (r.quarters) { var mo = +a.slice(5, 7), y = +a.slice(0, 4); var q = r.quarters.filter(function (x) { return mo >= x.from && mo <= x.to; })[0]; due = (q.due.indexOf('翌年') === 0 ? (y + 1) + '年' + q.due.slice(2) : y + '年' + q.due) + 'まで（' + q.from + '〜' + q.to + '月分をまとめて）'; }
        return (head ? line(head, '') : '') + line(esc(r.form), '期限：' + esc(due));
      },
      part: function () {
        var c = tb.querySelector('input[name="kt-t"]:checked'), h = +val('kt-hr'), n = +val('kt-nr');
        if (!c || !h || !n) return '';
        var t = td.term[+c.value], sp = document.getElementById('kt-s').checked;
        var ok = t.ok || (sp && t.tokutei), r = h / n;
        var key = ok && r >= td.must ? 'must' : ok && r >= td.want ? 'want' : 'none';
        return line(esc(td.text[key]), '週の時間は通常の労働者の' + Math.round(r * 100) + '%');
      },
    }[tb.getAttribute('data-tool')];
    var run = function () { var h = calc(); ko.innerHTML = h; ko.hidden = !h; };
    tb.addEventListener('input', run);
    tb.addEventListener('change', run);
    if (box) box.addEventListener('click', function () { setTimeout(run, 0); });
  }
})();
