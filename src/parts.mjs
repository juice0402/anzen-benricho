// ページの共通部品
import { existsSync } from 'node:fs';
import { esc, fudaLabel } from './layout.mjs';
import { GYOSHU } from './data/gyoshu.mjs';
import { PHOTO, photoBase } from './data/photos.mjs';

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
