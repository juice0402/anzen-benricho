// 月のページの◯月号（#42）：暦・カレンダーの購読 /calendar.ics・今月の1問・委員会で話すこと
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KOYOMI } from '../src/data/koyomi.mjs';
import { calYear, monthKoyomi, calendarIcs } from '../src/koyomi.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import NENKAN from '../src/data/kihon/nenkan.mjs';
import monthPages from '../src/pages/months.mjs';

const NG = ['しましょう', 'ぜひ', '便利', '簡単', '安心', 'おすすめ', 'お得', 'ポイント', 'コツ', '——'];
const themeSrc = (t) => [...t.common, ...t.gyoshu.flatMap((g) => g.src)].map((s) => s.u);
const KNOWN = new Set([...NENKAN.src.map((s) => s.u), ...ALL_THEMES.flatMap(themeSrc)]);

test('暦の運動：名前と出典があり、出典はテーマか1年のページにあるもの', () => {
  assert.equal(new Set(KOYOMI.map((r) => r.key)).size, KOYOMI.length);
  for (const r of KOYOMI) {
    assert.ok(r.name && r.src, r.key);
    assert.ok(KNOWN.has(r.src), `${r.key} の出典がテーマ・1年のページにない`);
    assert.equal([r.span, r.month, r.dates, r.pref].filter(Boolean).length, 1, `${r.key} の書き方は1つだけ`);
    if (r.dates || r.pref) assert.ok(r.months?.length, `${r.key} に months`);
    for (const [f, t] of r.dates || []) assert.ok(/^\d{4}-\d\d-\d\d$/.test(f) && f <= t, r.key);
  }
});

test('暦の年はその月が次に来る年（今月は今年）', () => {
  assert.equal(calYear(12, '2026-10-15'), 2026);
  assert.equal(calYear(10, '2026-10-15'), 2026);
  assert.equal(calYear(9, '2026-10-15'), 2027);
});

test('暦：週間は色の日と運動開始、確かめていない年は色なしで「日付は発表後」、都道府県ごとは色なし', () => {
  const jul = monthKoyomi(2027, 7);
  assert.deepEqual([...jul.run].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(jul.marks[1].includes('運動開始'));
  const sep = monthKoyomi(2027, 9);
  assert.equal(sep.run.size, 0);
  assert.ok(sep.legend.some((l) => l.includes('秋の全国交通安全運動（日付は発表後）')));
  const dec = monthKoyomi(2026, 12);
  assert.ok(dec.legend.some((l) => l.includes('年末の交通安全運動（期間は都道府県ごと）')));
  assert.ok(dec.legend.some((l) => l.includes('年末年始無災害運動（1月15日まで）')));
  assert.ok(dec.marks[1].includes('運動開始'));
  const nov = monthKoyomi(2026, 11);
  assert.deepEqual([...nov.run].sort((a, b) => a - b), [9, 10, 11, 12, 13, 14, 15]);
  const jan = monthKoyomi(2027, 1);
  assert.ok(jan.marks[1].includes('施行'), '1月1日の法改正に施行の印');
});

const ics = (now) => calendarIcs({ themes: ALL_THEMES, now });

test('calendar.ics：RFC 5545 の形（CRLF・75オクテットまで・必須の行）', () => {
  const s = ics(new Date(Date.UTC(2026, 9, 31, 3, 0, 0)));
  assert.ok(s.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(s.endsWith('END:VCALENDAR\r\n'));
  assert.ok(!/[^\r]\n/.test(s), '改行は CRLF');
  for (const l of s.split('\r\n')) assert.ok(Buffer.byteLength(l) <= 75, `長い行: ${l}`);
  const evs = s.replace(/\r\n /g, '').split('BEGIN:VEVENT').slice(1);
  assert.ok(evs.length > 20);
  for (const e of evs) {
    for (const k of ['UID:', 'DTSTAMP:', 'DTSTART;VALUE=DATE:', 'DTEND;VALUE=DATE:', 'SUMMARY:', 'END:VEVENT']) assert.ok(e.includes(k), `${k} がない`);
    const a = e.match(/DTSTART;VALUE=DATE:(\d+)/)[1];
    const b = e.match(/DTEND;VALUE=DATE:(\d+)/)[1];
    assert.ok(b > a, 'DTEND は DTSTART より後');
  }
});

test('calendar.ics：12か月ぶんの◯月号、UID は重ならず、作り直しても同じ', () => {
  const s1 = ics(new Date(Date.UTC(2026, 9, 31, 3, 0, 0)));
  const s2 = ics(new Date(Date.UTC(2026, 9, 31, 9, 30, 0)));
  const flat = (s) => s.replace(/\r\n /g, '');
  const uids = (s) => [...flat(s).matchAll(/^UID:(.+)$/gm)].map((m) => m[1]);
  assert.equal(new Set(uids(s1)).size, uids(s1).length);
  assert.deepEqual(uids(s1), uids(s2));
  const go = [...flat(s1).matchAll(/^SUMMARY:安全衛生の便利帳 (\d+)月号$/gm)].map((m) => Number(m[1]));
  assert.equal(go.length, 12);
  assert.deepEqual([...go].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const starts = [...flat(s1).matchAll(/DTSTART;VALUE=DATE:(\d+)/g)].map((m) => m[1]);
  assert.ok(starts.every((d) => d <= '20271031'), '12か月先まで');
});

test('今月の1問：テーマ全部に3択・答えは範囲内・解説・出典はそのテーマの出典', () => {
  for (const t of ALL_THEMES) {
    const q = t.quiz;
    assert.ok(q, `${t.slug} に quiz がない`);
    assert.ok(q.q && q.why, t.slug);
    assert.equal(q.choices.length, 3, t.slug);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 2, t.slug);
    assert.ok(themeSrc(t).includes(q.src), `${t.slug} の出典がテーマの出典にない`);
    const all = [q.q, q.why, ...q.choices].join(' ');
    for (const w of NG) assert.ok(!all.includes(w), `${t.slug} に「${w}」`);
  }
});

test('委員会で話すこと：テーマ全部に3つ・40字まで・使わない言葉なし・義務の言い切りなし', () => {
  for (const t of ALL_THEMES) {
    assert.equal(t.gidai?.length, 3, `${t.slug} の gidai は3つ`);
    for (const g of t.gidai) {
      assert.ok([...g].length <= 40, `${t.slug}：40字をこえる「${g}」`);
      for (const w of [...NG, 'しなければならない']) assert.ok(!g.includes(w), `${t.slug} に「${w}」`);
    }
  }
});

test('月のページ：暦・1問・委員会の議題があり、本文（右の柱をのぞく）は600字以上', () => {
  const pages = monthPages(ALL_THEMES, 11).filter((p) => /^\/anzen\/\d+\/$/.test(p.path));
  assert.equal(pages.length, 12);
  for (const p of pages) {
    for (const id of ['ky-h', 'qz-h', 'gd-h']) assert.ok(p.html.includes(`id="${id}"`), `${p.path} に ${id}`);
    const main = p.html.match(/<main[\s\S]*?<\/main>/)[0].replace(/<aside class="rail">[\s\S]*?<\/aside>/, '');
    const text = main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    assert.ok(text.length >= 600, `${p.path} の本文は ${text.length}字`);
  }
});
