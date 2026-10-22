(function () {
  var s = null;
  try { s = localStorage.getItem('gyoshu'); } catch (e) {}
  if (!s) return;
  Array.prototype.forEach.call(document.querySelectorAll('.fuda-b'), function (a) {
    if (a.getAttribute('data-k') === s) a.setAttribute('aria-current', 'true');
  });
})();
