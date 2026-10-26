// 3月 心の健康のポスターの絵（4業種）。人は描かない。使い方：node art/poster/kokoro/art.mjs → node art/poster/render.mjs art/poster/kokoro
import { line, shape, circ, floor, svg, write, R } from '../lib.mjs';

// 三日月（右がかけた形）
const moon = (cx, cy, r, c = '#1b1b1b', fill = '#fff') => shape(`M${cx + r * 0.2} ${cy - r} C ${cx - r * 1.3} ${cy - r * 0.9} ${cx - r * 1.3} ${cy + r * 0.9} ${cx + r * 0.2} ${cy + r} C ${cx - r * 0.5} ${cy + r * 0.5} ${cx - r * 0.5} ${cy - r * 0.5} ${cx + r * 0.2} ${cy - r} Z`, fill, 7, c);
// 吹き出し（しっぽは左下）
const bubble = (x, y, w, h, c = '#1b1b1b', sw = 8) => line(`M${x + 14} ${y} L ${x + w - 14} ${y + 1} C ${x + w - 2} ${y + 1} ${x + w} ${y + 8} ${x + w} ${y + 18} L ${x + w - 1} ${y + h - 16} C ${x + w - 1} ${y + h - 4} ${x + w - 8} ${y + h} ${x + w - 18} ${y + h} L ${x + 42} ${y + h} L ${x + 18} ${y + h + 22} L ${x + 24} ${y + h} L ${x + 16} ${y + h} C ${x + 4} ${y + h} ${x} ${y + h - 6} ${x} ${y + h - 18} L ${x + 1} ${y + 16} C ${x + 1} ${y + 5} ${x + 6} ${y} ${x + 14} ${y} Z`, sw, c);
const dots = (x, y, c = R) => [0, 1, 2].map((i) => shape(circ(x + i * 26, y, 5), c, 2, c)).join('');
// 湯のみ
const cup = (x) => shape(`M${x} 210 L ${x + 52} 210 L ${x + 46} 258 L ${x + 6} 258 Z`, '#fff', 8) + line(`M${x + 14} 196 C ${x + 8} 186 ${x + 20} 180 ${x + 14} 170 M${x + 36} 196 C ${x + 30} 186 ${x + 42} 180 ${x + 36} 170`, 5);
// 携帯電話
const phone = (x, y) => shape(`M${x + 12} ${y} L ${x + 74} ${y} C ${x + 82} ${y} ${x + 86} ${y + 4} ${x + 86} ${y + 12} L ${x + 86} ${y + 136} C ${x + 86} ${y + 144} ${x + 82} ${y + 148} ${x + 74} ${y + 148} L ${x + 12} ${y + 148} C ${x + 4} ${y + 148} ${x} ${y + 144} ${x} ${y + 136} L ${x} ${y + 12} C ${x} ${y + 4} ${x + 4} ${y} ${x + 12} ${y} Z`, '#fff', 8) + line(`M${x + 12} ${y + 22} L ${x + 74} ${y + 22} M${x + 12} ${y + 124} L ${x + 74} ${y + 124}`, 5);
// 受話器のしるし
const handset = (cx, cy, c = R) => shape(`M${cx - 22} ${cy - 18} C ${cx - 30} ${cy - 6} ${cx - 16} ${cy + 18} ${cx + 4} ${cy + 26} C ${cx + 14} ${cy + 30} ${cx + 24} ${cy + 22} ${cx + 22} ${cy + 14} L ${cx + 12} ${cy + 6} L ${cx + 4} ${cy + 12} C ${cx - 6} ${cy + 8} ${cx - 12} ${cy} ${cx - 14} ${cy - 8} L ${cx - 6} ${cy - 14} L ${cx - 12} ${cy - 26} C ${cx - 16} ${cy - 28} ${cx - 20} ${cy - 24} ${cx - 22} ${cy - 18} Z`, c, 4, c);

write(import.meta.url, {
  // 眠れない日が続いたら相談する（夜の目覚まし時計と、赤い吹き出し）
  jimusho: svg([
    floor,
    moon(92, 70, 30),
    shape(circ(120, 190, 56)),
    line('M120 190 L 120 158 M120 190 L 142 200', 8),
    line('M76 140 L 92 154 M164 140 L 148 154', 8),
    line('M86 246 L 78 262 M154 246 L 162 262', 8),
    bubble(214, 104, 150, 92, R),
    dots(262, 150),
  ]),
  // きつい苦情を一人でかかえない、あとで話す（湯のみ2つと、吹き出し2つ）
  inshoku: svg([
    floor,
    line('M60 262 L 340 260', 9),
    cup(110), cup(236),
    bubble(56, 52, 128, 78),
    bubble(214, 70, 128, 78, R),
    line('M86 92 L 152 92', 6),
    dots(244, 110),
  ]),
  // 眠れない日が続いたら相談、交替勤務でも眠る時間をけずらない（ベッドと赤い月）
  seizo: svg([
    floor,
    line('M70 262 L 70 150 M330 262 L 330 196', 9),
    shape('M70 210 L 330 208 L 330 236 L 70 238 Z'),
    shape('M84 184 C 84 170 140 168 144 182 L 144 208 L 84 209 Z', '#fff', 8),
    line('M150 196 C 210 190 280 192 330 198', 7),
    moon(250, 92, 40, R, R),
    line('M160 70 L 160 86 M152 78 L 168 78 M326 112 L 326 128 M318 120 L 334 120', 5),
  ]),
  // 相談先の番号を持ち歩く（携帯電話の画面に赤い受話器のしるし）
  seisou: svg([
    floor,
    phone(118, 92),
    handset(161, 166),
    shape('M236 186 L 336 182 L 338 248 L 238 252 Z', '#fff', 7),
    line('M252 206 L 318 204 M252 226 L 302 225', 5),
  ]),
});
