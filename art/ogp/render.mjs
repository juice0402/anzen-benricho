// 共有されたときの画像（OGP・1200×630）の下地を3案つくる。文字は Canva で入れる（連絡 C-004）
// 決まったのは案c（10/27 しょーくん）。Canva の DAHZLrgYG6E の3ページ目を JPG で書き出し、public/img/og.jpg に取りこんだ（1ページ目が案a、2ページ目が案b）
// 案a 月めくりの1枚（ポスターの案Bと同じ帯）／案b 掲示板に貼った1枚／案c 掲示板にポスター4枚
// 使い方：node art/ogp/render.mjs → art/ogp/bg-a.png・bg-b.png・bg-c.png（c はポスターの PDF を pdftoppm で絵にする）
import { readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { K, R, line, shape, maru } from '../poster/lib.mjs';

const W = 1200, H = 630;
const BOARD = '#3f6454', EDGE = '#2c4a3d', FRAME = '#cdd3d8', FRAME2 = '#a9b1b8', BAND = '#2f5d46', HOLE = '#c9c9c9', RED = '#cf3b2e';
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>`;

// アルミの枠と緑のフェルト
const board = () => `<rect width="${W}" height="${H}" fill="${FRAME2}"/><rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="${FRAME}"/>
<rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="${FRAME2}"/><rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="${BOARD}"/>`;
// マグネットでとめた紙（下にうすい影）
const paper = (x, y, w, h, m = RED) => `<rect x="${x}" y="${y + 4}" width="${w}" height="${h}" fill="${EDGE}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>` + magnet(x + w / 2, y + 2, m);
const magnet = (cx, cy, c) => `<circle cx="${cx}" cy="${cy + 3}" r="15" fill="#000" opacity=".25"/><circle cx="${cx}" cy="${cy}" r="15" fill="${c}"/>`;

// 案a の絵：掲示板そのもの（黒い太い線と赤1色。紙はまっすぐ、マグネットは高さをずらして顔に見えないように）
const boardArt = () => {
  const body = [
    shape('M42 46 C 150 43 260 47 358 44 L 361 252 C 250 255 140 251 40 254 Z', '#fff', 10),
    line('M58 62 C 160 60 250 63 343 61 L 345 237 C 250 239 150 236 56 238 Z', 5),
    shape('M84 92 L 186 90 L 188 222 L 85 224 Z', '#fff', 7),
    line('M102 128 L 168 127 M102 152 L 170 151 M102 176 L 150 176', 6),
    shape('M218 112 L 322 111 L 323 214 L 219 215 Z', '#fff', 7),
    line('M236 146 L 304 145 M236 170 L 306 170 M236 194 L 286 193', 6),
    `<circle cx="136" cy="91" r="13" fill="${R}"/>`,
    maru(271, 170, 50, 19, 7),
  ];
  return `<g transform="translate(70 215) scale(1.02)">${body.join('')}</g>`;
};

const a = svg(`<rect width="${W}" height="${H}" fill="#fff"/><rect y="40" width="${W}" height="170" fill="${BAND}"/>
<circle cx="420" cy="20" r="11" fill="${HOLE}"/><circle cx="780" cy="20" r="11" fill="${HOLE}"/>
<path d="M500 420 H1130" stroke="#d6d6d6" stroke-width="2"/>${boardArt()}`);

const b = svg(board() + paper(150, 105, 900, 420));

// 案c：月も業種もちがうポスター4枚
const posters = ['2026-11/kasai-inshoku', '2026-12/oosouji-seisou', '2027-02/youtsu-jimusho', '2027-07/necchu-taiou-seizo'];
const tmp = mkdtempSync(join(tmpdir(), 'ogp-'));
const ph = 340, pw = Math.round(ph * 210 / 297), gap = 36, x0 = (W - (pw * 4 + gap * 3)) / 2, py = 238;
const imgs = posters.map((p, i) => {
  const out = join(tmp, `p${i}`);
  execFileSync('pdftoppm', ['-png', '-r', '110', '-singlefile', '-f', '1', `public/poster/${p}.pdf`, out]);
  const data = readFileSync(`${out}.png`).toString('base64');
  const x = x0 + i * (pw + gap);
  return `<rect x="${x}" y="${py + 4}" width="${pw}" height="${ph}" fill="${EDGE}"/><image x="${x}" y="${py}" width="${pw}" height="${ph}" preserveAspectRatio="none" xlink:href="data:image/png;base64,${data}"/>` + magnet(x + pw / 2, py + 2, i % 2 ? '#e5b21d' : RED);
}).join('');
const c = svg(board() + paper(170, 62, 860, 136) + imgs);

const pwmod = await import(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright/index.mjs');
const browser = await pwmod.chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, s] of Object.entries({ a, b, c })) {
  await page.setContent(`<html><body style="margin:0">${s}</body></html>`);
  await page.screenshot({ path: `art/ogp/bg-${k}.png`, clip: { x: 0, y: 0, width: W, height: H } });
}
await browser.close();
console.log('bg-a bg-b bg-c');
