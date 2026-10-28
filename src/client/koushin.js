(function () {
  var radios = document.querySelectorAll('input[name="k"]');
  var day = document.getElementById('k-day');
  var out = document.querySelector('.ks-out');
  var cal = document.getElementById('k-cal');
  if (!day || !out) return;
  var last = null;
  function fmt(d) { return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  // その月にない日（うるう日・月末）は月末にそろえる（icsShift は ics.mjs）
  var shift = icsShift;
  function pick() { for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i]; return radios[0]; }
  function calc() {
    var r = pick();
    var v = day.value;
    try { localStorage.setItem('koushin', JSON.stringify({ k: r.value, d: v })); } catch (e) {}
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!p) { out.hidden = true; last = null; return; }
    var done = new Date(+p[1], +p[2] - 1, +p[3]);
    var years = +r.getAttribute('data-years');
    var early = +r.getAttribute('data-early');
    var lim = shift(done, years, 0);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var left = Math.round((lim - today) / 86400000);
    document.getElementById('k-lim').textContent = fmt(lim) + 'まで';
    document.getElementById('k-left').textContent = left > 0 ? 'あと ' + left.toLocaleString('ja-JP') + ' 日' : left === 0 ? '今日が期限です' : '期限が切れています';
    var re;
    if (early) {
      var start = shift(lim, 0, -early);
      if (left < 0) re = '期限が切れたあとも、再講習を受ければ更新できます。';
      else if (today >= start) re = fmt(lim) + 'までに再講習を修了すると、期限から' + years + '年のびて ' + fmt(shift(lim, years, 0)) + 'までになります。申し込みから修了証まで約3か月です。';
      else re = fmt(start) + 'から' + fmt(lim) + 'までに再講習を修了すると、期限から' + years + '年のびます。申し込みから修了証まで約3か月です。';
    } else {
      var y = lim.getFullYear();
      if (left < 0) re = '期限が切れています。更新のしかたを協会に確かめてください。';
      else if (today >= new Date(y, 9, 1)) re = y + '年の再講習（8〜9月ごろ）が終わっていれば、更新のしかたを協会に確かめてください。';
      else re = y + '年の再講習（毎年8〜9月ごろ）を受けて更新します。申し込みの時期は協会の案内で確かめてください。';
    }
    document.getElementById('k-re').textContent = re;
    // 期限が切れていたら、カレンダーに入れるものがないので出さない
    last = left < 0 ? null : { key: r.value, name: r.parentNode.textContent.trim(), lim: lim, today: today, memo6: r.getAttribute('data-memo') };
    if (cal) cal.parentNode.hidden = !last;
    out.hidden = false;
  }
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('koushin') || 'null'); } catch (e) {}
  if (saved) {
    for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === saved.k;
    if (!pick().checked) radios[0].checked = true;
    if (saved.d) day.value = saved.d;
  }
  // .ics は端末の中で作ってダウンロードする（送らない）
  if (cal) cal.addEventListener('click', function () {
    if (!last) return;
    var text = icsMake({ key: last.key, name: last.name, lim: last.lim, today: last.today, memo6: last.memo6, url: cal.getAttribute('data-url'), now: new Date() });
    var u = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = u;
    a.download = last.key + '-kigen.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 10000);
  });
  for (var j = 0; j < radios.length; j++) radios[j].addEventListener('change', calc);
  day.addEventListener('input', calc);
  day.addEventListener('change', calc);
  if (day.value) calc();
})();
