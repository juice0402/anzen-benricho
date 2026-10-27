// 写真：決めた名前のファイルが2つ（640・1200）ともあるか、どのテーマ・業種にも写真があるか
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { PHOTO, photoBase } from '../src/data/photos.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';

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
