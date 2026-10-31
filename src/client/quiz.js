// 今月の1問：えらぶと正解・解説・出典を出す。結果は保存しない・送らない
document.querySelectorAll('.qz').forEach(function (q) {
  var a = Number(q.getAttribute('data-a'));
  var bs = q.querySelectorAll('.q-ch button');
  bs.forEach(function (b) {
    b.addEventListener('click', function () {
      if (q.classList.contains('done')) return;
      q.classList.add('done');
      var i = Number(b.getAttribute('data-i'));
      bs.forEach(function (x, j) {
        x.setAttribute('aria-disabled', 'true');
        x.parentNode.classList.add(j === a ? 'ok' : 'ng');
      });
      b.parentNode.classList.add('you');
      var r = q.querySelector('.qz-r');
      r.querySelector('.qz-ok').textContent = i === a ? '正解' : '正解は' + ['ア', 'イ', 'ウ'][a];
      r.hidden = false;
    });
  });
});
