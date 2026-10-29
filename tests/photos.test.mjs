// 写真：決めた名前のファイルが2つ（640・1200）ともあるか、どのテーマ・業種にも写真があるか
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PHOTO, photoBase } from '../src/data/photos.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';
import { NAYAMI } from '../src/data/nayami.mjs';

const file = (k, w) => new URL(`../public${photoBase(k)}-${w}.webp`, import.meta.url);

test('写真：ファイルが2つともあり、重すぎない（1200 は 160KB まで）', () => {
  for (const k of Object.keys(PHOTO)) {
    for (const w of [640, 1200]) assert.ok(existsSync(file(k, w)), `${k}-${w}.webp がない`);
    assert.ok(statSync(file(k, 1200)).size <= 160 * 1024, `${k}-1200.webp が重い`);
  }
});

test('写真：どのテーマ・業種・コーナーにもある', () => {
  for (const t of ALL_THEMES) assert.ok(PHOTO[t.slug], `テーマ ${t.slug} の写真がない`);
  for (const g of GYOSHU) assert.ok(PHOTO[`g-${g.key}`], `業種 ${g.key} の写真がない`);
  for (const k of ['hero', 'kihon', 'kagaku', 'hourei', 'shikaku']) assert.ok(PHOTO[k], `${k} の写真がない`);
});

test('写真：説明（alt）は人がいない前提の短い文で、使わない言葉がない', () => {
  for (const [k, alt] of Object.entries(PHOTO)) {
    assert.ok(alt.length >= 6 && alt.length <= 50, `${k} の説明の長さ`);
    for (const w of ['しましょう', 'ぜひ', '便利', '簡単', '安心', 'おすすめ', 'ポイント', 'コツ']) assert.ok(!alt.includes(w), `${k} に「${w}」`);
  }
});

test('写真：トップの「こんなときは」は ny- の8枚で、おたがいに別・ほかの写真とも別のファイル', () => {
  const ks = NAYAMI.map((n) => n.ph);
  assert.equal(ks.length, 8);
  assert.equal(new Set(ks).size, 8, '同じ写真を2回使っている');
  for (const k of ks) assert.match(k, /^ny-/, `${k} は ny- の写真にする`);
  const seen = new Map();
  for (const k of Object.keys(PHOTO)) {
    if (!existsSync(file(k, 640))) continue;
    const h = createHash('sha1').update(readFileSync(file(k, 640))).digest('hex');
    assert.ok(!seen.has(h), `${k} と ${seen.get(h)} が同じ写真`);
    seen.set(h, k);
  }
});
