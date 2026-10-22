// 総合トップ：今月のテーマと業種の札、次の法改正を1行、目次
// 目次には、できたページだけを出す（中身のないコーナーや「準備中」の札は出さない）
import { page, esc, script, fudaLabel } from '../layout.mjs';
import { SITE } from '../site.mjs';

const item = (base, it) => `<li><a href="${base}${it.href}">${esc(it.name)}</a></li>`;

export default function home({ data: t, kaisei }) {
  const base = '';
  const themeHref = `${base}/anzen/theme/${t.slug}/`;
  const groups = [
    {
      corner: 'anzen',
      name: '今月の安全衛生',
      items: [{ name: `${t.month}月 ${t.title}`, href: `/anzen/theme/${t.slug}/` }],
    },
    { corner: 'kyotsu', name: '講習・資格', items: [] },
    { corner: 'seisou', name: '清掃・ビルメン', items: [] },
  ].filter((g) => g.items.length);
  const body = `<section class="this-month" aria-labelledby="tm-h">
<p class="tm-kicker">今月の安全衛生</p>
<div class="th-month"><b class="mon">${t.month}<small>月</small></b><h2 class="th-title" id="tm-h"><a href="${themeHref}">${esc(t.title)}</a></h2></div>
<p class="th-undo">今月の運動 <span>${esc(t.undo.name)}</span> <span class="nw">${esc(t.undo.span)}</span></p>
<p class="tm-ask">業種をえらぶと掲示と朝礼が出ます</p>
<nav class="fuda" aria-label="業種">${t.gyoshu
    .map((g) => `<a class="fuda-b" href="${themeHref}#${g.key}" data-k="${g.key}">${fudaLabel(g.label)}</a>`)
    .join('')}</nav>
</section>
<p class="kaisei"><span class="kaisei-tag">次の改正</span><span class="kaisei-body"><span class="kaisei-date">${esc(kaisei.date)}</span>${esc(kaisei.text)}</span></p>
<section class="index" aria-labelledby="idx-h">
<h2 class="sec-h" id="idx-h">目次</h2>
${groups
    .map((g) => `<div class="idx-group" data-corner="${g.corner}"><h3>${esc(g.name)}</h3><ul>${g.items.map((it) => item(base, it)).join('')}</ul></div>`)
    .join('\n')}
</section>`;
  return {
    path: '/',
    html: page({
      title: `${SITE.name}｜今月の安全衛生の掲示と朝礼・清掃の資料`,
      description: '職場の安全衛生の担当者が毎月そのまま使える掲示・朝礼・やることを、業種ごとにまとめています。清掃・ビルメンの資料と、講習・資格の更新の目安も載せます。',
      path: '/',
      body,
      js: script('home'),
      isHome: true,
    }),
  };
}
