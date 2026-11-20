// テーマの入口のよくある質問（#125）：0〜3つ・問いは「？」で終わる・答えは全角120字まで
// 同じ問いを、ほかのテーマや法改正のページ（#117）で使わない
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_THEMES } from '../src/data/themes.mjs';
import { HOUREI } from '../src/data/hourei.mjs';
import theme from '../src/pages/theme.mjs';

test('テーマ：よくある質問の形と、ほかのページとの重なり', () => {
  const qs = new Set();
  for (const h of HOUREI) for (const f of h.faq || []) qs.add(f.q);
  for (const t of ALL_THEMES) {
    if (t.faq === undefined) continue;
    assert.ok(Array.isArray(t.faq) && t.faq.length <= 3, `${t.slug} faq は0〜3つ`);
    for (const f of t.faq) {
      assert.ok(typeof f.q === 'string' && f.q.endsWith('？'), `${t.slug} 問いは「？」で終わる: ${f.q}`);
      assert.ok(typeof f.a === 'string' && f.a.length > 0 && [...f.a].length <= 120, `${t.slug} 答えは120字まで: ${f.q}`);
      assert.ok(!qs.has(f.q), `同じ問いがほかのページにもある: ${f.q}`);
      qs.add(f.q);
    }
  }
});

test('テーマ：よくある質問は入口だけ（出典の上・印刷に出さない）', () => {
  // データに faq がまだなくても形を見られるよう、見本の問いを1つ入れた写しで作る
  const t = { ...ALL_THEMES[0], faq: [{ q: '見本の問いですか？', a: '見本の答えです。' }] };
  const pages = [].concat(theme(t));
  const top = pages.find((p) => /\/anzen\/theme\/[^/]+\/$/.test(p.path));
  assert.ok(top, '入口のページ');
  const i = top.html.indexOf('id="tf-h"');
  assert.ok(i > 0 && i < top.html.indexOf('id="src-h"'), 'よくある質問は出典の上');
  assert.match(top.html, /<section class="sec paper np" aria-labelledby="tf-h">/);
  for (const p of pages) if (p !== top) assert.ok(!p.html.includes('id="tf-h"'), `${p.path} にはよくある質問を出さない`);
});
