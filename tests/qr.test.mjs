// 印刷する紙のすみの QR：紙のある全ページに1つ、中身はそのページの正規の URL（10/28 しょーくん）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qrMatrix, qrSvg } from '../src/qr.mjs';
import { SITE } from '../src/site.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import theme, { sheet } from '../src/pages/theme.mjs';
import kihonPages from '../src/pages/kihon.mjs';

const PAPER = /<div class="(?:sheet|psheet)[" ]/;
const pages = [...ALL_THEMES.flatMap(theme), ...kihonPages()];

test('紙のあるページには QR が1つあり、中身はそのページの URL', () => {
  const withPaper = pages.filter((p) => PAPER.test(p.html));
  assert.ok(withPaper.length >= ALL_THEMES.length * 4, `紙のあるページが少ない: ${withPaper.length}`);
  for (const p of withPaper) {
    const qrs = [...p.html.matchAll(/<svg class="qr"[\s\S]*?<\/svg>/g)].map((m) => m[0]);
    assert.equal(qrs.length, 1, `${p.path} の QR の数`);
    const url = SITE.url + p.path;
    assert.ok(!/[?#]/.test(url) && url.endsWith('/'), `${p.path} は正規の URL ではない`);
    assert.equal(qrs[0], qrSvg(url), `${p.path} の QR の中身がページの URL ではない`);
  }
});

test('紙のないページと、トップの小さな紙には QR を入れない', () => {
  for (const p of pages.filter((x) => !PAPER.test(x.html))) assert.ok(!p.html.includes('class="qr"'), p.path);
  const t = ALL_THEMES[0];
  assert.ok(!sheet(t, t.gyoshu[0]).includes('class="qr"'));
});

test('QR の形：大きさ・3つの角の印・形式の情報（誤り訂正 M）', () => {
  for (const len of [10, 40, 62, 63, 120, 300]) {
    const m = qrMatrix('a'.repeat(len));
    const n = m.length;
    assert.equal((n - 17) % 4, 0);
    for (const [x, y] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      for (let i = 0; i < 7; i++) assert.ok(m[y][x + i] && m[y + 6][x + i] && m[y + i][x] && m[y + i][x + 6], `角の印 ${len}`);
      assert.ok(m[y + 3][x + 3] && !m[y + 1][x + 1]);
    }
    // 形式の情報（左上）を読み、誤り訂正が M（00）で、BCH の検査が合うか
    let b = 0;
    const at = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
    at.forEach(([x, y], i) => { if (m[y][x]) b |= 1 << i; });
    b ^= 0x5412;
    assert.equal(b >>> 13, 0, '誤り訂正が M ではない');
    let r = b >>> 10;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    assert.equal(r & 0x3ff, b & 0x3ff, '形式の情報の検査が合わない');
  }
});

test('QR のまわりの白い余白は4マス', () => {
  const url = `${SITE.url}/kihon/`;
  const n = qrMatrix(url).length;
  assert.ok(qrSvg(url).includes(`viewBox="0 0 ${n + 8} ${n + 8}"`));
});
