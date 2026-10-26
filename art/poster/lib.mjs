// ポスターの絵の共通の部品。黒い太い線と赤1色。人は描かない。線のゆれは座標に入れる
// 各テーマの art.mjs がこれを使い、node art/poster/<テーマ>/art.mjs で SVG を書き出す（PNG は render.mjs）
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const K = '#1b1b1b', R = '#c8322b';
export const line = (d, w = 9, c = K, dash = '') =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
export const shape = (d, fill = '#fff', w = 9, c = K) =>
  `<path d="${d}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const fill = (d, c = K) => `<path d="${d}" fill="${c}"/>`;
// 円と楕円（車輪・つまみ・足あと）
export const circ = (cx, cy, r) => `M${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
export const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
export const floor = line('M18 266 C 110 261 250 268 382 263', 5);
export const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">${body.join('')}</svg>`;

// 禁止の印（手で描いたような赤い丸と斜線）
export const ban = (cx, cy, r, w = 11) => {
  const k = r * 0.56;
  const o = [cx + 1, cy - r, cx + r + 1, cy - 1, cx - 1, cy + r, cx - r, cy + 1];
  const ring = `M${o[0]} ${o[1]} C ${o[0] + k} ${o[1] - 1} ${o[2]} ${o[3] - k} ${o[2]} ${o[3]} C ${o[2] + 1} ${o[3] + k} ${o[4] + k} ${o[5]} ${o[4]} ${o[5]} C ${o[4] - k} ${o[5] + 1} ${o[6]} ${o[7] + k} ${o[6]} ${o[7]} C ${o[6] - 1} ${o[7] - k} ${o[0] - k} ${o[1] + 1} ${o[0]} ${o[1]} Z`;
  const s = r * 0.7;
  return line(ring, w, R) + line(`M${cx - s} ${cy - s + 2} L ${cx + s + 1} ${cy + s}`, w, R);
};
// 矢じり（先の位置と向き。角度は度、0 が右向き）
export const head = (x, y, deg, c = R, w = 7, len = 22) => {
  const a = (deg * Math.PI) / 180, sp = 0.5;
  const p = (t) => `${(x - len * Math.cos(a + t)).toFixed(1)} ${(y - len * Math.sin(a + t)).toFixed(1)}`;
  return line(`M${p(sp)} L ${x} ${y} L ${p(-sp)}`, w, c);
};
// まる（よい）とばつ（だめ）
export const maru = (cx, cy, rx, ry, w = 10) =>
  line(`M${cx + 4} ${cy - ry} C ${cx + rx * 0.6} ${cy - ry} ${cx + rx} ${cy - ry * 0.5} ${cx + rx} ${cy + 2} C ${cx + rx - 1} ${cy + ry * 0.6} ${cx + rx * 0.5} ${cy + ry} ${cx} ${cy + ry} C ${cx - rx * 0.55} ${cy + ry} ${cx - rx} ${cy + ry * 0.55} ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * 0.6} ${cx - rx * 0.5} ${cy - ry - 2} ${cx - 6} ${cy - ry + 3}`, w, R);
export const batsu = (cx, cy, s, w = 11) => line(`M${cx - s} ${cy - s} L ${cx + s} ${cy + s + 2} M${cx + s + 1} ${cy - s} L ${cx - s} ${cy + s}`, w, R);

// SVG を書き出す。out を省くと art.mjs と同じフォルダ
export const write = (metaUrl, art) => {
  const out = process.argv[2] || dirname(fileURLToPath(metaUrl));
  mkdirSync(out, { recursive: true });
  for (const [k, s] of Object.entries(art)) writeFileSync(`${out}/${k}.svg`, s);
  console.log(Object.keys(art).join(' '));
};
