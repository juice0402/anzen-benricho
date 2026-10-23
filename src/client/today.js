// トップの予定表：「今日」の線を、見ている日の月の行に動かし、日付を今日にする（作り直しは1日と15日だけなので）
(function () {
  var mark = document.querySelector('.yt-today');
  if (!mark) return;
  var d = new Date();
  var m = d.getMonth() + 1;
  var row = document.querySelector('.yt > li[data-m="' + m + '"]');
  if (!row) return;
  mark.firstChild.textContent = '今日 ' + m + '月' + d.getDate() + '日';
  if (mark.parentNode !== row) row.appendChild(mark);
})();
