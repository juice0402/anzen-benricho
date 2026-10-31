// 資格の期限をカレンダーに入れる .ics（RFC 5545）を作る。端末の中だけで作り、送らない
// koushin のページでは export を外して koushin.js の前に入れる（tests/ics.test.mjs が node で確かめる）
// その月にない日（うるう日・月末）は月末にそろえる
export function icsShift(d, y, m) {
  var t = new Date(d.getFullYear() + y, d.getMonth() + m, 1);
  t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
  return t;
}
export function icsPad(n) { return (n < 10 ? '0' : '') + n; }
export function icsDay(d) { return d.getFullYear() + icsPad(d.getMonth() + 1) + icsPad(d.getDate()); }
export function icsStamp(d) {
  return d.getUTCFullYear() + icsPad(d.getUTCMonth() + 1) + icsPad(d.getUTCDate()) + 'T' + icsPad(d.getUTCHours()) + icsPad(d.getUTCMinutes()) + icsPad(d.getUTCSeconds()) + 'Z';
}
export function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
// 1行75オクテットまで。こえたら CRLF と空白1つで折り返す（UTF-8 の字の途中では切らない）
export function icsFold(line) {
  var out = '';
  var n = 0;
  var lim = 75;
  for (var i = 0; i < line.length; i++) {
    var c = line.charCodeAt(i);
    var ch = line[i];
    var b = c < 0x80 ? 1 : c < 0x800 ? 2 : 3;
    if (c >= 0xd800 && c <= 0xdbff) { ch += line[++i]; b = 4; }
    if (n + b > lim) { out += '\r\n '; n = 1; }
    out += ch;
    n += b;
  }
  return out;
}
// 期限・6か月前・1か月前の予定（終日）。今日より前の日は入れない
export function icsEvents(name, lim, today, memo6) {
  var list = [
    { k: 'm6', d: icsShift(lim, 0, -6), t: name + 'の期限まで6か月', m: memo6 },
    { k: 'm1', d: icsShift(lim, 0, -1), t: name + 'の期限まで1か月', m: '' },
    { k: 'lim', d: lim, t: name + 'の期限', m: '' },
  ];
  return list.filter(function (e) { return e.d >= today; });
}
export function icsMake(o) {
  var stamp = icsStamp(o.now);
  var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//anzen-benricho.com//koushin//JA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  var ev = icsEvents(o.name, o.lim, o.today, o.memo6);
  for (var i = 0; i < ev.length; i++) {
    var e = ev[i];
    var memo = (e.m ? e.m + '\n' : '') + o.url;
    lines.push(
      'BEGIN:VEVENT',
      'UID:' + o.key + '-' + icsDay(o.lim) + '-' + e.k + '@anzen-benricho.com',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + icsDay(e.d),
      'DTEND;VALUE=DATE:' + icsDay(new Date(e.d.getFullYear(), e.d.getMonth(), e.d.getDate() + 1)),
      'SUMMARY:' + icsText(e.t),
      'DESCRIPTION:' + icsText(memo),
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsText(e.t),
      'TRIGGER;RELATED=START:PT9H',
      'END:VALARM',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(icsFold).join('\r\n') + '\r\n';
}
