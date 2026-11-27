// 今月の1問の問題集（#88）：全テーマの1問が出る・保存のキー・送らない・月の丸は全部正解で1つ
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QUIZ_KEY, quizGot, quizCount, quizStamp } from '../src/client/quiz.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import monthPages from '../src/pages/months.mjs';
import { esc } from '../src/layout.mjs';

const pages = monthPages(ALL_THEMES, 11);
const qp = pages.find((p) => p.path === '/anzen/quiz/');

test('問題集のページに全テーマの1問が、4月から3月の順に出る', () => {
  assert.ok(qp, '/anzen/quiz/ がない');
  const slugs = [...qp.html.matchAll(/class="qz" data-a="\d" data-s="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...slugs].sort(), ALL_THEMES.filter((t) => t.quiz).map((t) => t.slug).sort());
  const order = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const rank = (s) => order.indexOf(ALL_THEMES.find((t) => t.slug === s).month);
  assert.deepEqual(slugs.map(rank), [...slugs.map(rank)].sort((a, b) => a - b));
  for (const t of ALL_THEMES) assert.ok(qp.html.includes(esc(t.quiz.q)) && qp.html.includes(esc(t.quiz.why)), `${t.slug} の問いと解説`);
  assert.ok(qp.html.includes(`${slugs.length}問中`), '上に「◯問中◯問正解」');
  const ms = [...qp.html.matchAll(/<div data-m="(\d+)" data-ss="/g)].map((m) => Number(m[1]));
  assert.deepEqual(ms, order, '12か月のスタンプ');
  assert.ok(!qp.html.includes('<aside class="ad"'), '広告の枠は置かない');
});

test('月のページと月の一覧から問題集へのリンク', () => {
  for (const p of pages.filter((x) => /^\/anzen\/(\d+\/)?$/.test(x.path))) assert.ok(p.html.includes('href="/anzen/quiz/"'), `${p.path} にリンクがない`);
});

test('保存のキーは anzen-quiz-v1。正解だけ覚え、月の丸はその月の問いが全部正解で1つ', () => {
  assert.equal(QUIZ_KEY, 'anzen-quiz-v1');
  let s = quizGot({}, 'oosouji');
  assert.deepEqual(s, { oosouji: 1 });
  const dec = ALL_THEMES.filter((t) => t.month === 12).map((t) => t.slug);
  assert.ok(dec.length >= 2);
  assert.equal(quizStamp(s, dec), false, '1つだけでは丸にならない');
  for (const d of dec) s = quizGot(s, d);
  assert.equal(quizStamp(s, dec), true);
  assert.equal(quizCount(s, [...dec, 'tentou']), dec.length);
  assert.equal(quizStamp({}, []), false);
});

test('問題集のスクリプトは送らない（通信の関数を使わない）', () => {
  for (const f of ['quiz.mjs', 'quiz-shu.js', 'quiz.js']) {
    const src = readFileSync(new URL(`../src/client/${f}`, import.meta.url), 'utf8');
    assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.|document\.cookie/.test(src), `${f} が通信している`);
  }
  assert.ok(!/<script[^>]+src=/.test(qp.html.replace(/<script async src="https:\/\/pagead2[^>]+>/g, '')), '外のスクリプトを読まない');
});

// #136：1年の実施記録の紙に「1問」の欄。quiz のある月の行に data-q（その月の quiz のあるテーマの slug）、ない月は data-q なし
test('1年の実施記録の表に「1問」の列。各月の行の data-q はその月の quiz のあるテーマ', async () => {
  const { default: kirokuPage } = await import('../src/pages/kiroku.mjs');
  const html = kirokuPage(ALL_THEMES).html;
  const tbl = html.match(/<table class="pg-t kr-t"[\s\S]*?<\/table>/)?.[0] ?? '';
  assert.ok(tbl.includes('<th>やること</th><th>1問</th><th>確認</th>'), '「やること」と「確認」のあいだに「1問」');
  const rows = [...tbl.matchAll(/<tr data-m="(\d+)"( data-q="([^"]*)")?>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, 12);
  let withQ = 0;
  for (const [, m, , q, inner] of rows) {
    const want = ALL_THEMES.filter((t) => t.month === Number(m) && t.quiz).map((t) => t.slug);
    if (want.length) { withQ++; assert.deepEqual((q || '').split(','), want, `${m}月の data-q`); }
    else assert.ok(!q, `${m}月は quiz がないので data-q は空か無い`);
    assert.equal((inner.match(/<td/g) || []).length, 6, `${m}月の欄の数`);
  }
  assert.ok(withQ > 0);
  assert.ok(html.includes('function quizStamp('), 'quiz.mjs を export を外して入れる');
  assert.ok(!/export /.test(html.match(/<script>[\s\S]*?<\/script>/g)?.join('') ?? ''), 'export が残っていない');
  assert.ok(html.includes('1問は問題集で正解した月に○'), '紙の下の注記');
});
