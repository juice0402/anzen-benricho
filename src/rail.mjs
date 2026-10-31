// パソコン（1100px 以上）の右の柱（10/31 連絡 C-017・しょーくんが案A「右に柱」に決めた）
// 上から「このページの中」（本文の h2.sec-h が2つ以上のとき）→「◯月のテーマ」→「これからの予定」。
// 広告・A8 のリンクは置かない。スマホと 1099px までは CSS で隠す。印刷にも出さない
import { esc } from './layout.mjs';
import { themePath, photo } from './parts.mjs';
import { MONTH, THEMES } from './data/themes.mjs';
import { YOTEI } from './data/kihon/nenkan.mjs';

// 見出しの中にタグがあっても、字だけ取り出す
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();

export function rail(body) {
  const hs = [...body.matchAll(/<h2 class="sec-h" id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map(([, id, h]) => [id, text(h)]).filter(([, t]) => t);
  const toc = hs.length > 1
    ? `<nav class="r-box" aria-label="このページの中（右）"><p class="r-h">このページの中</p><ol class="r-toc">${hs.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol></nav>`
    : '';
  const th = THEMES.length
    ? `<section class="r-box" aria-label="${MONTH}月のテーマ"><p class="r-h">${MONTH}月のテーマ</p><ul class="r-th">${THEMES.map((t) => `<li><a href="${themePath(t)}">${photo(t.slug, { sizes: '96px', cls: 'ph-s' })}<b>${esc(t.title)}</b></a></li>`).join('')}</ul></section>`
    : '';
  const next = [1, 2, 3].map((d) => ((MONTH - 1 + d) % 12) + 1).filter((m) => YOTEI[m]);
  const yo = next.length
    ? `<section class="r-box" aria-label="これからの予定"><p class="r-h">これからの予定</p><ul class="r-yo">${next.map((m) => `<li><a href="/anzen/${m}/">${m}月</a><span>${esc(YOTEI[m])}</span></li>`).join('')}</ul></section>`
    : '';
  return `<aside class="rail">${toc}${th}${yo}</aside>`;
}
