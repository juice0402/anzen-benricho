// 資格の期限の台帳（#102）：資格の更新の期限で出した期限を、何人分でも端末の中だけに残す（tests/shikaku.test.mjs が node で確かめる）
// 保存は localStorage の anzen-shikaku-v1（送らない）。1件は { id, n: 呼び名, k: 資格のキー, s: 資格の名前, d: 修了日, lim: 期限 }（日付は YYYY-MM-DD）
// 同じ呼び名・同じ資格は上書き。呼び名が空の行どうしは上書きせず足す。期限は ics.mjs の icsLimit（計算と同じ数え方）
// ページでは export と import を外し、ics.mjs のあと・daicho.js の前に入れる
import { icsLimit } from './ics.mjs';

export var DAI_KEY = 'anzen-shikaku-v1';
export var DAI_NAME_MAX = 10;
export function daiIso(d) {
  return d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate();
}
export function daiDate(iso) {
  var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return p ? new Date(+p[1], +p[2] - 1, +p[3]) : null;
}
export function daiName(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, DAI_NAME_MAX);
}
// q は資格 { k, s: 名前, years, count }。修了日が日付でないときは足さない
export function daiPut(list, who, q, done) {
  var d = daiDate(done);
  if (!d || !q || !q.k) return list;
  var n = daiName(who);
  var id = 1;
  list.forEach(function (x) { if (x.id >= id) id = x.id + 1; });
  var r = { id: id, n: n, k: q.k, s: String(q.s || ''), d: done, lim: daiIso(icsLimit(d, +q.years, q.count || '')) };
  var hit = false;
  var out = list.map(function (x) {
    if (n && x.n === n && x.k === q.k) { hit = true; r.id = x.id; return r; }
    return x;
  });
  if (!hit) out.push(r);
  return out;
}
export function daiDel(list, id) {
  return list.filter(function (x) { return x.id !== id; });
}
// 期限の近い順（同じ日は足した順）。呼び名が空の行は足した順に「1人目」「2人目」。left は今日から期限までの日数（過ぎたら負）
export function daiRows(list, today) {
  var no = {};
  var c = 0;
  list.slice().sort(function (a, b) { return a.id - b.id; }).forEach(function (x) { if (!x.n) no[x.id] = ++c; });
  return list
    .map(function (x) { return { r: x, who: x.n || no[x.id] + '人目', left: Math.round((daiDate(x.lim) - today) / 86400000) }; })
    .sort(function (a, b) { return a.r.lim < b.r.lim ? -1 : a.r.lim > b.r.lim ? 1 : a.r.id - b.r.id; });
}
// 表の「あと」の欄：過ぎたら「期限切れ」
export function daiLeft(left) {
  return left < 0 ? '期限切れ' : left === 0 ? '今日まで' : left.toLocaleString('ja-JP') + '日';
}
export function daiLoad() {
  try {
    var v = JSON.parse(localStorage.getItem(DAI_KEY) || '[]');
    return Array.isArray(v) ? v.filter(function (x) { return x && typeof x.id === 'number' && daiDate(x.lim) && daiDate(x.d); }) : [];
  } catch (e) { return []; }
}
export function daiSave(list) {
  try { localStorage.setItem(DAI_KEY, JSON.stringify(list)); } catch (e) {}
}
