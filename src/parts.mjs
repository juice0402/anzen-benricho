// ページの共通部品
import { existsSync } from 'node:fs';
import { esc, fudaLabel } from './layout.mjs';
import { GYOSHU } from './data/gyoshu.mjs';
import { PHOTO, photoBase } from './data/photos.mjs';
import { YOMIMONO, yomimonoPath } from './data/yomimono/index.mjs';

// 写真（16:9）。ファイルがまだない名前は何も出さない。1画面目の写真は first で先に読む
const PUB = new URL('../public', import.meta.url).pathname;
export const hasPhoto = (k) => Boolean(PHOTO[k]) && existsSync(`${PUB}${photoBase(k)}-1200.webp`);
export const photo = (k, { first = false, sizes = '(min-width: 800px) 760px, 100vw', cls = 'ph' } = {}) =>
  hasPhoto(k)
    ? `<figure class="${cls}"><img src="${photoBase(k)}-1200.webp" srcset="${photoBase(k)}-640.webp 640w, ${photoBase(k)}-1200.webp 1200w" sizes="${sizes}" width="1200" height="675" alt="${esc(PHOTO[k])}"${first ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></figure>`
    : '';

export const themePath = (t) => `/anzen/theme/${t.slug}/`;
export const gyoshuPath = (t, g) => `${themePath(t)}${g.key}/`;
export const entrancePath = (g) => `/anzen/gyoshu/${g.key}/`;

// 業種をえらぶ：紙に並べた業種の名前（各ページへのリンク）。いまのページの業種を赤ペンで丸く囲む
export const fuda = (href, current = '') =>
  `<nav class="fuda" aria-label="業種">${GYOSHU.map(
    (g) => `<a class="fuda-b" href="${href(g)}" data-k="${g.key}"${g.key === current ? ' aria-current="page"' : ''}>${fudaLabel(g.label)}</a>`,
  ).join('')}</nav>`;

// テーマの名前。titleParts があれば、その切れ目だけで改行する（「ハラスメントとカス/ハラ」のような切れ方をさせない）
export const titleHtml = (t) => (t.titleParts ? t.titleParts.map((p) => `<span class="nw">${esc(p)}</span>`).join('<wbr>') : esc(t.title));

export const undoLine = (month, undo) => `<p class="th-undo">${month}月の運動 <span>${esc(undo.name)}</span> <span class="nw">${esc(undo.span)}</span></p>`;

// title はエスケープずみのHTML。記事の頭：見出し、運動、写真（月やコーナーの名前は上のパンくずに出る）
export const monthHead = (month, h, title, sub = '', undo = null, img = '') => `<header class="th-head">
<${h} class="th-title">${sub ? `<small>${esc(sub)}</small>` : ''}${title}</${h}>
${undo ? undoLine(month, undo) : ''}
${img ? photo(img, { first: true }) : ''}
</header>`;

// 月のないページの見出し（法改正・資格・知識のページ）。上の小さな行にコーナーの名前
export const bandHead = (band, title, extra = '', img = '') => `<header class="th-head">
<h1 class="th-title pg-title">${esc(title)}</h1>
${img ? photo(img, { first: true }) : ''}
${extra}
</header>`;

// サクッと計算（姉妹サイト）の清掃の作業時間。清掃の仕事の人が両方に来ている（連絡 C-018）
export const SAKUTTO_SEISOU = `<a href="https://sakutto-keisan.com/seisou-jikan/">清掃の作業時間の計算（サクッと計算）</a>`;
// サクッと計算の現場手帳（C-021。清掃の現場の記録と見積もりの目安）
export const SAKUTTO_GENBA = `<a href="https://sakutto-keisan.com/genba/">清掃の現場手帳（サクッと計算）</a>`;

// 読みものから戻るリンク（#98）：読みものの links でこのページ（パスがそのまま同じ）をつないだ読みもの、新しい順に2本まで
export const yomiBack = (path) =>
  YOMIMONO.filter((y) => y.links.some((l) => l.href === path))
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, 2)
    .map((y) => ({ t: `読みもの：${y.h1}`, href: yomimonoPath(y), d: y.d }));
export const yomiBackLi = (path) => yomiBack(path).map((r) => `<li><a href="${r.href}">${esc(r.t)}</a></li>`).join('');
// 「あわせて見る」の節がないページ用。読みものがないときは何も出さない
export const yomiBackSec = (path, np = 'np') => {
  const li = yomiBackLi(path);
  return li ? `<section class="sec paper${np ? ' np' : ''}" aria-labelledby="yb-h">\n<h2 class="sec-h" id="yb-h">あわせて見る</h2>\n<ul class="krel">${li}</ul>\n</section>` : '';
};
