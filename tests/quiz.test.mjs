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
