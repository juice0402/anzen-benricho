// 職場を測る記録帳（#77）：測った数字を決まりとくらべる・端末の中だけに残す（tests/sokutei.test.mjs が node で確かめる）
// 保存は localStorage の anzen-sokutei-v1（送らない）。1件は { fy: 年度, m: 月, d: 測った日, p: 場所, v: { co2, temp, hum, lux, wbgt } }
// 1か月・1場所・1件（同じ年度・月・場所は上書き）。ページでは export を外してスクリプトの前に入れる
export var SOK_KEY = 'anzen-sokutei-v1';
export var SOK_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
export var SOK_FIELDS = ['co2', 'temp', 'hum', 'lux', 'wbgt'];
// 年度（4月はじまり）
export function sokFyOf(iso) {
  var y = Number(iso.slice(0, 4));
  var m = Number(iso.slice(5, 7));
  return m >= 4 ? y : y - 1;
}
export function sokKey(r) { return r.fy + '-' + r.m + '-' + r.p; }
// 数字の欄：空や数字でないものは入れない
export function sokNum(s) {
  var t = String(s == null ? '' : s).trim();
  if (t === '') return null;
  var n = Number(t);
  return isFinite(n) && n >= 0 ? n : null;
}
// 記録を足す（同じ年度・月・場所は上書き）。数字が1つもないときは足さない
export function sokPut(store, iso, place, vals) {
  var v = {};
  var any = false;
  SOK_FIELDS.forEach(function (k) { var n = sokNum(vals[k]); if (n !== null) { v[k] = n; any = true; } });
  if (!any || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return store;
  var s = {};
  for (var k in store) s[k] = store[k];
  var r = { fy: sokFyOf(iso), m: Number(iso.slice(5, 7)), d: iso, p: String(place || '').trim().slice(0, 20), v: v };
  s[sokKey(r)] = r;
  return s;
}
export function sokDel(store, key) {
  var s = {};
  for (var k in store) if (k !== key) s[k] = store[k];
  return s;
}
// その年度の記録を、4月から3月の順・同じ月は場所の順に
export function sokRows(store, fy) {
  var out = [];
  for (var k in store) if (store[k] && store[k].fy === fy) out.push({ key: k, r: store[k] });
  out.sort(function (a, b) {
    var d = SOK_MONTHS.indexOf(a.r.m) - SOK_MONTHS.indexOf(b.r.m);
    return d || (a.r.p < b.r.p ? -1 : a.r.p > b.r.p ? 1 : 0);
  });
  return out;
}
// 決まりとくらべる。g は業種（jimusho は事務所則。ほかは照度が安衛則、空気と室温は事務所の数字を目安に）
// 返すのは [{ k: 項目, ok: 内か, text, law, meyasu }]。入れていない項目は出さない
export function sokJudge(vals, g, std) {
  var jim = !g || g === 'jimusho';
  var out = [];
  var n = function (k) { return sokNum(vals[k]); };
  var co2 = n('co2'), temp = n('temp'), hum = n('hum'), lux = n('lux'), wbgt = n('wbgt');
  var air = function (o) { o.meyasu = !jim; out.push(o); };
  if (co2 !== null) {
    var c = std.co2;
    if (co2 > c.max) air({ k: '二酸化炭素', ok: false, text: c.max + 'ppmをこえている', law: c.law });
    else if (co2 > c.sup) air({ k: '二酸化炭素', ok: true, text: c.max + 'ppm以下で内。設備が送る空気の基準' + c.sup + 'ppmより多い', law: c.law + '・' + c.supLaw });
    else air({ k: '二酸化炭素', ok: true, text: c.max + 'ppm以下で内', law: c.law });
  }
  if (temp !== null) {
    var t = std.temp;
    if (temp <= t.cold) air({ k: '気温', ok: false, text: t.cold + '℃以下。暖房などをする', law: t.coldLaw });
    else if (temp >= t.min && temp <= t.max) air({ k: '気温', ok: true, text: t.min + '〜' + t.max + '℃の内（努力義務）', law: t.law });
    else air({ k: '気温', ok: false, text: t.min + '〜' + t.max + '℃の外（努力義務）', law: t.law });
  }
  if (hum !== null) {
    var h = std.hum;
    var hin = hum >= h.min && hum <= h.max;
    air({ k: '湿度', ok: hin, text: h.min + '〜' + h.max + '%の' + (hin ? '内' : '外') + '（努力義務）', law: h.law });
  }
  if (lux !== null) {
    var tiers = jim ? std.lux.jimusho : std.lux.other;
    var law = jim ? std.lux.law.jimusho : std.lux.law.other;
    var hit = null;
    for (var i = 0; i < tiers.length; i++) if (lux >= tiers[i][0]) { hit = i; break; }
    var text;
    if (hit === null) text = tiers[tiers.length - 1][1] + 'の' + tiers[tiers.length - 1][0] + 'ルクスに足りない';
    else if (hit === 0) text = tiers[0][1] + 'の' + tiers[0][0] + 'ルクス以上で内';
    else text = tiers[hit][1] + 'なら内。' + tiers[hit - 1][1] + 'には' + tiers[hit - 1][0] + 'ルクス要る';
    out.push({ k: '照度', ok: hit !== null, text: text, law: law, meyasu: false });
  }
  if (wbgt !== null || temp !== null) {
    var e = std.heat;
    var hot = (wbgt !== null && wbgt >= e.wbgt) || (temp !== null && temp >= e.temp);
    if (wbgt !== null || hot) {
      out.push({
        k: '暑さ',
        ok: !hot,
        hot: hot,
        text: hot
          ? '熱中症の報告の体制と手順の対象になる暑さ（1時間以上続くか、1日4時間をこえる作業）'
          : 'WBGT' + e.wbgt + '度・気温' + e.temp + '度より下',
        law: e.law,
        meyasu: false,
      });
    }
  }
  return out;
}
export function sokLoad() {
  try { var v = JSON.parse(localStorage.getItem(SOK_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; }
}
export function sokSave(store) {
  try { localStorage.setItem(SOK_KEY, JSON.stringify(store)); } catch (e) {}
}
export function sokToday() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate();
}
