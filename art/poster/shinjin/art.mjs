// 4月 新しく入った人の安全のポスターの絵（4業種）。人は描かない。使い方：node art/poster/shinjin/art.mjs → node art/poster/render.mjs art/poster/shinjin
import { line, shape, circ, floor, svg, head, maru, batsu, write, R } from '../lib.mjs';

// 洗剤のボトル（dx だけ右へ。kind 0 は決められた業務用、1 は家庭から持ってきた物）
const bottle = (dx, kind) => kind === 0
  ? shape(`M${dx + 30} 120 L ${dx + 62} 120 L ${dx + 62} 140 C ${dx + 82} 148 ${dx + 88} 162 ${dx + 88} 176 L ${dx + 86} 256 L ${dx + 6} 258 L ${dx + 4} 176 C ${dx + 4} 162 ${dx + 10} 148 ${dx + 30} 140 Z`) + shape(`M${dx + 34} 104 L ${dx + 58} 104 L ${dx + 58} 120 L ${dx + 34} 120 Z`, '#fff', 7) + shape(`M${dx + 18} 182 L ${dx + 74} 182 L ${dx + 74} 226 L ${dx + 18} 226 Z`, '#fff', 6) + line(`M${dx + 28} 196 L ${dx + 64} 196 M${dx + 28} 210 L ${dx + 56} 210`, 5)
  : shape(`M${dx + 30} 150 L ${dx + 54} 150 L ${dx + 56} 172 C ${dx + 74} 182 ${dx + 76} 200 ${dx + 74} 214 L ${dx + 70} 256 L ${dx + 14} 258 L ${dx + 10} 214 C ${dx + 8} 200 ${dx + 12} 182 ${dx + 28} 172 Z`) + shape(`M${dx + 32} 136 L ${dx + 52} 136 L ${dx + 54} 150 L ${dx + 30} 150 Z`, '#fff', 7) + line(`M${dx + 22} 210 C ${dx + 34} 202 ${dx + 50} 218 ${dx + 62} 208`, 5);

write(import.meta.url, {
  // 脚立は開き止めをかけてから乗る（脚立の開き止めに赤いまる）
  jimusho: svg([
    floor,
    line('M150 262 L 200 62'),
    line('M268 262 L 214 64'),
    shape('M192 54 L 226 53 L 228 66 L 190 67 Z', '#fff', 8),
    line('M162 214 L 190 214 M174 168 L 200 168 M186 120 L 210 120', 8),
    line('M168 196 L 252 196', 7),
    shape(circ(210, 196, 6), '#fff', 5),
    maru(210, 196, 70, 26, 9),
  ]),
  // 包丁は使い終わったら片づける（まな板の包丁から、赤い矢印で包丁立てへ）
  inshoku: svg([
    floor,
    shape('M30 236 L 210 234 L 212 258 L 32 260 Z', '#fff', 8),
    shape('M44 228 C 72 200 124 196 156 198 L 156 224 L 50 230 Z', '#fff', 7),
    line('M162 210 L 204 210', 18),
    shape('M262 150 L 338 148 L 344 260 L 256 262 Z'),
    line('M276 150 L 268 112 M296 149 L 294 110 M318 148 L 322 112', 9),
    line('M122 196 C 160 130 210 110 246 140', 8, R),
    head(248, 142, 40),
  ]),
  // 詰まりや掃除は機械を止めてから（コンベヤーと、赤い停止ボタン）
  seizo: svg([
    floor,
    shape('M40 172 L 250 170 L 250 196 L 40 198 Z', '#fff', 8),
    ...[64, 104, 144, 184, 226].map((x) => shape(circ(x, 184, 8), '#fff', 5)),
    line('M58 198 L 58 262 M232 196 L 232 262', 8),
    shape('M80 132 L 134 131 L 134 170 L 80 171 Z', '#fff', 7),
    shape('M150 140 L 196 139 L 196 170 L 150 170 Z', '#fff', 7),
    shape('M280 112 L 352 110 L 354 262 L 282 264 Z'),
    shape(circ(316, 150, 24), R, 7, R),
    line('M300 150 L 332 150', 6, '#fff'),
    shape('M296 196 L 336 195 L 336 222 L 296 223 Z', '#fff', 6),
  ]),
  // 洗剤は決められた物だけを使う（業務用のボトルに赤いまる、家から持ってきたボトルに赤いばつ）
  seisou: svg([
    floor,
    bottle(70, 0),
    maru(116, 182, 76, 96, 9),
    bottle(240, 1),
    batsu(282, 200, 50),
  ]),
});
