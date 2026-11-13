// このテーマを深く（#100・C-027 案B）：あわせて見るのリンクと理由の1行
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_THEMES } from '../src/data/themes.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';
import { KIHON } from '../src/data/kihon/index.mjs';
import { HOUREI, houreiPath } from '../src/data/hourei.mjs';
import { KOUSHIN_PAGES, koushinPath } from '../src/data/shikaku.mjs';
import { THEME_KANREN, KOUSHIN_KANREN, MAX_KANREN } from '../src/data/kanren.mjs';
import { relLinks } from '../src/pages/theme.mjs';
import { koushinRel } from '../src/pages/shikaku.mjs';

// ビルドで作るページ（kanren.mjs が指す先の種類だけ）
const PAGES = new Set([
  ...ALL_THEMES.flatMap((t) => [`/anzen/theme/${t.slug}/`, ...GYOSHU.map((g) => `/anzen/theme/${t.slug}/${g.key}/`)]),
  ...KIHON.map((k) => k.path),
  ...HOUREI.map(houreiPath),
  ...KOUSHIN_PAGES.map((p) => koushinPath(p.page)),
  '/kagaku/', '/shikaku/koushin/',
]);
const LISTS = [...Object.entries(THEME_KANREN), ...Object.entries(KOUSHIN_KANREN)];
const ok30 = (d) => typeof d === 'string' && d.length > 0 && [...d].length <= 30;

test('kanren.mjs：どの href もビルドで作るページ・どの行にも d（30字まで）', () => {
  assert.ok(Object.keys(THEME_KANREN).every((s) => ALL_THEMES.some((t) => t.slug === s)));
  assert.ok(Object.keys(KOUSHIN_KANREN).every((k) => KOUSHIN_PAGES.some((p) => p.page === k)));
  for (const [key, list] of LISTS) {
    assert.ok(list.length <= MAX_KANREN, key);
    for (const r of list) {
      assert.ok(PAGES.has(r.href), `${key}：${r.href} のページがない`);
      assert.ok(r.t, `${key}：${r.href} の t がない`);
      assert.ok(ok30(r.d), `${key}：${r.href} の d「${r.d}」`);
      assert.ok(!/おすすめ|便利|簡単|安心|ぜひ|しましょう/.test(r.d), `${key}：${r.d}`);
    }
  }
});

test('同じテーマのほかの月の組は両方向', () => {
  for (const [slug, list] of Object.entries(THEME_KANREN)) {
    for (const r of list) {
      const m = r.href.match(/^\/anzen\/theme\/([^/]+)\/$/);
      if (!m) continue;
      assert.ok((THEME_KANREN[m[1]] || []).some((x) => x.href === `/anzen/theme/${slug}/`), `${slug} → ${m[1]} の戻りがない`);
    }
  }
});

test('テーマの入口と業種のページ：5本まで・自分へのリンクなし・同じ先は1回・どの行にも d', () => {
  for (const t of ALL_THEMES) for (const g of [undefined, ...GYOSHU]) {
    const self = g ? `/anzen/theme/${t.slug}/${g.key}/` : `/anzen/theme/${t.slug}/`;
    const rows = relLinks(t, g);
    const at = `${t.slug} ${g ? g.key : ''}`;
    assert.ok(rows.length <= MAX_KANREN, at);
    assert.ok(!rows.some((r) => r.href.startsWith(`/anzen/theme/${t.slug}/`)), `${at}：自分のテーマへのリンク`);
    assert.equal(new Set(rows.map((r) => r.href)).size, rows.length, at);
    for (const r of rows) {
      assert.ok(ok30(r.d), `${at}：${r.href} の d「${r.d}」`);
      // 業種のページのテーマへのリンクは同じ業種のページ（related の入口へのリンクも読みかえる）
      if (g && r.href.startsWith('/anzen/theme/')) assert.ok(r.href.endsWith(`/${g.key}/`), `${at}：${r.href}`);
    }
    assert.notEqual(self, '');
  }
  // 組と道具が先に並ぶ（読みものがなければ1本め）
  const ten = relLinks(ALL_THEMES.find((t) => t.slug === 'tentou'), GYOSHU.find((g) => g.key === 'jimusho')).map((r) => r.href);
  assert.ok(ten.includes('/anzen/theme/kourei/jimusho/') && ten.includes('/kihon/hiyari/'));
});

test('資格のページ：5本まで・自分へのリンクなし・どの行にも d', () => {
  for (const p of KOUSHIN_PAGES) {
    const rows = koushinRel(p);
    assert.ok(rows.length >= 1 && rows.length <= MAX_KANREN, p.page);
    assert.ok(!rows.some((r) => r.href === koushinPath(p.page)), p.page);
    for (const r of rows) assert.ok(ok30(r.d), `${p.page}：${r.href} の d「${r.d}」`);
  }
  assert.ok(koushinRel(KOUSHIN_PAGES.find((p) => p.page === 'bouka')).some((r) => r.href === '/anzen/theme/kasai/'));
});
