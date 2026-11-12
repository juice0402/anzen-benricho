// サイトの中の沼（C-027 案A「来月の準備へ」11/12）：読み終えたあと、戻らずに次へ進める道
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_THEMES } from '../src/data/themes.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';
import { YOMIMONO } from '../src/data/yomimono/index.mjs';
import { nextLinks } from '../src/pages/theme.mjs';
import { monthNeighbors } from '../src/pages/months.mjs';
import { otherReadings } from '../src/pages/yomimono.mjs';

const th = (slug) => ALL_THEMES.find((t) => t.slug === slug);
const seisou = GYOSHU.find((g) => g.key === 'seisou');

test('続けて準備する：来月のテーマを同じ業種で・この月の号', () => {
  const r = nextLinks(th('tentou'), seisou);
  assert.deepEqual(r.map((x) => x.href), ['/anzen/theme/youtsu/seisou/', '/anzen/1/']);
  assert.match(r[0].t, /^2月 腰痛予防（清掃・ビルメン）$/);
  // 11月 → 12月は4テーマ、12月 → 1月は2テーマ（年をまたぐ）
  assert.equal(nextLinks(th('kasai'), seisou).length, 4 + 1);
  assert.deepEqual(nextLinks(th('oosouji')).map((x) => x.href), ['/anzen/theme/tentou/', '/anzen/theme/issanka/', '/anzen/12/']);
});

test('続けて準備する：どのテーマ・業種でも、自分のページへのリンクはない', () => {
  for (const t of ALL_THEMES) for (const g of [null, ...GYOSHU]) {
    const self = g ? `/anzen/theme/${t.slug}/${g.key}/` : `/anzen/theme/${t.slug}/`;
    assert.ok(!nextLinks(t, g || undefined).some((x) => x.href === self), `${t.slug} ${g ? g.key : ''}`);
  }
});

test('ほかの号：前の号と次の号（年をまたぐ）', () => {
  assert.deepEqual(monthNeighbors(12, ALL_THEMES).map((x) => x.n), [11, 1]);
  assert.deepEqual(monthNeighbors(1, ALL_THEMES).map((x) => x.n), [12, 2]);
  assert.match(monthNeighbors(12, ALL_THEMES)[1].d, /^次の号：冬の転倒・暖房と一酸化炭素$/);
});

test('ほかの読みもの：自分以外を2本まで・同じものを2回出さない', () => {
  for (const y of YOMIMONO) {
    const o = otherReadings(y.slug);
    assert.ok(o.length >= 1 && o.length <= 2);
    assert.ok(!o.some((z) => z.slug === y.slug));
    assert.equal(new Set(o.map((z) => z.slug)).size, o.length);
  }
  assert.deepEqual(otherReadings('a', [{ slug: 'a' }, { slug: 'b' }]).map((z) => z.slug), ['b']);
});
