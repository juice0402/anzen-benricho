// 知識のページの決まり（2026-10-23 の討論で決めたこと）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KIHON, BANDS } from '../src/data/kihon/index.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';

const G = GYOSHU.map((g) => g.key);
const N = BANDS.map((b) => b.key);
const len = (s) => [...s].length;
const within90 = (iso) => (Date.now() - Date.parse(iso + 'T00:00:00+09:00')) / 86400000 <= 90;
const rowsOf = (p) => [].concat(p.table || []).flatMap((t) => t.rows);
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
    for (const r of rowsOf(p)) okWhen(r.when, `表 ${r.k}`);
    if (p.sheet) {
      assert.ok(['keiji', 'form', 'grid', 'poster'].includes(p.sheet.kind));
      if (p.sheet.kind === 'poster') assert.ok(p.sheet.rules.length >= 3 && p.sheet.rules.length <= 4, '掲示の決まりは3〜4つ');
      if (p.sheet.kind === 'keiji') for (const r of p.sheet.roles) assert.ok(r.name && r.duties.length >= 1 && r.duties.length <= 6, r.name);
    }
    assert.ok(!p.faq || p.faq.length <= 6, 'よくある質問は6つまで');
  });

  test(`${p.slug}：出典（法令の答えは e-Gov を入れる）・確認日`, () => {
    assert.ok(p.src && p.src.length >= 1);
    for (const s of p.src) assert.match(s.u, /^https:\/\//, s.t);
    if (rowsOf(p).some((r) => r.law)) assert.ok(p.src.some((s) => s.u.includes('laws.e-gov.go.jp')), '条文を書くなら e-Gov を出典に');
    assert.ok(within90(p.checked), `確認日 ${p.checked} から90日をこえた`);
  });
}

// 義務の区別（2026-10-29 しょーくん）：kb は g 法令の義務・d 努力義務・s 職場で決めること。'-' は説明だけの行（付けない）
// 根拠（law）のある表の行と、やることの項目には、すべて区分を書く。決められなかったものだけ下の KB_OPEN に書き、PR と issue に一覧で出す
const KB_OPEN = new Set([]);
test('義務の区別：根拠のある表の行と、やることのすべてに区分がある', () => {
  let open = 0;
  for (const p of KIHON) {
    for (const r of rowsOf(p)) {
      if (r.kb !== undefined) assert.ok(['g', 'd', 's', '-'].includes(r.kb), `${p.slug} 表 ${r.k} の kb`);
      if (r.law) assert.ok(r.kb, `${p.slug} 表「${r.k}」（${r.law}）に区分がない`);
    }
    for (const c of p.check || []) {
      for (const it of c.items) {
        assert.ok(it && typeof it === 'object' && typeof it.t === 'string', `${p.slug} やることは { t, kb } の形`);
        if (KB_OPEN.has(`${p.slug}:${it.t}`)) { assert.ok(!it.kb, `${it.t} は決めたら KB_OPEN から外す`); open++; continue; }
        assert.ok(['g', 'd', 's'].includes(it.kb), `${p.slug}「${it.t}」に区分がない`);
      }
    }
  }
  assert.equal(open, KB_OPEN.size, 'KB_OPEN に、もうない項目がある');
});

// ヒヤリハット（#51）：記入例は4業種そろう・欄は用紙の欄の名前・紙の1行の字数に収まる。集計表の列と事故の型の21分類
test('ヒヤリハット：記入例が4業種そろい、集計表の列と事故の型がある', () => {
  const p = KIHON.find((x) => x.slug === 'hiyari');
  const s = p.sheet;
  const ks = s.rows.map((r) => r.k);
  const gs = s.examples.flatMap((e) => e.when.g);
  assert.deepEqual([...gs].sort(), [...G].sort(), '記入例は業種ごとに1つずつ');
  for (const e of s.examples) {
    assert.match(e.src, /^https:\/\/anzeninfo\.mhlw\.go\.jp\/hiyari\/hiy_\d{4}\.html$/, e.name);
    assert.ok(p.src.some((x) => x.u === e.src), `${e.name} の事例が出典にある`);
    for (const [k, v] of Object.entries({ ...e.v, ...(e.na || {}) })) {
      assert.ok(ks.includes(k), `${e.name}：用紙にない欄 ${k}`);
      const r = s.rows.find((x) => x.k === k);
      assert.ok(len(v) <= 19 * (r.lines || 1), `${e.name}：${k} が紙の欄に入らない`);
    }
    for (const k of ['日時', '報告した人', '受けた人・ひとこと', '対策をした日']) assert.ok(!e.v[k], `${e.name}：${k} は空ける`);
  }
  assert.deepEqual(s.tally.cols, ['日付', '場所', '何が起きそうだったか', '事故の型', '対策', '対策をした日']);
  assert.ok(s.tally.rows >= 8 && s.tally.rows <= 10, '集計表は8〜10行');
  assert.equal(s.tally.types.length, 21, '事故の型は21分類');
  assert.equal(new Set(s.tally.types).size, 21);
  assert.equal(s.tally.types[0], '墜落・転落');
  assert.equal(s.tally.types[20], '分類不能');
  assert.ok(p.keywords.includes('ヒヤリハット 記入例') && p.keywords.includes('ヒヤリハット 集計表'));
  // 集計と委員会への報告は職場で決めること（法令の義務のように書かない）
  const it = p.check.flatMap((c) => c.items).find((x) => x.t.includes('委員会'));
  assert.equal(it && it.kb, 's');
});
