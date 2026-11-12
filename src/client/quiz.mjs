// 今月の1問の問題集（#88）：正解した問いを端末の中だけに覚える。保存は localStorage の anzen-quiz-v1（送らない）
// 中身は { <テーマの slug>: 1 }（正解した問いだけ）。ページでは export を外してスクリプトの前に入れる（tests/quiz.test.mjs が node で確かめる）
export var QUIZ_KEY = 'anzen-quiz-v1';
export function quizGot(store, slug) {
  var s = {};
  for (var k in store) s[k] = store[k];
  s[slug] = 1;
  return s;
}
export function quizCount(store, slugs) {
  return slugs.filter(function (s) { return !!store[s]; }).length;
}
// 月のスタンプ：その月の問いが全部正解で1つ（テーマが2つ以上ある月は全部）
export function quizStamp(store, slugs) {
  return slugs.length > 0 && quizCount(store, slugs) === slugs.length;
}
export function quizLoad() {
  try { var v = JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; }
}
export function quizSave(store) {
  try { localStorage.setItem(QUIZ_KEY, JSON.stringify(store)); } catch (e) {}
}
