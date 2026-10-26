// 法改正と資格の更新のデータの決まり（データの必須項目：施行日・義務か努力義務か・対象・出典・確認日）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOUREI, HOUREI_CHECKED, CONDS, nextKaisei, inForce } from '../src/data/hourei.mjs';
import { SHIKAKU, SHIKAKU_CHECKED } from '../src/data/shikaku.mjs';

const within90 = (iso) => (Date.now() - Date.parse(iso + 'T00:00:00+09:00')) / 86400000 <= 90;

test('法改正：必須の項目がそろっている', () => {
  const slugs = new Set();
  const keys = CONDS.map((c) => c.key);
  let prev = '';
  for (const h of HOUREI) {
    assert.match(h.slug, /^[a-z0-9-]+$/);
    assert.ok(!slugs.has(h.slug), `同じ slug: ${h.slug}`);
    slugs.add(h.slug);
    assert.match(h.date, /^\d{4}-\d{2}-\d{2}$/, h.slug);
    assert.ok(h.date >= prev, `施行日の順になっていない: ${h.slug}`);
    prev = h.date;
    assert.ok(['義務', '努力義務'].includes(h.kind), `${h.slug} 義務か努力義務か`);
    assert.ok(h.cond === null || keys.includes(h.cond), `${h.slug} cond`);
    assert.ok(h.who && h.whoShort && h.title, h.slug);
    assert.ok(h.change.length >= 1 && h.change.length <= 3, `${h.slug} 何が変わるかは1〜3文`);
    assert.equal(h.todo.length, 3, `${h.slug} 職場ですることは3つ`);
    assert.ok(h.src.length >= 1, `${h.slug} 出典`);
    for (const s of h.src) assert.match(s.u, /^https:\/\//, s.t);
    // 罰則・届出の1行は、確かめたものだけ書く（ないときは行を出さない）。スマホで2行まで
    for (const k of ['bassoku', 'todokede']) if (h[k] !== undefined) assert.ok(typeof h[k] === 'string' && h[k].length > 0 && [...h[k]].length <= 40, `${h.slug} ${k}`);
  }
});

test('法改正：確認日から90日をこえていない', () => {
  assert.ok(within90(HOUREI_CHECKED), `確認日 ${HOUREI_CHECKED}。公式を開いて確かめ直し、HOUREI_CHECKED を直す`);
});

test('法改正：次の改正はまだ施行されていないもの', () => {
  const n = nextKaisei('2026-10-22');
  assert.equal(n.slug, 'kojin-houkoku');
  assert.ok(!inForce(n, '2026-10-22'));
  assert.ok(inForce(HOUREI.find((h) => h.slug === 'kasuhara'), '2026-10-01'));
});

test('資格の更新：年数と出典がある', () => {
  assert.ok(within90(SHIKAKU_CHECKED), `確認日 ${SHIKAKU_CHECKED}`);
  for (const s of SHIKAKU) {
    assert.ok(Number.isInteger(s.years) && s.years > 0, s.name);
    assert.ok(Number.isInteger(s.early) && s.early >= 0, s.name);
    assert.ok(s.src.length >= 1, s.name);
    for (const x of s.src) assert.match(x.u, /^https:\/\//, x.t);
  }
});
