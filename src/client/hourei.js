(function () {
  var boxes = document.querySelectorAll('.u-cond input');
  var rows = document.querySelectorAll('.hr-list li');
  var note = document.querySelector('.u-note');
  if (!boxes.length || !note) return;
  var first = note.textContent;
  function apply() {
    var on = {}, any = false, n = 0, keep = [];
    Array.prototype.forEach.call(boxes, function (b) { if (b.checked) { on[b.value] = 1; any = true; keep.push(b.value); } });
    Array.prototype.forEach.call(rows, function (r) {
      var c = r.getAttribute('data-cond');
      var show = !any || !c || on[c] === 1;
      r.hidden = !show;
      if (show) n++;
    });
    note.textContent = any ? 'うちの職場に関係する改正は ' + n + ' 件' : first;
    try { localStorage.setItem('hourei-u', keep.join(',')); } catch (e) {}
  }
  var saved = '';
  try { saved = localStorage.getItem('hourei-u') || ''; } catch (e) {}
  if (saved) Array.prototype.forEach.call(boxes, function (b) { b.checked = (',' + saved + ',').indexOf(',' + b.value + ',') > -1; });
  Array.prototype.forEach.call(boxes, function (b) { b.addEventListener('change', apply); });
  apply();
})();
