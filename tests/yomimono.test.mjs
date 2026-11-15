// 読みもの（/yomimono/）の決まり：ひな形の項目（docs/yomimono-neta.md）・本文900字以上・出典2つ以上で公的なサイト・つなぐ先1〜3・写真
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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

test('読みもの：ページとサイトマップ（目次と全部の記事が lastmod つきで出る）', async () => {
  const { default: yomimonoPages } = await import('../src/pages/yomimono.mjs');
  const pages = yomimonoPages();
  assert.deepEqual(pages.map((p) => p.path), ['/yomimono/', ...YOMIMONO.map(yomimonoPath)]);
  for (const p of pages) {
    assert.ok(!p.file, `${p.path} がサイトマップから外れる`);
    assert.match(p.lastmod, DAY, `${p.path} の lastmod`);
  }
  assert.ok(!pages[0].html.includes('class="adsbygoogle"'), '目次に広告の枠がある');
  const build = readFileSync(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(build, /\.\.\.yomimonoPages\(\)/, 'build.mjs が読みもののページを作っていない');
});

test('読みもの：毎週の出典の点検に記事の出典が入る（確認日の期限は見ない）', () => {
  const src = readFileSync(new URL('../scripts/check-sources.mjs', import.meta.url), 'utf8');
  assert.match(src, /for \(const y of YOMIMONO\) for \(const s of y\.src\) add\(\{ t: s\.t, u: s\.url \}/);
  assert.ok(!/YOMIMONO\.map\(\(y\) => \[[^\]]*checked/.test(src), '記事の確認日を期限の点検に入れている');
});

// 読みものから戻るリンク（#98）：links でつないだサイトの中のページに「読みもの：<h1>」が出て、つないでいないページには出ない。
// ページは作るところ（src/pages）から組み立て、ビルドしたあと（dist がある）は dist の HTML でも同じことを確かめる
test('読みもの：つないだページに読みものへ戻るリンクがあり、つないでいないページには出ない', async () => {
  const { MONTH, THEMES, themesInOrder } = await import('../src/data/themes.mjs');
  const { nextKaisei } = await import('../src/data/hourei.mjs');
  const mods = await Promise.all(['home', 'gyoshu', 'months', 'theme', 'hourei', 'shikaku', 'kihon', 'kiroku', 'yomimono', 'info'].map((n) => import(`../src/pages/${n}.mjs`)));
  const [home, gyoshu, months, theme, hourei, shikaku, kihon, kiroku, yomimono, info] = mods.map((m) => m.default);
  const ctx = { month: MONTH, themes: THEMES, allThemes: themesInOrder(), kaisei: nextKaisei() };
  const built = new Map(
    [home(ctx), ...gyoshu(ctx), ...months(ALL_THEMES, MONTH), kiroku(ALL_THEMES), ...ALL_THEMES.flatMap(theme), ...hourei(), ...shikaku(), ...kihon(), ...yomimono(), ...info()]
      .filter((p) => p.html && !p.file)
      .map((p) => [p.path, p.html]),
  );
  const DIST = new URL('../dist', import.meta.url).pathname;
  const fromDist = existsSync(`${DIST}/index.html`);
  const want = new Map();
  for (const y of YOMIMONO)
    for (const l of y.links.filter((x) => x.href.startsWith('/'))) want.set(l.href, [...(want.get(l.href) || []), y]);
  for (const ys of want.values()) ys.sort((a, b) => b.published.localeCompare(a.published));
  const sources = [['src', built]];
  if (fromDist) sources.push(['dist', new Map([...built.keys()].map((p) => [p, readFileSync(`${DIST}${p}index.html`, 'utf8')]))]);
  for (const [where, pages] of sources) {
    for (const [path, ys] of want) {
      const html = pages.get(path);
      assert.ok(html, `${where}: ${path} のページがない（読みもの ${ys[0].slug} の links）`);
      ys.forEach((y, i) => {
        const a = `<a href="${yomimonoPath(y)}">読みもの：`;
        if (i < 2) assert.ok(html.includes(a), `${where}: ${path} に ${y.slug} へ戻るリンクがない`);
        else assert.ok(!html.includes(a), `${where}: ${path} に読みものが3本以上`);
      });
    }
    for (const [path, html] of pages) if (!want.has(path)) assert.ok(!html.includes('">読みもの：'), `${where}: ${path} はつないでいないのに読みものへ戻るリンクがある`);
  }
  for (const p of ['/anzen/12/', '/anzen/1/', '/anzen/2/', '/anzen/theme/kanki/', '/kihon/setsubi/', '/anzen/theme/tentou/', '/anzen/theme/tentou/seisou/'])
    assert.ok(built.get(p)?.includes('">読みもの：'), `${p} に読みものへ戻るリンクがない`);
});

test('読みもの：RSS /yomimono/feed.xml（全部・新しい順・本番の URL・エスケープ。#106）', async () => {
  const { feedXml, FEED, default: yomimonoPages } = await import('../src/pages/yomimono.mjs');
  assert.equal(FEED, '/yomimono/feed.xml');
  const xml = feedXml();
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"'));
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  assert.equal(items.length, YOMIMONO.length, 'RSS の件数が YOMIMONO とちがう');
  items.forEach((it, i) => {
    const y = YOMIMONO[i];
    assert.ok(it.includes(`<link>https://anzen-benricho.com${yomimonoPath(y)}</link>`), `${y.slug} のリンク`);
    assert.ok(it.includes(`<description>${y.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</description>`), `${y.slug} の説明文が description のままでない`);
    assert.match(it, /<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} \+0000<\/pubDate>/);
  });
  for (const [, u] of xml.matchAll(/<(?:link|guid[^>]*)>([^<]*)</g)) assert.ok(u.startsWith('https://anzen-benricho.com/'), `本番でない URL ${u}`);
  assert.ok(!xml.includes('pages.dev'), 'pages.dev が入っている');
  // XML の特別な字：中身に & < > がそのまま入らない
  const evil = { ...YOMIMONO[0], title: 'A & B <c>', description: '1 > 0 & "x"' };
  const x2 = feedXml([evil]);
  assert.ok(x2.includes('<title>A &amp; B &lt;c&gt;</title>') && x2.includes('<description>1 &gt; 0 &amp; &quot;x&quot;</description>'));
  assert.ok(!/&(?!amp;|lt;|gt;|quot;)/.test(x2), 'エスケープしていない &');
  assert.equal(feedXml([]), '', '0本でも RSS ができる');
  // head で知らせる（目次・記事・トップ）と、目次の「RSS で読む」
  const link = '<link rel="alternate" type="application/rss+xml" title="安全衛生の便利帳の読みもの" href="/yomimono/feed.xml">';
  const pages = yomimonoPages();
  for (const p of pages) assert.ok(p.html.includes(link), `${p.path} の head に RSS がない`);
  assert.ok(pages[0].html.includes('<a href="/yomimono/feed.xml">RSS で読む</a>'), '目次に「RSS で読む」がない');
  const build = readFileSync(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(build, /feedXml\(\)/, 'build.mjs が RSS を書き出していない');
  assert.match(readFileSync(new URL('../src/pages/home.mjs', import.meta.url), 'utf8'), /feed: true/, 'トップの head に RSS がない');
});
