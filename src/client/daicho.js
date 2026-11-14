// 資格の期限の台帳（#102）：出した期限を「台帳に残す」で端末の中だけに残し、期限の近い順の表に出す（localStorage anzen-shikaku-v1。送らない）
// 部品は daicho.mjs（ページではこのスクリプトの前に入る）。入れた文字は textContent で出す（HTML にしない）
(function () {
  var save = document.getElementById('k-save');
  var who = document.getElementById('k-who');
  var msg = document.getElementById('k-msg');
  var day = document.getElementById('k-day');
  var body = document.querySelector('.db-body');
  var none = document.querySelector('.db-none');
  if (!save || !who || !day || !body) return;
  var wrap = body.parentNode.parentNode;
  var list = daiLoad();
  var md = function (iso) { var d = daiDate(iso); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); };
  var today = function () { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  var draw = function () {
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
  };
  var pick = function () { return document.querySelector('input[name="k"]:checked') || document.querySelector('input[name="k"]'); };
  save.addEventListener('click', function () {
    var r = pick();
    if (!r || !daiDate(day.value)) { msg.textContent = '修了証書の日付を入れてください'; return; }
    var q = { k: r.value, s: r.getAttribute('data-name'), years: r.getAttribute('data-years'), count: r.getAttribute('data-count') || '' };
    var n = daiName(who.value);
    var had = n && list.some(function (x) { return x.n === n && x.k === q.k; });
    list = daiPut(list, n, q, day.value);
    daiSave(list);
    msg.textContent = had ? '台帳の同じ行を書きかえました' : '台帳に残しました';
    draw();
  });
  who.addEventListener('input', function () { msg.textContent = ''; });
  day.addEventListener('input', function () { msg.textContent = ''; });
  body.addEventListener('click', function (e) {
    var b = e.target.closest('.sk-del');
    if (!b) return;
    list = daiDel(list, Number(b.getAttribute('data-id')));
    daiSave(list);
    draw();
  });
  draw();
})();
