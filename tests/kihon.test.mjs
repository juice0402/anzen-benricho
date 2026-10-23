// 知識のページの決まり（2026-10-23 の討論で決めたこと）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KIHON, BANDS } from '../src/data/kihon/index.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';

const G = GYOSHU.map((g) => g.key);
const N = BANDS.map((b) => b.key);
const len = (s) => [...s].length;
const within90 = (iso) => (Date.now() - Date.parse(iso + 'T00:00:00+09:00')) / 86400000 <= 90;
const okWhen = (w, where) => {
  if (!w) return;
  for (const g of w.g || []) assert.ok(G.includes(g), `${where} 業種 ${g}`);
  for (const n of w.n || []) assert.ok(N.includes(n), `${where} 人数 ${n}`);
};

test('知識のページ：URL がかぶらない', () => {
  const paths = KIHON.map((p) => p.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const p of KIHON) assert.match(p.path, /^\/[a-z0-9/-]+\/$/, p.slug);
});

for (const p of KIHON) {
  test(`${p.slug}：1つの問いと答え`, () => {
    assert.ok(p.h1 && len(p.h1) <= 30, `h1 は30字まで：${p.h1}`);
    assert.ok(p.answer && len(p.answer) <= 40, `答えは40字まで：${p.answer}`);
    assert.ok(p.title && len(p.title) <= 40, `title は40字まで：${p.title}`);
    assert.ok(p.description && len(p.description) >= 50 && len(p.description) <= 140, `description は50〜140字：${len(p.description || '')}`);
    assert.ok(Array.isArray(p.keywords) && p.keywords.length >= 3, 'ねらう検索候補が3つ以上');
  });

  test(`${p.slug}：表だけのページにしない（判定・道具・チェック・印刷のどれか）`, () => {
    const has = (p.pick && p.result && p.result.length) || p.tool || (p.check && p.check.length) || p.sheet;
    assert.ok(has);
    if (p.pick) assert.ok(p.result && p.result.length, 'えらばせるなら答えの一覧');
  });

  test(`${p.slug}：業種・人数の切りかえの書き方`, () => {
    for (const r of p.result || []) { okWhen(r.when, '答え'); assert.ok(r.text && len(r.text) <= 60, `答えの行は60字まで：${r.text}`); }
    for (const r of p.table?.rows || []) okWhen(r.when, `表 ${r.k}`);
    if (p.sheet) {
      assert.ok(['keiji', 'form', 'grid'].includes(p.sheet.kind));
      if (p.sheet.kind === 'keiji') for (const r of p.sheet.roles) assert.ok(r.name && r.duties.length >= 1 && r.duties.length <= 6, r.name);
    }
    assert.ok(!p.faq || p.faq.length <= 6, 'よくある質問は6つまで');
  });

  test(`${p.slug}：出典（法令の答えは e-Gov を入れる）・確認日`, () => {
    assert.ok(p.src && p.src.length >= 1);
    for (const s of p.src) assert.match(s.u, /^https:\/\//, s.t);
    if ((p.table?.rows || []).some((r) => r.law)) assert.ok(p.src.some((s) => s.u.includes('laws.e-gov.go.jp')), '条文を書くなら e-Gov を出典に');
    assert.ok(within90(p.checked), `確認日 ${p.checked} から90日をこえた`);
  });
}
