// 総合トップ：今月のテーマと業種、次の法改正を1行、目次
// 目次には、できたページだけを出す（中身のないコーナーや「準備中」の札は出さない）
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE, CORNERS } from '../site.mjs';
import { themePath, entrancePath, fuda } from '../parts.mjs';
import { houreiPath, fmtDate } from '../data/hourei.mjs';

export default function home({ month, themes, allThemes, kaisei }) {
  const groups = [
    { corner: 'anzen', name: '今月の安全衛生', items: allThemes.map((t) => ({ name: `${t.month}月 ${t.title}`, href: themePath(t) })) },
    { corner: 'kyotsu', name: CORNERS.kyotsu.name, items: [{ name: '法改正の一覧', href: '/hourei/' }, { name: '資格の更新の期限', href: '/shikaku/koushin/' }] },
    { corner: 'seisou', name: '清掃・ビルメン', items: [] },
  ].filter((g) => g.items.length);
  const body = `<section class="this-month" aria-labelledby="tm-h">
<p class="cal-band">今月の安全衛生</p>
<div class="th-month"><b class="mon">${month}<small>月</small></b><h2 class="tm-h" id="tm-h">今月のテーマ</h2></div>
<ul class="tm-list">${themes.map((t) => `<li><a href="${themePath(t)}">${esc(t.title)}</a></li>`).join('')}</ul>
<p class="tm-ask">業種をえらぶと掲示と朝礼が出ます</p>
${fuda(entrancePath)}
</section>
<p class="kaisei"><span class="kaisei-tag">次の改正</span><span class="kaisei-body"><span class="kaisei-date">${fmtDate(kaisei.date)}</span><a href="${houreiPath(kaisei)}">${esc(kaisei.title)}</a></span></p>
<section class="index" aria-labelledby="idx-h">
<h2 class="sec-h" id="idx-h">目次</h2>
${groups
    .map((g) => `<div class="idx-group" data-corner="${g.corner}"><h3>${esc(g.name)}</h3><ul>${g.items.map((it) => `<li><a href="${it.href}">${esc(it.name)}</a></li>`).join('')}</ul></div>`)
    .join('\n')}
</section>
${adSlot('home')}`;
  return {
    path: '/',
    html: page({
      title: `${SITE.name}｜今月の安全衛生の掲示と朝礼・清掃の資料`,
      description: '職場の安全衛生の担当者が毎月そのまま使える掲示と朝礼の文を、事務所・飲食店・製造業・清掃の業種ごとにまとめています。清掃・ビルメンの資料と、講習・資格の更新の目安も載せます。',
      path: '/',
      body,
      js: script('remember'),
      isHome: true,
    }),
  };
}
