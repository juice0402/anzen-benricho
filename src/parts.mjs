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

export const monthHead = (month, h, title, sub = '', undo = null) => `<header class="th-head">
<p class="cal-band">今月の安全衛生</p>
<div class="th-month"><b class="mon">${month}<small>月</small></b><${h} class="th-title">${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}</${h}></div>
${undo ? `<p class="th-undo">今月の運動 <span>${esc(undo.name)}</span> <span class="nw">${esc(undo.span)}</span></p>` : ''}
</header>`;
