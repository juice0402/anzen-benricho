// ページの共通部品
import { esc, fudaLabel } from './layout.mjs';
import { GYOSHU } from './data/gyoshu.mjs';

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

// title はエスケープずみのHTML
export const monthHead = (month, h, title, sub = '', undo = null) => `<header class="th-head">
<p class="cal-band">${month}月の安全衛生</p>
<div class="th-month"><b class="mon">${month}<small>月</small></b><${h} class="th-title">${sub ? `<small>${esc(sub)}</small>` : ''}${title}</${h}></div>
${undo ? undoLine(month, undo) : ''}
</header>`;

// 月のないページの見出し（法改正・資格）。カレンダーと同じ紙で、帯にコーナーの名前
export const bandHead = (band, title, extra = '') => `<header class="th-head">
<p class="cal-band">${esc(band)}</p>
<h1 class="th-title pg-title">${esc(title)}</h1>
${extra}
</header>`;
