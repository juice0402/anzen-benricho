// 今年度の記録（10/31 連絡 C-016 案B・#43）：業種のページで押した「掲示・朝礼・やること」の日付を端末の中だけに残す
// 保存は localStorage の anzen-rec-v1（送らない）。1件は { fy: 年度, m: テーマの月, t: テーマ, g: 業種, d: [掲示, 朝礼, やること の日付] }
// ページでは export を外してスクリプトの前に入れる（tests/rec.test.mjs が node で確かめる）
export var REC_KEY = 'anzen-rec-v1';
export var REC_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
// 年度（4月はじまり）
export function recFyOf(iso) {
  var y = Number(iso.slice(0, 4));
  var m = Number(iso.slice(5, 7));
  return m >= 4 ? y : y - 1;
}
// 押した日から見て、テーマの月がいちばん近い年度（3月に4月のテーマを押したら次の年度。同じ近さなら押した日の年度）
export function recFy(m, iso) {
  var fy = recFyOf(iso);
  var now = Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7));
  var best = fy;
  var gap = 99;
  [fy, fy + 1, fy - 1].forEach(function (f) {
    var g = Math.abs((m >= 4 ? f : f + 1) * 12 + m - now);
    if (g < gap) { gap = g; best = f; }
  });
  return best;
}
export function recKey(r) { return r.fy + '-' + r.m + '-' + r.t + '-' + r.g; }
// 押すと日付を入れ、もう一度押すと外す。3つとも空になったら消す
export function recToggle(store, r, i, iso) {
  var s = {};
  for (var k in store) s[k] = store[k];
  var key = recKey(r);
  var old = s[key];
  var d = old ? old.d.slice() : ['', '', ''];
  d[i] = d[i] ? '' : iso;
  if (d[0] || d[1] || d[2]) s[key] = { fy: r.fy, m: r.m, t: r.t, g: r.g, d: d };
  else delete s[key];
  return s;
}
export function recOf(store, fy, m) {
  var out = [];
  for (var k in store) if (store[k].fy === fy && store[k].m === m) out.push(store[k]);
  return out;
}
// その月の丸3つ（どれかのテーマ・業種で押してあれば丸）
export function recDots(store, fy, m) {
  var rs = recOf(store, fy, m);
  return [0, 1, 2].map(function (i) { return rs.some(function (r) { return !!r.d[i]; }); });
}
// 印刷の表：その月の3つの日付（いちばん早い日）と、押したテーマ
export function recRow(store, fy, m) {
  var rs = recOf(store, fy, m);
  var dates = [0, 1, 2].map(function (i) {
    return rs.map(function (r) { return r.d[i]; }).filter(Boolean).sort()[0] || '';
  });
  var ts = [];
  rs.forEach(function (r) { if (ts.indexOf(r.t) < 0) ts.push(r.t); });
  return { dates: dates, themes: ts };
}
// 続けて記録した月：今月から前へ、丸が1つ以上ある月が続いた数（今月がまだ0なら先月から数える）。
// サイトは15日から翌月のテーマを出すので、来月にもう丸があれば来月から数える
export function recStreak(store, iso) {
  var y = Number(iso.slice(0, 4));
  var m = Number(iso.slice(5, 7));
  var has = function (yy, mm) { return recDots(store, mm >= 4 ? yy : yy - 1, mm).some(Boolean); };
  if (has(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1)) { m += 1; if (m === 13) { m = 1; y += 1; } }
  else if (!has(y, m)) { m -= 1; if (m === 0) { m = 12; y -= 1; } }
  var n = 0;
  while (has(y, m) && n < 1200) { n += 1; m -= 1; if (m === 0) { m = 12; y -= 1; } }
  return n;
}
export function recLoad() {
  try { var v = JSON.parse(localStorage.getItem(REC_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; }
}
export function recSave(store) {
  try { localStorage.setItem(REC_KEY, JSON.stringify(store)); } catch (e) {}
}
export function recToday() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate();
}
