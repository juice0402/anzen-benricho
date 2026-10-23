// 総合トップ：サイトの1行、安全衛生の予定表（今日から5か月。掲示を用意する月に赤ペンの丸）と業種、次の法改正を1行、目次
// 「今日」の線と日付は、作り直しのあいだもずれないよう、ブラウザで今日の月に動かす（today.js）
// 目次には、できたページだけを出す（中身のないコーナーや「準備中」の札は出さない）
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE, CORNERS } from '../site.mjs';
import { themePath, entrancePath, fuda } from '../parts.mjs';
import { houreiPath, fmtDate, todayJst } from '../data/hourei.mjs';
import { KIHON } from '../data/kihon/index.mjs';
import { YOTEI } from '../data/kihon/nenkan.mjs';

export default function home({ month, themes, allThemes, kaisei }) {
  const today = todayJst();
  const now = Number(today.slice(5, 7));
  const day = Number(today.slice(8, 10));
  const rows = [0, 1, 2, 3, 4]
    .map((i) => ((now - 1 + i) % 12) + 1)
    .map((m) => ({ m, ev: YOTEI[m] || '', th: allThemes.filter((t) => t.month === m) }))
    .filter((r) => r.m === now || r.m === month || r.ev || r.th.length);
  const groups = [
    { corner: 'anzen', name: '月ごとのテーマ', items: [...[...new Set(allThemes.map((t) => t.month))].map((m) => ({ name: `${m}月の安全衛生テーマ`, href: `/anzen/${m}/` })), ...KIHON.filter((p) => p.path.startsWith('/anzen/')).map((p) => ({ name: p.h1, href: p.path }))] },
    { corner: 'kihon', name: '基本の決まり', items: KIHON.filter((p) => p.path.startsWith('/kihon/')).map((p) => ({ name: p.h1, href: p.path })) },
    { corner: 'kyotsu', name: CORNERS.kyotsu.name, items: [{ name: '法改正の一覧', href: '/hourei/' }, { name: '資格の更新の期限', href: '/shikaku/koushin/' }, ...KIHON.filter((p) => p.path.startsWith('/shikaku/')).map((p) => ({ name: p.h1, href: p.path }))] },
    { corner: 'seisou', name: '清掃・ビルメン', items: [] },
  ].filter((g) => g.items.length);
  const body = `<p class="site-lead">安全衛生の担当者向け　毎月の掲示・朝礼と決まり</p>
<section class="yotei" aria-labelledby="yt-h">
<h2 class="cal-band" id="yt-h">安全衛生の予定</h2>
<ol class="yt">${rows
    .map(
      (r) => `<li${r.m === month ? ' class="yt-pick"' : ''} data-m="${r.m}"><span class="ym"><b>${r.m}</b>月</span><div>${
        r.m === month ? `<p class="yt-mark">${r.m === now ? '今月の掲示と朝礼' : 'いま掲示を用意する月'}</p>` : ''
      }${r.ev ? `<p class="yt-ev">${esc(r.ev)}</p>` : ''}${
        r.th.length ? `<ul class="yt-th">${r.th.map((t) => `<li><a href="${themePath(t)}">${esc(t.title)}</a></li>`).join('')}</ul>` : ''
      }</div>${r.m === now ? `<span class="yt-today"><span>今日 ${now}月${day}日</span></span>` : ''}</li>`,
    )
    .join('')}</ol>
<p class="tm-ask">業種をえらぶと${month}月の掲示と朝礼が出ます</p>
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
      js: script('remember') + script('today'),
      isHome: true,
    }),
  };
}
