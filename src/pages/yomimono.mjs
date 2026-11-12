// 読みもの：目次 /yomimono/ と記事 /yomimono/<slug>/（11/4 育てる山 #59）
// 見た目はいまの部品だけ：記事の頭は知識・資格のページと同じ（パンくず・見出し・16:9 の写真）、目次の1行はトップの「こんなときは」と同じ形
// 記事の並び：はじめの答え → 節（表があれば表）→ 運営者のひとこと（voice があるときだけ）→ 職場で確かめる → 広告の枠 → 出典。印刷は作らない
import { page, esc, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { bandHead, photo } from '../parts.mjs';
import { fmtDate } from '../data/hourei.mjs';
import { YOMIMONO, yomimonoPath } from '../data/yomimono/index.mjs';
import { yomimonoHubDesc } from '../describe.mjs';
import { packLineReading } from '../pack-line.mjs';

const CRUMB = { name: '読みもの', href: '/yomimono/' };

const table = (t) => `<div class="ym-tw"><table class="doc-tbl ym-t"><thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows
  .map((r) => `<tr>${r.map((c, i) => (i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('')}</tr>`)
  .join('')}</tbody></table></div>`;

// ほかの読みもの（C-027 案A）：ならびで前後の2本（新しい順のならびの、ひとつ前とひとつあと。はしは折り返す）
export const otherReadings = (slug, list = YOMIMONO) => {
  const i = list.findIndex((y) => y.slug === slug);
  if (i < 0 || list.length < 2) return [];
  const pick = [list[(i + 1) % list.length], list[(i - 1 + list.length) % list.length]];
  return pick.filter((y, k) => y.slug !== slug && pick.findIndex((z) => z.slug === y.slug) === k);
};
function article(y) {
  const path = yomimonoPath(y);
  const secs = y.sections
    .map((s, i) => `<section class="sec paper" aria-labelledby="ym-h${i}">
<h2 class="sec-h" id="ym-h${i}">${esc(s.h)}</h2>
${s.p.map((t) => `<p>${esc(t)}</p>`).join('\n')}
${s.table ? table(s.table) : ''}
</section>`)
    .join('\n');
  const voice = y.voice
    ? `<section class="sec paper" aria-labelledby="ym-v">
<h2 class="sec-h" id="ym-v">運営者のひとこと</h2>
<p>${esc(y.voice)}</p>
</section>`
    : '';
  const links = `<section class="sec paper" aria-labelledby="ym-l">
<h2 class="sec-h" id="ym-l">職場で確かめる</h2>
<ul class="krel">${y.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.t)}<span class="ym-d">${esc(l.d)}</span></a></li>`).join('')}${packLineReading(y.slug)}</ul>
</section>`;
  const others = otherReadings(y.slug);
  const more = others.length
    ? `<section class="sec paper np" aria-labelledby="ym-o">
<h2 class="sec-h" id="ym-o">ほかの読みもの</h2>
<ul class="krel">${others.map((o) => `<li><a href="${yomimonoPath(o)}">${esc(o.h1)}<span class="ym-d">${esc(o.d)}</span></a></li>`).join('')}</ul>
</section>`
    : '';
  const src = `<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
<ol class="src">${y.src.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol>
<p class="src-note">${fmtDate(y.published)}公開。${fmtDate(y.checked)}に確かめた内容です。</p>
</section>`;
  const body = `${bandHead('読みもの', y.h1, `<p class="ym-lead">${esc(y.lead)}</p>`, y.photo)}
${secs}
${voice}
${links}
${more}
${adSlot('end')}
${src}`;
  return {
    path,
    html: page({
      title: `${y.title}｜${SITE.name}`,
      description: y.description,
      path,
      corner: 'yomimono',
      body,
      ld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: y.h1, datePublished: y.published, dateModified: y.checked, image: `${SITE.url}/img/photo/${y.photo}-1200.webp`, inLanguage: 'ja', publisher: { '@type': 'Organization', name: SITE.name, url: `${SITE.url}/` } }],
      crumbs: [CRUMB, { name: y.h1 }],
    }),
    lastmod: y.checked,
  };
}

// 目次には広告の枠を置かない（広告は記事のいちばん下だけ）
function hub(list) {
  const path = '/yomimono/';
  const body = `${bandHead('読みもの', '安全衛生の読みもの', '<p class="pg-lead">季節のネタや法改正を1本ずつ</p>')}
<section class="sec paper" aria-labelledby="yh-h">
<h2 class="sec-h" id="yh-h">新しい順</h2>
<ul class="ny ym-list">${list
    .map((y) => `<li><a href="${yomimonoPath(y)}">${photo(y.photo, { sizes: '96px', cls: 'ph ph-s' })}<span><b>${esc(y.h1)}</b><span>${esc(y.d)}</span></span></a></li>`)
    .join('')}</ul>
</section>`;
  return {
    path,
    html: page({
      title: `安全衛生の読みもの 朝礼のネタ・季節のけが・法改正のまとめ｜${SITE.name}`,
      description: yomimonoHubDesc(list, fmtDate),
      path,
      corner: 'yomimono',
      body,
      crumbs: [{ name: '読みもの' }],
    }),
    lastmod: list.map((y) => y.checked).sort().pop(),
  };
}

export default function yomimonoPages() {
  return YOMIMONO.length ? [hub(YOMIMONO), ...YOMIMONO.map(article)] : [];
}
