// 法人パックの売るページ（#82）：月のページが開けなかったとき（?e=1）だけ1行を出す
(function () {
  if (/[?&]e=1(&|$)/.test(location.search)) {
    var e = document.querySelector('.pk-err');
    if (e) e.hidden = false;
  }
})();
