// 法人パックへの1行（11/11 案A）：本番の支払いリンクがあって、売っている号の月のときだけ出る
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PACK } from '../src/data/pack.mjs';
import { packLineMonth, packLineReading, PACK_READINGS } from '../src/pack-line.mjs';

const withLink = (link, fn) => {
  const before = PACK.link;
  PACK.link = link;
  try { fn(); } finally { PACK.link = before; }
};

test('法人パックの1行：支払いリンクがないあいだは出ない（testLink だけでも出ない）', () => {
  withLink(null, () => {
    assert.equal(packLineMonth(12, '2026-11-20'), '');
    assert.equal(packLineReading('fuyu-neta', '2026-11-20'), '');
  });
});

test('法人パックの1行：月のページは売っている号の月だけ', () => {
  withLink('https://buy.stripe.com/x', () => {
    const h = packLineMonth(12, '2026-11-20');
    assert.match(h, /href="\/pack\/"/);
    assert.match(h, /法人パック 12月号（500円）/);
    assert.equal(packLineMonth(1, '2026-11-20'), '');
    assert.equal(packLineMonth(11, '2026-11-10'), '', '11月号は売らない（最初の号は12月）');
    assert.match(packLineMonth(12, '2026-11-10'), /12月号/, '最初の号より前は最初の号を売る');
  });
});

test('法人パックの1行：読みものは PACK_READINGS の月のあいだだけ', () => {
  withLink('https://buy.stripe.com/x', () => {
    assert.deepEqual(PACK_READINGS['fuyu-neta'], [12, 1, 2]);
    assert.match(packLineReading('fuyu-neta', '2026-12-20'), /法人パック 1月号/);
    assert.equal(packLineReading('fuyu-neta', '2027-03-20'), '');
    assert.equal(packLineReading('kashitsuki', '2026-12-20'), '');
  });
});
