// 毎月のテーマのデータの決まり（設計書の「毎月の3点セットの決まり」「正確さを保つ仕組み」）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, MONTH } from '../src/data/themes.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';

for (const t of THEMES) {
  test(`${t.title}：4業種そろっている`, () => {
    assert.deepEqual(t.gyoshu.map((g) => [g.key, g.label, g.name]), GYOSHU.map((g) => [g.key, g.label, g.name]));
    assert.equal(t.month, MONTH);
    for (const g of t.gyoshu) assert.ok(g.memo, `${g.label} の多いけが`);
  });

  test(`${t.title}：掲示の決まりは3つ、やることは3つ`, () => {
    for (const g of t.gyoshu) {
      assert.equal(g.rules.length, 3, g.label);
      assert.equal(g.todo.length, 3, g.label);
    }
  });

  test(`${t.title}：朝礼は約300字まで（1分）`, () => {
    for (const g of t.gyoshu) assert.ok(g.talk.join('').length <= 300, `${g.label} ${g.talk.join('').length}字`);
  });

  test(`${t.title}：出典はすべて https、確認日がある`, () => {
    assert.match(t.checked, /^\d{4}-\d{2}-\d{2}$/);
    for (const s of [...t.common, ...t.gyoshu.flatMap((g) => g.src)]) {
      assert.match(s.u, /^https:\/\//, s.t);
      assert.ok(s.t.length > 0);
    }
  });

  test(`${t.title}：確認日から90日をこえていない`, () => {
    const days = (Date.now() - Date.parse(t.checked + 'T00:00:00+09:00')) / 86400000;
    assert.ok(days <= 90, `確認日 ${t.checked} から ${Math.floor(days)} 日。公式を開いて確かめ直し、checked を直す`);
  });
}
