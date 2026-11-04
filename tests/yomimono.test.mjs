// 読みもの（/yomimono/）の決まり：ひな形の項目（docs/yomimono-neta.md）・本文900字以上・出典2つ以上で公的なサイト・つなぐ先1〜3・写真
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { YOMIMONO, yomimonoPath } from '../src/data/yomimono/index.mjs';
import { PHOTO, photoBase } from '../src/data/photos.mjs';
import { descLen } from '../src/describe.mjs';
import { KIHON } from '../src/data/kihon/index.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import { NAYAMI } from '../src/data/nayami.mjs';

const KEYS = ['slug', 'h1', 'title', 'description', 'd', 'published', 'checked', 'photo', 'lead', 'sections', 'voice', 'links', 'src'];
// 全角1・半角0.5
const w = (s) => descLen(s);
// 出典のドメイン：国・自治体・職場のあんぜんサイトの jaish・中災防・全国ビルメンテナンス協会（資格の講習をする団体）
const OK_DOMAIN = /^https:\/\/([a-z0-9-]+\.)*(go\.jp|lg\.jp|jaish\.gr\.jp|jisha\.or\.jp|j-bma\.or\.jp)\//;
const NG = ['しましょう', 'ぜひ', '便利', '簡単', '安心', 'おすすめ', 'ポイント', 'コツ', '——'];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
// 本文の字数：lead・節の段落・表・voice（出典とリンクの字は数えない）
const bodyLen = (y) =>
  [y.lead, ...y.sections.flatMap((s) => [...s.p, ...(s.table ? [...s.table.head, ...s.table.rows.flat()] : [])]), y.voice || ''].join('').length;

test('読みもの：1本以上あり、slug と h1 が重ならない', () => {
  assert.ok(YOMIMONO.length >= 1);
  assert.equal(new Set(YOMIMONO.map((y) => y.slug)).size, YOMIMONO.length, 'slug が重なっている');
  assert.equal(new Set(YOMIMONO.map((y) => y.h1)).size, YOMIMONO.length, 'h1 が重なっている');
});

test('読みもの：新しい順に並んでいる', () => {
  for (let i = 1; i < YOMIMONO.length; i++) assert.ok(YOMIMONO[i - 1].published >= YOMIMONO[i].published, `${YOMIMONO[i].slug} の並び`);
});

for (const y of YOMIMONO) {
  test(`読みもの ${y.slug}：ひな形の項目と形`, () => {
    assert.deepEqual(Object.keys(y).sort(), [...KEYS].sort(), '項目がひな形とちがう');
    assert.match(y.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.equal(yomimonoPath(y), `/yomimono/${y.slug}/`);
    assert.ok(w(y.title) <= 34, `title が長い（${w(y.title)}）`);
    assert.ok(w(y.description) >= 80 && w(y.description) <= 120, `description の長さ ${w(y.description)}`);
    assert.match(y.description, /\d/, 'description に数字がない');
    assert.ok(w(y.d) <= 26, `d が長い（${w(y.d)}）`);
    assert.match(y.published, DAY);
    assert.match(y.checked, DAY);
    assert.ok(y.checked >= y.published, 'checked が公開日より前');
    assert.ok(w(y.lead) <= 130, `lead が長い（${w(y.lead)}）`);
    assert.ok(y.sections.length >= 3 && y.sections.length <= 5, '節は3〜5つ');
    for (const s of y.sections) {
      assert.ok(s.h && Array.isArray(s.p) && s.p.length, `節「${s.h}」の形`);
      if (s.table) for (const r of s.table.rows) assert.equal(r.length, s.table.head.length, `節「${s.h}」の表の列の数`);
    }
    assert.ok(y.voice === null || (typeof y.voice === 'string' && y.voice.length > 0), 'voice は null か文');
  });

  test(`読みもの ${y.slug}：本文900字以上・2,500字くらいまで`, () => {
    const n = bodyLen(y);
    assert.ok(n >= 900, `本文が ${n} 字`);
    assert.ok(n <= 2800, `本文が ${n} 字で長すぎる`);
  });

  test(`読みもの ${y.slug}：出典は2つ以上で公的なサイト、つなぐ先は1〜3でサイトの中`, () => {
    assert.ok(y.src.length >= 2, '出典が2つより少ない');
    for (const s of y.src) {
      assert.ok(s.t, '出典の題がない');
      assert.match(s.url, OK_DOMAIN, `出典のドメイン: ${s.url}`);
    }
    assert.ok(y.links.length >= 1 && y.links.length <= 3, 'つなぐ先は1〜3');
    for (const l of y.links) {
      assert.ok(l.t && l.d, 'つなぐ先の t と d');
      assert.ok(l.href.startsWith('/') || l.href.startsWith('https://sakutto-keisan.com/'), `つなぐ先: ${l.href}`);
    }
  });

  test(`読みもの ${y.slug}：写真は ym-<slug> で photos.mjs にある`, () => {
    assert.equal(y.photo, `ym-${y.slug}`);
    assert.ok(PHOTO[y.photo], `photos.mjs に ${y.photo} がない`);
    assert.ok(existsSync(new URL(`../public${photoBase(y.photo)}-1200.webp`, import.meta.url)), '写真のファイルがない');
  });

  test(`読みもの ${y.slug}：使わない言葉がない`, () => {
    const all = [y.h1, y.title, y.description, y.d, y.lead, ...y.sections.flatMap((s) => [s.h, ...s.p, ...(s.table ? s.table.rows.flat() : [])]), y.voice || '', ...y.links.flatMap((l) => [l.t, l.d])].join('\n');
    for (const n of NG) assert.ok(!all.includes(n), `「${n}」がある`);
    assert.ok(!/\p{Extended_Pictographic}/u.test(all), '絵文字がある');
  });
}

test('読みもの：知識のページ・テーマ・こんなときはと同じ写真を使わない', () => {
  const used = new Set([...ALL_THEMES.map((t) => t.slug), ...NAYAMI.map((n) => n.ph), ...KIHON.map((p) => p.photo).filter(Boolean)]);
  for (const y of YOMIMONO) assert.ok(!used.has(y.photo), `${y.photo} はほかのページの写真`);
});
