// 今月の1問の問題集：前に正解した問いは答えを出しておき、正解したら覚えて数と月の丸を直す（quiz.js のあと、quiz.mjs を前に入れる。送らない）
// 順序の決まり：quiz.js が先にボタンへクリックを付け（答えを出す）、このファイルがあとから付ける（正解を覚える）。data-got で1回だけ
(function () {
  var qs = document.querySelectorAll('.qz[data-s]');
  var all = [];
  qs.forEach(function (q) { all.push(q.getAttribute('data-s')); });
  var show = function () {
    var st = quizLoad();
    var n = document.querySelector('.qs-n');
    if (n) n.textContent = String(quizCount(st, all));
    document.querySelectorAll('.stp [data-ss]').forEach(function (c) {
      var ss = c.getAttribute('data-ss').split(' ');
      var k = quizCount(st, ss);
      c.querySelectorAll('.dots i').forEach(function (i, j) { i.className = st[ss[j]] ? 'on' : ''; });
      if (quizStamp(st, ss)) c.classList.add('full');
      c.setAttribute('aria-label', c.getAttribute('data-m') + '月 ' + ss.length + '問中' + k + '問正解');
    });
  };
  var st0 = quizLoad();
  qs.forEach(function (q) {
    var s = q.getAttribute('data-s');
    var a = Number(q.getAttribute('data-a'));
    var bs = q.querySelectorAll('.q-ch button');
    if (st0[s]) {
      q.classList.add('done');
      q.setAttribute('data-got', '');
      bs.forEach(function (x, j) {
        x.setAttribute('aria-disabled', 'true');
        x.parentNode.classList.add(j === a ? 'ok' : 'ng');
      });
      var r = q.querySelector('.qz-r');
      r.querySelector('.qz-ok').textContent = '正解（前に解いた問い）';
      r.hidden = false;
    }
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        if (q.hasAttribute('data-got')) return;
        q.setAttribute('data-got', '');
        if (Number(b.getAttribute('data-i')) === a) {
          quizSave(quizGot(quizLoad(), s));
          show();
        }
      });
    });
  });
  show();
})();
