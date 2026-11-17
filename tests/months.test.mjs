// 月ごとのテーマの一覧 /anzen/ の「12か月の委員会で話すこと」（#120）
// ページは作るところ（src/pages/months.mjs）から組み立て、ビルドしたあと（dist がある）は dist の HTML でも同じことを確かめる
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { ALL_THEMES, MONTH } from '../src/data/themes.mjs';
import { SITE } from '../src/site.mjs';
import monthPages from '../src/pages/months.mjs';

const DIST = new URL('../dist', import.meta.url).pathname;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const indexHtml = () => monthPages(ALL_THEMES, MONTH).find((p) => p.path === '/anzen/').html;
const sources = () => {
  const s = [['src', indexHtml()]];
  if (existsSync(`${DIST}/anzen/index.html`)) s.push(['dist', readFileSync(`${DIST}/anzen/index.html`, 'utf8')]);
  return s;
};
const section = (html) => {
  const a = html.indexOf('id="ag-h"');
  assert.ok(a > 0, '12か月の委員会で話すこと の節がない');
  const start = html.lastIndexOf('<section', a);
  return [start, html.slice(start, html.indexOf('</section>', a))];
};

test('/anzen/：gidai のある全テーマの議題と議事録の紙へのリンクがある', () => {
  const gs = ALL_THEMES.filter((t) => t.gidai);
  assert.ok(gs.length > 0);
  for (const [name, html] of sources()) {
    const [, sec] = section(html);
    for (const t of gs) {
      for (const g of t.gidai) assert.ok(sec.includes(`<li>${esc(g)}</li>`), `${name} ${t.slug} の議題がない：${g}`);
      assert.ok(sec.includes(`href="/kihon/gijiroku/?t=${t.slug}"`), `${name} ${t.slug} の議事録の紙へのリンクがない`);
    }
    // gidai のないテーマの議事録のリンクは出さない
    for (const t of ALL_THEMES.filter((x) => !x.gidai)) assert.ok(!sec.includes(`?t=${t.slug}"`), `${name} ${t.slug}`);
    // 月の名前は月のページの議題の節へ。説明の1行は節の頭に1回だけ
    for (const m of new Set(gs.map((t) => t.month))) assert.ok(sec.includes(`<a href="/anzen/${m}/#gd-h">${m}月</a>`), `${name} ${m}月`);
    assert.equal(sec.split('委員会のない職場は').length - 1, 1, name);
    assert.equal(sec.split('class="pg-lead"').length - 1, 1, name);
  }
});

test('/anzen/：月の順は一覧の「月」と同じ・テーマの名前はテーマが2つ以上の月だけ', () => {
  const [, sec] = section(indexHtml());
  const order = [...sec.matchAll(/href="\/anzen\/(\d+)\/#gd-h"/g)].map((x) => Number(x[1]));
  const ms = [...new Set(ALL_THEMES.map((t) => t.month))].sort((a, b) => ((a - MONTH + 12) % 12) - ((b - MONTH + 12) % 12));
  assert.deepEqual(order, ms.filter((m) => ALL_THEMES.some((t) => t.month === m && t.gidai)));
  for (const m of order) {
    const gs = ALL_THEMES.filter((t) => t.month === m && t.gidai);
    for (const t of gs) assert.equal(sec.includes(`<h4 class="gd-t">${esc(t.title)}</h4>`), gs.length > 1, `${m}月 ${t.slug}`);
  }
});

test('/anzen/：節は広告の枠より上（広告の番号が入ったときも）', () => {
  const keep = SITE.adSlots.end;
  SITE.adSlots.end = keep || '1234567890';
  try {
    const html = indexHtml();
    const [start] = section(html);
    const ad = html.indexOf('class="ad"');
    if (SITE.adsense) assert.ok(ad > start, '広告の枠が節より上にある');
  } finally {
    SITE.adSlots.end = keep;
  }
});
