// 今年度の記録：業種のページの「今月の実施」・トップのスタンプ帳・1年の実施記録の表（rec.mjs を前に入れて使う。送らない）
(function () {
  var NAMES = ['掲示', '朝礼', 'やること'];
  var md = function (iso) { return Number(iso.slice(5, 7)) + '月' + Number(iso.slice(8, 10)) + '日'; };
  var today = recToday();

  // 業種のページ：押すとその日の日付、もう一度押すと外す
  var box = document.querySelector('.rec');
  if (box) {
    var m = Number(box.getAttribute('data-m'));
    var r = { fy: recFy(m, today), m: m, t: box.getAttribute('data-t'), g: box.getAttribute('data-g') };
    var cbs = box.querySelectorAll('input');
    var show = function () {
      var it = recLoad()[recKey(r)];
      cbs.forEach(function (c, i) {
        var d = it ? it.d[i] : '';
        c.checked = !!d;
        c.parentNode.querySelector('small').textContent = d ? md(d) : '';
      });
    };
    cbs.forEach(function (c, i) {
      c.addEventListener('change', function () {
        recSave(recToggle(recLoad(), r, i, today));
        show();
      });
    });
    show();
  }

  // トップ：スタンプ帳
  var stp = document.querySelector('.stp');
  if (stp) {
    var store = recLoad();
    var fy = recFyOf(today);
    var cm = Number(today.slice(5, 7));
    var any = false;
    stp.querySelectorAll('[data-m]').forEach(function (c) {
      var mm = Number(c.getAttribute('data-m'));
      var dots = recDots(store, fy, mm);
      c.querySelectorAll('.dots i').forEach(function (i, k) { i.className = dots[k] ? 'on' : ''; });
      if (dots[0] && dots[1] && dots[2]) c.classList.add('full');
      if (mm === cm) c.classList.add('now');
      if (dots.some(Boolean)) any = true;
      c.setAttribute('aria-label', mm + '月 ' + NAMES.map(function (n, k) { return n + (dots[k] ? ' 済み' : ' まだ'); }).join('、'));
    });
    var run = document.querySelector('.kr-run');
    var n = any ? recStreak(store, today) : 0;
    if (run && n) {
      run.querySelector('b').textContent = String(n);
      run.hidden = false;
    }
    var fyEl = document.querySelector('.kr-fy');
    if (fyEl) fyEl.textContent = fy + '年度';
  }

  // 1年の実施記録の表：記録のある所に日付、押したテーマ
  var tbl = document.querySelector('.kr-t');
  if (tbl) {
    var st = recLoad();
    var f = recFyOf(today);
    var names0 = {};
    try { names0 = JSON.parse(tbl.getAttribute('data-names') || '{}'); } catch (e) {}
    var fyT = document.querySelector('.kr-fyt');
    if (fyT) fyT.textContent = String(f);
    tbl.querySelectorAll('tr[data-m]').forEach(function (tr) {
      var row = recRow(st, f, Number(tr.getAttribute('data-m')));
      var tds = tr.querySelectorAll('td');
      row.dates.forEach(function (d, k) { tds[k + 1].textContent = d ? Number(d.slice(5, 7)) + '/' + Number(d.slice(8, 10)) : ''; });
      if (row.themes.length) {
        var names = row.themes.map(function (s) { return names0[s] || ''; }).filter(Boolean);
        if (names.length) tr.querySelector('.kr-th').textContent = names.join('・');
      }
    });
  }
})();
