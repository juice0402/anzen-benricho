// 資格の期限の .ics（src/client/ics.mjs）：日付と RFC 5545 の形
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icsShift, icsFold, icsEvents, icsMake } from '../src/client/ics.mjs';
import { SHIKAKU } from '../src/data/shikaku.mjs';

const day = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const base = { url: 'https://anzen-benricho.com/shikaku/koushin/', now: new Date(Date.UTC(2026, 9, 28, 14, 5, 9)), memo6: '' };

test('月末：期限が3月31日なら6か月前は9月30日、1か月前は2月の末', () => {
  const ev = (y) => icsEvents('清掃作業監督者', new Date(y, 2, 31), new Date(2020, 0, 1), '').map((e) => day(e.d));
  assert.deepEqual(ev(2031), ['2030-9-30', '2031-2-28', '2031-3-31']);
  assert.deepEqual(ev(2032), ['2031-9-30', '2032-2-29', '2032-3-31']);
});

test('清掃作業監督者（6年）と病院清掃受託責任者（4年）の例', () => {
  const k = SHIKAKU.find((s) => s.key === 'kantoku');
  const b = SHIKAKU.find((s) => s.key === 'byouin');
  const limK = icsShift(new Date(2024, 3, 15), k.years, 0);
  assert.equal(day(limK), '2030-4-15');
  const tk = icsMake({ ...base, key: k.key, name: k.name, lim: limK, today: new Date(2026, 9, 28) });
  assert.match(tk, /DTSTART;VALUE=DATE:20291015\r\n/);
  assert.match(tk, /DTSTART;VALUE=DATE:20300315\r\n/);
  assert.match(tk, /DTSTART;VALUE=DATE:20300415\r\nDTEND;VALUE=DATE:20300416\r\n/);
  const limB = icsShift(new Date(2024, 1, 29), b.years, 0);
  assert.equal(day(limB), '2028-2-29');
  const tb = icsMake({ ...base, key: b.key, name: b.name, lim: limB, today: new Date(2026, 9, 28) });
  assert.match(tb, /DTSTART;VALUE=DATE:20270829\r\n/);
  assert.match(tb, /DTSTART;VALUE=DATE:20280129\r\n/);
  assert.match(tb, /UID:byouin-20280229-lim@anzen-benricho\.com\r\n/);
});

test('今日より前の6か月前・1か月前は入れない', () => {
  const t = icsMake({ ...base, key: 'kantoku', name: '清掃作業監督者', lim: new Date(2026, 10, 20), today: new Date(2026, 9, 28) });
  assert.equal(t.match(/BEGIN:VEVENT/g).length, 1);
  assert.match(t, /SUMMARY:清掃作業監督者の期限\r\n/);
  const t2 = icsMake({ ...base, key: 'kantoku', name: '清掃作業監督者', lim: new Date(2027, 1, 28), today: new Date(2026, 9, 28) });
  assert.equal(t2.match(/BEGIN:VEVENT/g).length, 2);
});

test('RFC 5545 の形', () => {
  const t = icsMake({ ...base, memo6: '期限の6か月前から期限までに修了すると、期限から6年のびる。再講習：毎月（講義はオンライン）。申し込みから修了証まで約3か月', key: 'kantoku', name: '清掃作業監督者', lim: new Date(2030, 3, 15), today: new Date(2026, 9, 28) });
  assert.ok(t.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:'));
  assert.ok(t.endsWith('END:VCALENDAR\r\n'));
  assert.equal(t.replace(/\r\n/g, '').includes('\n'), false, 'LF だけの改行がない');
  assert.equal(t.match(/BEGIN:VEVENT/g).length, 3);
  assert.equal(t.match(/^UID:/gm).length, 3);
  assert.equal(t.match(/^DTSTAMP:20261028T140509Z\r$/gm).length, 3);
  assert.equal(t.match(/^TRIGGER;RELATED=START:PT9H\r$/gm).length, 3);
  for (const l of t.split('\r\n')) assert.ok(Buffer.byteLength(l) <= 75, `75オクテットをこえる行: ${l}`);
  // 折り返しをもどすと元の文（字の途中で切っていない）
  const un = t.replace(/\r\n /g, '');
  assert.match(un, /DESCRIPTION:期限の6か月前から期限までに修了すると、期限から6年のびる。再講習：毎月（講義はオンライン）。申し込みから修了証まで約3か月\\nhttps:\/\/anzen-benricho\.com\/shikaku\/koushin\/\r\n/);
  assert.match(un, /SUMMARY:清掃作業監督者の期限まで6か月\r\n/);
  assert.match(un, /SUMMARY:清掃作業監督者の期限まで1か月\r\n/);
});

test('折り返しは UTF-8 の字の途中で切らない', () => {
  const f = icsFold('DESCRIPTION:' + 'あ'.repeat(60) + '𠮷'.repeat(5));
  for (const l of f.split('\r\n')) assert.ok(Buffer.byteLength(l) <= 75);
  assert.equal(f.replace(/\r\n /g, ''), 'DESCRIPTION:' + 'あ'.repeat(60) + '𠮷'.repeat(5));
});
