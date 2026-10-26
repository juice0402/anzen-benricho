// 12月 年末の大掃除のポスターの絵（4業種）。黒い太い線と赤1色。人は描かない。線のゆれは座標に入れる
// 使い方：node art/poster/oosouji/art.mjs art/poster/oosouji（SVG を書き出す。PNG は Playwright で 1200×900 の透明な背景に）
import { writeFileSync, mkdirSync } from 'node:fs';
const K = '#1b1b1b', R = '#c8322b';
const line = (d, w = 9, c = K) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const shape = (d, fill = '#fff', w = 9, c = K) => `<path d="${d}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const floor = line('M18 266 C 110 261 250 268 382 263', 5);
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">${body}</svg>`;

const art = {
  // キャスター付きのいすに乗らない／踏み台を使う
  jimusho: svg([
    floor,
    shape('M84 147 C 79 108 80 76 92 54 C 112 43 141 42 162 52 C 172 76 173 108 167 147'),
    shape('M58 151 C 92 141 150 142 183 152 L 178 171 C 142 164 98 164 63 172 Z'),
    line('M121 172 L 122 214'),
    line('M68 226 C 100 219 144 219 175 225'),
    line('M122 214 L 122 226', 8),
    shape('M70 241 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0', '#fff', 6),
    shape('M122 243 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0', '#fff', 6),
    shape('M174 239 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0', '#fff', 6),
    line('M121 41 C 178 39 222 86 222 146 C 223 205 178 252 121 251 C 63 252 20 205 21 146 C 20 87 64 42 121 41 Z', 11, R),
    line('M50 73 L 192 219', 11, R),
    shape('M268 128 L 356 129 L 358 142 L 266 141 Z'),
    line('M274 142 L 257 255'),
    line('M350 142 L 368 255'),
    line('M263 197 L 362 198', 8),
  ].join('')),
  // 床の水をすぐ切る（水切りで排水口へ）
  inshoku: svg([
    floor,
    line('M120 64 L 200 236'),
    shape('M146 234 C 186 229 234 227 266 229 L 264 250 C 232 248 186 250 148 254 Z'),
    line('M142 259 C 188 255 232 254 270 256', 6),
    line('M276 250 C 284 245 292 253 300 248', 5),
    line('M280 259 C 286 256 292 261 300 258', 4),
    shape('M306 236 L 374 234 L 372 256 L 308 257 Z', '#fff', 7),
    line('M321 238 L 321 254 M334 237 L 335 254 M347 237 L 347 254 M360 236 L 359 254', 5),
    line('M214 190 C 250 170 290 178 318 214', 7, R),
    line('M298 210 L 320 217 L 316 194', 7, R),
  ].join('')),
  // 機械を止めてから掃除（止めるボタン・鍵・札）
  seizo: svg([
    floor,
    shape('M58 68 L 232 66 L 230 252 L 61 254 Z'),
    shape('M145 128 m -46 0 a 46 46 0 1 0 92 0 a 46 46 0 1 0 -92 0', '#fff', 8),
    shape('M145 128 m -32 0 a 32 32 0 1 0 64 0 a 32 32 0 1 0 -64 0', R, 6),
    shape('M88 196 L 130 195 L 131 228 L 89 229 Z', '#fff', 7),
    line('M109 211 L 109 188', 8),
    line('M176 203 C 175 180 205 179 205 203', 8),
    shape('M166 202 L 215 201 L 214 240 L 168 241 Z', '#fff', 7),
    line('M190 216 L 190 226', 6),
    line('M214 222 C 240 214 256 196 268 178', 4),
    shape('M262 128 L 330 118 L 344 206 L 276 215 Z', '#fff', 7),
    shape('M285 140 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0', '#fff', 4),
    line('M286 166 L 326 160 M290 184 L 330 178', 5),
  ].join('')),
  // 脚立の天板に乗らない／床が乾くまでコーン
  seisou: svg([
    floor,
    line('M112 255 L 168 66'),
    line('M232 255 L 178 66'),
    shape('M154 60 L 192 59 L 194 72 L 152 73 Z', '#fff', 8),
    line('M138 168 L 210 168', 5),
    line('M131 196 L 150 196 M140 158 L 155 158 M149 124 L 162 124', 8),
    line('M146 22 L 200 66 M200 22 L 146 66', 10, R),
    shape('M316 108 L 294 236 L 356 236 L 336 107 Z', '#fff', 8),
    shape('M307 160 L 344 159 L 349 188 L 303 189 Z', R, 6),
    shape('M280 236 L 372 235 L 372 252 L 281 253 Z', '#fff', 8),
    line('M250 276 C 262 270 274 282 288 276 C 300 271 312 281 324 276', 5),
  ].join('')),
};

const out = process.argv[2];
mkdirSync(out, { recursive: true });
for (const [k, s] of Object.entries(art)) writeFileSync(`${out}/${k}.svg`, s);
console.log(Object.keys(art).join(' '));
