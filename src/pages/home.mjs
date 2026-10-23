// 総合トップ：今月のテーマと業種、次の法改正を1行、目次
// 目次には、できたページだけを出す（中身のないコーナーや「準備中」の札は出さない）
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE, CORNERS } from '../site.mjs';
import { themePath, entrancePath, fuda } from '../parts.mjs';
import { houreiPath, fmtDate, todayJst } from '../data/hourei.mjs';
import { KIHON } from '../data/kihon/index.mjs';

export default function home({ month, themes, allThemes, kaisei }) {
  const now = Number(todayJst().slice(5, 7));
  const groups = [
    { corner: 'anzen', name: '月ごとのテーマ', items: [...new Set(allThemes.map((t) => t.month))].map((m) => ({ name: `${m}月の安全衛生テーマ`, href: `/anzen/${m}/` })) },
    { corner: 'kihon', name: '基本の決まり', items: KIHON.filter((p) => p.path.startsWith('/kihon/')).map((p) => ({ name: p.h1, href: p.path })) },
    { corner: 'kyotsu', name: CORNERS.kyotsu.name, items: [{ name: '法改正の一覧', href: '/hourei/' }, { name: '資格の更新の期限', href: '/shikaku/koushin/' }] },
    { corner: 'seisou', name: '清掃・ビルメン', items: [] },
  ].filter((g) => g.items.length);
  const body = `<section class="this-month" aria-labelledby="tm-h">
<p class="cal-band">${now === month ? '今月の安全衛生' : `${month}月の準備`}</p>
<div class="th-month"><b class="mon">${month}<small>月</small></b><h2 class="tm-h" id="tm-h">${month}月のテーマ</h2></div>
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
      title: `${SITE.name}｜毎月の安全衛生テーマ 掲示と朝礼（業種別）・法改正`,
      description: '職場の安全衛生の担当者が毎月そのまま使える掲示と朝礼の文を、事務所・飲食店・製造業・清掃の業種ごとにまとめています。安全衛生推進者の選び方や人数で変わる決まり、法改正の一覧、資格の更新の期限も出典つきで載せています。',
      path: '/',
      body,
      js: script('remember'),
      isHome: true,
    }),
  };
}
