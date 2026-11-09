// 職場を測る記録帳（#77）：キーの名前・送らない・年度の切りかえ・1か月1場所1件・決まりとのくらべ方
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SOK_KEY, SOK_MONTHS, sokFyOf, sokPut, sokDel, sokRows, sokJudge } from '../src/client/sokutei.mjs';
import { KIHON } from '../src/data/kihon/index.mjs';
import { KAU_READY, kauPath } from '../src/data/kau.mjs';
import SETSUBI from '../src/data/kihon/setsubi.mjs';
import { KANKI } from '../src/data/kanki.mjs';
import { HOUREI } from '../src/data/hourei.mjs';

const p = KIHON.find((x) => x.slug === 'sokutei');
const std = p.toolData.std;

test('記録のキーは anzen-sokutei-v1。ほかの記録のキーとちがう', () => {
  assert.equal(SOK_KEY, 'anzen-sokutei-v1');
  assert.notEqual(SOK_KEY, 'anzen-rec-v1');
  assert.deepEqual(SOK_MONTHS, [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]);
});

test('入れた数字を送らない（通信の関数を使わない）', () => {
  for (const f of ['src/client/sokutei.mjs', 'src/client/sokutei.js']) {
    const js = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    for (const w of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'navigator.share', '.submit(', 'new Image']) assert.ok(!js.includes(w), `${f} に ${w}`);
  }
});

test('年度は4月はじまり。3月31日と4月1日で年度が切りかわる', () => {
  assert.equal(sokFyOf('2027-03-31'), 2026);
  assert.equal(sokFyOf('2027-04-01'), 2027);
  let s = sokPut({}, '2027-03-31', '事務室', { co2: '800' });
  s = sokPut(s, '2027-04-01', '事務室', { co2: '900' });
  assert.equal(sokRows(s, 2026).length, 1);
  assert.equal(sokRows(s, 2027).length, 1);
  assert.equal(sokRows(s, 2027)[0].r.v.co2, 900);
});

test('1か月・1場所・1件：同じ月と場所は上書き。場所がちがえば別。4月から3月の順', () => {
  let s = sokPut({}, '2026-11-02', '事務室', { co2: '700', temp: '22' });
  s = sokPut(s, '2026-11-20', '事務室', { co2: '1200' });
  s = sokPut(s, '2026-11-20', '会議室', { lux: '450' });
  s = sokPut(s, '2027-01-10', '事務室', { hum: '35' });
  s = sokPut(s, '2026-05-10', '倉庫', { wbgt: '26.5' });
  const rows = sokRows(s, 2026);
  assert.deepEqual(rows.map((x) => `${x.r.m}${x.r.p}`), ['5倉庫', '11事務室', '11会議室', '1事務室']);
  const nov = rows.find((x) => x.r.m === 11 && x.r.p === '事務室').r;
  assert.deepEqual(nov.v, { co2: 1200 }, '上書き');
  assert.equal(nov.d, '2026-11-20');
  s = sokDel(s, rows[0].key);
  assert.equal(sokRows(s, 2026).length, 3);
});

test('数字が1つもない・日付がない・数字でないときは記録しない', () => {
  const s0 = {};
  assert.equal(sokPut(s0, '2026-11-02', '事務室', { co2: '', lux: 'abc' }), s0);
  assert.equal(sokPut(s0, '', '事務室', { co2: '800' }), s0);
  assert.equal(sokPut(s0, '2026-11-02', '事務室', { co2: '-5' }), s0);
});

const one = (vals, g, k) => sokJudge(vals, g, std).find((x) => x.k === k);
test('事務所：二酸化炭素5000ppm・気温18〜28℃・湿度40〜70%・照度300と150', () => {
  assert.equal(one({ co2: 5000 }, 'jimusho', '二酸化炭素').ok, true);
  assert.equal(one({ co2: 5001 }, 'jimusho', '二酸化炭素').ok, false);
  assert.match(one({ co2: 1500 }, 'jimusho', '二酸化炭素').text, /1000ppm/);
  assert.equal(one({ temp: 18 }, 'jimusho', '気温').ok, true);
  assert.equal(one({ temp: 28.5 }, 'jimusho', '気温').ok, false);
  assert.match(one({ temp: 10 }, 'jimusho', '気温').law, /4条1項/);
  assert.equal(one({ hum: 39 }, 'jimusho', '湿度').ok, false);
  assert.equal(one({ hum: 70 }, 'jimusho', '湿度').ok, true);
  assert.equal(one({ lux: 300 }, 'jimusho', '照度').ok, true);
  assert.match(one({ lux: 200 }, 'jimusho', '照度').text, /付随的な事務作業なら内/);
  assert.equal(one({ lux: 149 }, 'jimusho', '照度').ok, false);
  assert.equal(one({ co2: 800 }, 'jimusho', '二酸化炭素').meyasu, false);
});

test('事務所でない作業場：照度は安衛則の3段、空気と室温は目安', () => {
  assert.equal(one({ lux: 100 }, 'seizo', '照度').law, '安衛則604条');
  assert.match(one({ lux: 100 }, 'seizo', '照度').text, /粗な作業なら内/);
  assert.equal(one({ lux: 69 }, 'inshoku', '照度').ok, false);
  assert.equal(one({ co2: 800 }, 'inshoku', '二酸化炭素').meyasu, true);
  assert.equal(one({ temp: 25 }, 'seisou', '気温').meyasu, true);
  assert.match(p.toolData.meyasu, /労働基準監督署に確認/);
});

test('暑さ：WBGT28度以上か気温31度以上で報告の体制の対象。作業の重さごとの基準値は出さない', () => {
  assert.equal(one({ wbgt: 28 }, 'seizo', '暑さ').hot, true);
  assert.equal(one({ wbgt: 27.9 }, 'seizo', '暑さ').hot, false);
  assert.equal(one({ temp: 31 }, 'jimusho', '暑さ').hot, true);
  assert.equal(one({ temp: 30 }, 'jimusho', '暑さ'), undefined, '気温だけで対象でないときは暑さの行を出さない');
  assert.equal(one({ wbgt: 30 }, 'inshoku', '暑さ').law, '安衛則612条の2');
  assert.ok(!JSON.stringify(p).includes('基準値'));
});

test('数字はサイトのほかのデータと同じ（setsubi・kanki・necchusho）', () => {
  const setsubi = JSON.stringify(SETSUBI.table.rows);
  assert.ok(setsubi.includes('300ルクス以上') && setsubi.includes('18〜28℃・湿度40〜70%') && setsubi.includes('10℃以下'));
  const jim = KANKI.gyoshu.find((g) => g.key === 'jimusho').memo;
  assert.ok(jim.includes(`${std.co2.max}ppm以下`) && jim.includes(`${std.co2.sup}ppm以下`));
  const nec = HOUREI.find((h) => h.slug === 'necchusho').who;
  assert.ok(nec.includes(`WBGT ${std.heat.wbgt}度以上か気温${std.heat.temp}度以上`));
  assert.ok(nec.includes('1時間以上続くか、1日4時間をこえる作業'));
  const kb = Object.fromEntries(p.table.rows.map((r) => [r.k, r.kb]));
  assert.equal(kb['空調の気温と湿度'], 'd');
});

test('何で測る？：4つの道具はそろえる物のページへの文字のリンク', () => {
  const ready = KAU_READY.map((k) => kauPath(k.key));
  assert.deepEqual(p.dougu.map((d) => d.href), ['/soroeru/co2/', '/soroeru/ondo/', '/soroeru/shodo/', '/soroeru/wbgt/']);
  for (const d of p.dougu) assert.ok(ready.includes(d.href), d.href);
});
