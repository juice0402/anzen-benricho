// 毎月のテーマのデータの決まり（設計書の「毎月の3点セットの決まり」「正確さを保つ仕組み」）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_THEMES as THEMES, monthFor } from '../src/data/themes.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';

for (const t of THEMES) {
  test(`${t.title}：4業種そろっている`, () => {
    assert.deepEqual(t.gyoshu.map((g) => [g.key, g.label, g.name]), GYOSHU.map((g) => [g.key, g.label, g.name]));
    assert.ok(Number.isInteger(t.month) && t.month >= 1 && t.month <= 12, `${t.title} の月`);
    for (const g of t.gyoshu) assert.ok(g.memo, `${g.label} の多いけが`);
  });

  test(`${t.title}：掲示の決まりは3つ、やることは3つ`, () => {
    for (const g of t.gyoshu) {
      assert.equal(g.rules.length, 3, g.label);
      assert.equal(g.todo.length, 3, g.label);
      // 掲示の太字の1行は20字まで、小さな1行は22字まで（A4で読める大きさ）
      for (const [a, b] of g.rules) {
        assert.ok([...a].length <= 20, `${g.label} 太字が長い: ${a}`);
        assert.ok([...b].length <= 22, `${g.label} 小さな行が長い: ${b}`);
      }
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

test('今月：15日からは翌月。テーマがなければ2か月先まで、それもなければ今の月', () => {
  const ts = [{ month: 12 }, { month: 1 }];
  assert.equal(monthFor('2026-10-23', ts), 12);
  assert.equal(monthFor('2026-12-14', ts), 12);
  assert.equal(monthFor('2026-12-15', ts), 1);
  assert.equal(monthFor('2027-01-20', ts), 1);
  assert.equal(monthFor('2027-02-03', ts), 1);
  assert.equal(monthFor('2026-11-30', [{ month: 12 }]), 12);
});
