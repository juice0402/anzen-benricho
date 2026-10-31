// 今年度の記録（src/client/rec.mjs・#43）：年度の境目・1つの月に2つ以上のテーマ・外したとき・続けて記録した月
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recFy, recFyOf, recToggle, recDots, recRow, recStreak, REC_MONTHS } from '../src/client/rec.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';

test('年度は4月はじまり。3月に4月のテーマを押したら次の年度、4月に3月のテーマを押したら前の年度', () => {
  assert.equal(recFyOf('2027-03-31'), 2026);
  assert.equal(recFyOf('2027-04-01'), 2027);
  assert.equal(recFy(4, '2027-03-20'), 2027);
  assert.equal(recFy(3, '2027-04-05'), 2026);
  assert.equal(recFy(12, '2026-10-31'), 2026);
  assert.equal(recFy(1, '2026-12-20'), 2026);
  assert.equal(recFy(11, '2026-10-31'), 2026);
  assert.deepEqual(REC_MONTHS, [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]);
});

test('押すと日付、もう一度押すと外れる。3つとも外すと記録が消える', () => {
  const r = { fy: 2026, m: 11, t: 'karou', g: 'seisou' };
  let s = recToggle({}, r, 0, '2026-11-02');
  assert.deepEqual(recDots(s, 2026, 11), [true, false, false]);
  s = recToggle(s, r, 2, '2026-11-05');
  assert.deepEqual(recRow(s, 2026, 11).dates, ['2026-11-02', '', '2026-11-05']);
  s = recToggle(s, r, 0, '2026-11-06');
  assert.deepEqual(recDots(s, 2026, 11), [false, false, true]);
  s = recToggle(s, r, 2, '2026-11-06');
  assert.deepEqual(s, {});
});

test('1つの月に2つ以上のテーマ：どれかで押せばその月の丸。表は早い日と押したテーマ', () => {
  const dec = ALL_THEMES.filter((t) => t.month === 12);
  assert.ok(dec.length >= 2);
  let s = recToggle({}, { fy: 2026, m: 12, t: dec[0].slug, g: 'jimusho' }, 0, '2026-12-03');
  s = recToggle(s, { fy: 2026, m: 12, t: dec[1].slug, g: 'inshoku' }, 0, '2026-12-01');
  s = recToggle(s, { fy: 2026, m: 12, t: dec[1].slug, g: 'inshoku' }, 1, '2026-12-01');
  assert.deepEqual(recDots(s, 2026, 12), [true, true, false]);
  const row = recRow(s, 2026, 12);
  assert.deepEqual(row.dates, ['2026-12-01', '2026-12-01', '']);
  assert.deepEqual(row.themes.sort(), [dec[0].slug, dec[1].slug].sort());
  assert.deepEqual(recDots(s, 2027, 12), [false, false, false], 'ほかの年度には出ない');
});

test('続けて記録した月：今月から前へ。今月がまだ0なら先月から。年度をまたいで数える', () => {
  let s = {};
  for (const [fy, m] of [[2026, 1], [2026, 2], [2026, 3], [2027, 4]]) s = recToggle(s, { fy, m, t: 'x', g: 'jimusho' }, 1, '2027-04-01');
  // 2026年度の1〜3月（暦は2027年）と2027年度の4月
  assert.equal(recStreak(s, '2027-04-10'), 4);
  assert.equal(recStreak(s, '2027-05-10'), 4, '5月がまだ0なら4月から');
  assert.equal(recStreak(s, '2027-06-10'), 0, '5月が空いたら0');
  assert.equal(recStreak({}, '2027-04-10'), 0);
  assert.equal(recStreak(s, '2027-03-20'), 4, '来月（4月）にもう丸があれば来月から');
});
