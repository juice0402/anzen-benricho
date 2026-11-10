// 職場を測る記録帳（#77）：入れたそばに決まりとくらべ、押すと端末の中だけに残す（localStorage anzen-sokutei-v1。送らない）
// 部品は sokutei.mjs（ページではこのスクリプトの前に入る）
(function () {
  var tb = document.querySelector('.ktool[data-tool="sokutei"]');
  if (!tb) return;
  var td = JSON.parse(tb.querySelector('.kt-d').textContent);
  var ko = tb.querySelector('.kt-out');
  var save = tb.querySelector('.sk-save');
  var msg = tb.querySelector('.sk-msg');
  var body = tb.querySelector('.sk-body');
  var none = tb.querySelector('.sk-none');
  var fyEl = tb.querySelector('.sk-fy');
  var dEl = document.getElementById('sk-d');
  var pEl = document.getElementById('sk-p');
  var store = sokLoad();
  if (!dEl.value) dEl.value = sokToday();
  var vals = function () {
    var v = {};
    SOK_FIELDS.forEach(function (k) { v[k] = document.getElementById('sk-' + k).value; });
    return v;
  };
  var gyo = function () {
    var b = document.querySelector('.kp [data-g][aria-pressed="true"]');
    if (b) return b.getAttribute('data-g');
    try { return localStorage.getItem('gyoshu'); } catch (e) { return null; }
  };
  var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fyNow = function () { return sokFyOf(/^\d{4}-\d{2}-\d{2}$/.test(dEl.value) ? dEl.value : sokToday()); };
  var cell = function (n) { return n === undefined || n === null ? '' : String(n); };
  var judge = function () {
    var g = gyo();
    var v = vals();
    var list = sokJudge(v, g, td.std);
    var h = '';
    var meyasu = false;
    list.forEach(function (r) {
      if (r.meyasu) meyasu = true;
      h += '<p class="' + (r.ok ? 'sk-ok' : 'sk-ng') + '"><b>' + esc(r.k) + '　' + (r.k === '暑さ' ? (r.hot ? '対象' : '対象の外') : r.ok ? '内' : '外') + (r.meyasu ? '（目安）' : '') + '</b><span>' + esc(r.text) + '・' + esc(r.law) + '</span></p>';
    });
    if (h && meyasu) h += '<p class="kt-law">' + esc(td.meyasu) + '</p>';
    if (h && !g) h += '<p class="kt-law">' + esc(td.noG) + '</p>';
    ko.innerHTML = h;
    ko.hidden = !h;
    save.hidden = !SOK_FIELDS.some(function (k) { return sokNum(v[k]) !== null; });
  };
  var draw = function () {
    var fy = fyNow();
    var rows = sokRows(store, fy);
    fyEl.textContent = '（' + fy + '年度）';
    body.textContent = '';
    rows.forEach(function (x) {
      var tr = document.createElement('tr');
      [x.r.m + '月', x.r.p || '―'].concat(SOK_FIELDS.map(function (k) { return cell(x.r.v[k]); })).forEach(function (t) {
        var c = document.createElement('td');
        c.textContent = t;
        tr.appendChild(c);
      });
      var c = document.createElement('td');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ks-cal-b sk-del';
      b.textContent = '消す';
      b.setAttribute('data-k', x.key);
      b.setAttribute('aria-label', x.r.m + '月 ' + (x.r.p || '') + ' の記録を消す');
      c.appendChild(b);
      tr.appendChild(c);
      body.appendChild(tr);
    });
    none.hidden = rows.length > 0;
    body.parentNode.parentNode.hidden = !rows.length;
    // A4 の測定記録表：年度と記録を入れ、あとの行は手書き用に空ける
    var f = document.querySelector('.psheet .pg-f dd');
    if (f) f.textContent = fy + '年度';
    // 行は増やさない（A4 1枚のまま）。入りきらない分は紙の下に1行
    var pb = document.querySelector('.pg-s tbody');
    if (pb) {
      var trs = pb.querySelectorAll('tr');
      var more = document.querySelector('.sk-more');
      if (more) {
        more.textContent = rows.length > trs.length ? 'ほかの' + (rows.length - trs.length) + '件は画面の今年度の記録で見る' : '';
        more.hidden = rows.length <= trs.length;
      }
      Array.prototype.forEach.call(trs, function (tr, i) {
        var x = rows[i];
        var t = x ? [x.r.m + '月', Number(x.r.d.slice(5, 7)) + '/' + Number(x.r.d.slice(8, 10)), x.r.p].concat(SOK_FIELDS.map(function (k) { return cell(x.r.v[k]); })).concat(['']) : [];
        Array.prototype.forEach.call(tr.children, function (c, j) { c.textContent = t[j] || ''; });
      });
    }
  };
  tb.addEventListener('input', function (e) {
    msg.textContent = '';
    judge();
    if (e.target === dEl) draw();
  });
  save.addEventListener('click', function () {
    var next = sokPut(store, dEl.value, pEl.value, vals());
    if (next === store) { msg.textContent = /^\d{4}-\d{2}-\d{2}$/.test(dEl.value) ? '数字を1つ以上入れてください' : '測った日を入れてください'; return; }
    store = next;
    sokSave(store);
    var m = Number(dEl.value.slice(5, 7));
    msg.textContent = m + '月・' + (pEl.value.trim() || '場所なし') + 'の記録にしました';
    draw();
  });
  body.addEventListener('click', function (e) {
    var b = e.target.closest('.sk-del');
    if (!b) return;
    store = sokDel(store, b.getAttribute('data-k'));
    sokSave(store);
    draw();
  });
  var box = document.querySelector('.kp');
  if (box) box.addEventListener('click', function () { setTimeout(judge, 0); });
  judge();
  draw();
})();
