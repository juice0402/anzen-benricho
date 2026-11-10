// 法人パックの月のページ（#82）：会社名を紙に入れる（送らない・残さない）・業種をえらぶ（業種だけ、ほかのページと同じく端末に覚える）・印刷
(function () {
  var co = document.getElementById('pk-co');
  var spots = document.querySelectorAll('[data-co]');
  if (co) co.addEventListener('input', function () {
    var v = co.value.trim() || '（会社名）';
    Array.prototype.forEach.call(spots, function (el) { el.textContent = v; });
  });
  var bs = document.querySelectorAll('.pk-pick .fuda-b');
  var papers = document.querySelectorAll('.pk-papers [data-g]');
  function pick(k) {
    var ok = false;
    Array.prototype.forEach.call(bs, function (b) { var on = b.getAttribute('data-g') === k; if (on) ok = true; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    if (!ok) return;
    Array.prototype.forEach.call(papers, function (p) { p.hidden = p.getAttribute('data-g') !== k; });
  }
  Array.prototype.forEach.call(bs, function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-g');
      pick(k);
      try { localStorage.setItem('gyoshu', k); } catch (e) {}
    });
  });
  var saved = null;
  try { saved = localStorage.getItem('gyoshu'); } catch (e) {}
  if (saved) pick(saved);
  var mail = document.querySelector('.pk-mail a');
  if (mail) mail.href = 'mailto:?subject=' + encodeURIComponent(document.title) + '&body=' + encodeURIComponent(location.href);
  var pb = document.querySelector('.print-btn');
  if (pb) pb.addEventListener('click', function () { window.print(); });
})();
