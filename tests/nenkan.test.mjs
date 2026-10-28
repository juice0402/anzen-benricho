// 年間計画の紙（/anzen/nenkan/）：全国の運動はいつも埋まり、業種をえらぶとテーマが埋まる（2026-10-28 夜 #30）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import kihonPages, { nenkanLaws, fiscalYear } from '../src/pages/kihon.mjs';
import theme from '../src/pages/theme.mjs';
import { YOTEI } from '../src/data/kihon/nenkan.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';
import { gyoshuPath } from '../src/parts.mjs';

const html = kihonPages().find((p) => p.path === '/anzen/nenkan/').html;
const bodies = [...html.matchAll(/<tbody data-pg="([a-z]*)"[^>]*>([\s\S]*?)<\/tbody>/g)].map((m) => ({ g: m[1], rows: [...m[2].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1])) }));
const text = (s) => s.replace(/<[^>]+>/g, '');
const pages = new Set(ALL_THEMES.flatMap(theme).map((p) => p.path));
const DIST = new URL('../dist', import.meta.url).pathname;

test('年間計画：空欄と4業種の5つの表', () => {
  assert.deepEqual(bodies.map((b) => b.g), ['', ...GYOSHU.map((g) => g.key)]);
  assert.match(html, /<tbody data-pg="">/, 'えらばないときの表は隠さない');
  for (const g of GYOSHU) assert.match(html, new RegExp(`<tbody data-pg="${g.key}" hidden>`), `${g.key} ははじめ隠す`);
});

test('年間計画：12行すべてで全国の運動が YOTEI と合う（ない月は空欄）', () => {
  for (const b of bodies) {
    assert.equal(b.rows.length, 12);
    for (const r of b.rows) {
      const m = parseInt(r[0], 10);
      assert.equal(text(r[1]), YOTEI[m] || '', `${b.g || '空欄'} ${m}月`);
    }
  }
});

test('年間計画：えらばないときは、全国の運動のほかは空欄', () => {
  for (const r of bodies[0].rows) for (const c of r.slice(2)) assert.equal(c, '');
});

test('年間計画：業種の表は、テーマのある月すべてにテーマ名とリンク（行き先のページがある）', () => {
  for (const b of bodies.slice(1)) {
    const g = GYOSHU.find((x) => x.key === b.g);
    for (const r of b.rows) {
      const m = parseInt(r[0], 10);
      const ts = ALL_THEMES.filter((t) => t.month === m);
      const links = [...r[2].matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
      assert.equal(links.length, ts.length, `${b.g} ${m}月`);
      ts.forEach((t, i) => {
        assert.equal(links[i][1], gyoshuPath(t, g));
        assert.equal(links[i][2], t.title);
        assert.ok(pages.has(links[i][1]), `ページがない ${links[i][1]}`);
        if (existsSync(DIST)) assert.ok(existsSync(`${DIST}${links[i][1]}index.html`), `dist にない ${links[i][1]}`);
      });
      if (ts.length) assert.ok(r[2].includes(ts[0].gyoshu.find((x) => x.key === g.key).rules[0][0]), `${b.g} ${m}月 決まりの1つ目`);
      for (const h of nenkanLaws(m)) assert.ok(r[2].includes(h.title), `${m}月 法改正 ${h.slug}`);
      for (const c of r.slice(3)) assert.equal(c, '', '担当・済は手書きの空欄');
    }
  }
});

test('年間計画：法改正はその年度（4月〜3月）の施行日だけ', () => {
  assert.equal(fiscalYear('2026-04-01'), 2026);
  assert.equal(fiscalYear('2027-03-31'), 2026);
  assert.deepEqual(nenkanLaws(4, 2026).map((h) => h.slug).sort(), ['koureisha', 'ryouritsu']);
  assert.deepEqual(nenkanLaws(1, 2026).map((h) => h.slug), ['kojin-houkoku']);
  assert.ok(nenkanLaws(4, 2026).every((h) => h.date.startsWith('2026-')));
});
