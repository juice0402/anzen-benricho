// 資格の期限の台帳（#102）：出した期限を「台帳に残す」で端末の中だけに残し、期限の近い順の表に出す（localStorage anzen-shikaku-v1。送らない）
// 部品は daicho.mjs（ページではこのスクリプトの前に入る）。入れた文字は textContent で出す（HTML にしない）
// 資格ごとのページ（#104）は「台帳に残す」だけで表と紙はない。入口は1件以上あるときだけ A4 の紙と「A4で印刷」を出す
(function () {
  var save = document.getElementById('k-save');
  var who = document.getElementById('k-who');
  var msg = document.getElementById('k-msg');
  var day = document.getElementById('k-day');
  var body = document.querySelector('.db-body');
  var none = document.querySelector('.db-none');
  if (!save || !who || !day) return;
  var wrap = body && body.parentNode.parentNode;
  var sheet = document.querySelector('.db-sheet');
  var pbtn = document.querySelector('.db-print');
  var list = daiLoad();
  var md = function (iso) { var d = daiDate(iso); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); };
  var today = function () { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  // A4 の紙：行は増やさない（A4 1枚のまま）。期限の近い順に入るだけ入れ、入りきらない分は紙の下に1行
  var paper = function (rows) {
    if (!sheet) return;
    var n = new Date();
    sheet.querySelector('.db-pd').textContent = n.getFullYear() + '/' + (n.getMonth() + 1) + '/' + n.getDate();
    var trs = sheet.querySelectorAll('tbody tr');
    Array.prototype.forEach.call(trs, function (tr, i) {
      var x = rows[i];
      var t = x ? [x.who, x.r.s, md(x.r.d), md(x.r.lim), daiLeft(x.left), ''] : [];
      Array.prototype.forEach.call(tr.children, function (c, j) { c.textContent = t[j] || ''; });
    });
    var more = sheet.querySelector('.db-more');
    more.textContent = rows.length > trs.length ? 'ほかの' + (rows.length - trs.length) + '件は画面の台帳で見る' : '';
    more.hidden = rows.length <= trs.length;
    sheet.hidden = !rows.length;
    if (pbtn) pbtn.hidden = !rows.length;
  };
  var draw = function () {
    if (!body) return;
    var rows = daiRows(list, today());
    body.textContent = '';
    rows.forEach(function (x) {
      var tr = document.createElement('tr');
      if (x.left < 0) tr.className = 'db-over';
      // 期限の欄の下に小さく修了日（スマホの幅で表が横にはみ出さないように）
      [x.who, x.r.s, md(x.r.lim), daiLeft(x.left)].forEach(function (t, i) {
        var c = document.createElement('td');
        c.textContent = t;
        if (i === 2) {
          var s = document.createElement('span');
          s.className = 'db-d';
          s.textContent = '修了 ' + md(x.r.d);
          c.appendChild(s);
        }
        tr.appendChild(c);
      });
      var c = document.createElement('td');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ks-cal-b sk-del';
      b.textContent = '消す';
      b.setAttribute('data-id', String(x.r.id));
      b.setAttribute('aria-label', x.who + 'の' + x.r.s + 'を消す');
      c.appendChild(b);
      tr.appendChild(c);
      body.appendChild(tr);
    });
    wrap.hidden = !rows.length;
    none.hidden = rows.length > 0;
    paper(rows);
  };
  var pick = function () { return document.querySelector('input[name="k"]:checked') || document.querySelector('input[name="k"]'); };
  save.addEventListener('click', function () {
    var r = pick();
    if (!r || !daiDate(day.value)) { msg.textContent = '修了証書の日付を入れてください'; return; }
    var q = { k: r.value, s: r.getAttribute('data-name'), years: r.getAttribute('data-years'), count: r.getAttribute('data-count') || '' };
    // ほかのタブ・ページで残した分を消さないように、押したときに読み直す
    list = daiLoad();
    var n = daiName(who.value);
    var had = n && list.some(function (x) { return x.n === n && x.k === q.k; });
    list = daiPut(list, n, q, day.value);
    daiSave(list);
    msg.textContent = had ? '台帳の同じ行を書きかえました' : '台帳に残しました';
    draw();
  });
  who.addEventListener('input', function () { msg.textContent = ''; });
  day.addEventListener('input', function () { msg.textContent = ''; });
  if (pbtn) pbtn.addEventListener('click', function () { draw(); window.print(); });
  if (body) body.addEventListener('click', function (e) {
    var b = e.target.closest('.sk-del');
    if (!b) return;
    list = daiDel(list, Number(b.getAttribute('data-id')));
    daiSave(list);
    draw();
  });
  draw();
})();
