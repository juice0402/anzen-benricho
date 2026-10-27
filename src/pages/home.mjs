// 総合トップ（10/27 写真ふう。同じ日に添削して作り直し）：今月の掲示と朝礼・業種、今月のテーマ、これからの予定、調べる（法改正はここにまとめた）
// リンクは下線、リンクでない字は紺にしない
// 中身のないコーナーや「準備中」の札は出さない
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { themePath, entrancePath, photo, hasPhoto } from '../parts.mjs';
import { sheet } from './theme.mjs';
import { houreiPath, fmtDate, todayJst, HOUREI } from '../data/hourei.mjs';
import { KIHON } from '../data/kihon/index.mjs';
import { YOTEI } from '../data/kihon/nenkan.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { homeDesc } from '../describe.mjs';

// テーマの中身の短い説明（seoName のかっこの中）
const sub = (t) => (t.seoName && t.seoName.includes('（') ? t.seoName.slice(t.seoName.indexOf('（') + 1, -1) : '');
const G_SUB = { jimusho: '事務・販売・受付', inshoku: '調理・接客', seizo: '機械・材料・運搬', seisou: 'ビルや病院の清掃・設備' };

export default function home({ month, themes, allThemes, kaisei }) {
  const today = todayJst();
  const next = [1, 2, 3, 4]
    .map((i) => ((month - 1 + i) % 12) + 1)
    .map((m) => ({ m, ev: YOTEI[m] || '', th: allThemes.filter((t) => t.month === m) }))
    .filter((r) => r.ev || r.th.length);
  const laws = HOUREI.filter((h) => h.date > today).slice(0, 3);
  const nKihon = KIHON.filter((p) => p.path.startsWith('/kihon/') || p.path.startsWith('/shikaku/')).length;
  const nKagaku = KIHON.filter((p) => p.path.startsWith('/kagaku/')).length;
  const corners = [
    { k: 'kihon', href: '/kihon/', name: '基本の決まり', d: `人数で変わる決まり・記録の保存年数など${nKihon}ページ` },
    nKagaku && { k: 'kagaku', href: '/kagaku/', name: '化学物質', d: `まぜると危ない洗剤・SDSの見方など${nKagaku}ページ` },
    { k: 'hourei', href: '/hourei/', name: '法改正の一覧', d: laws.length ? `次は${fmtDate(laws[0].date)}から。全${HOUREI.length}件` : `施行日の順に${HOUREI.length}件` },
    { k: 'shikaku', href: '/shikaku/koushin/', name: '資格の更新の期限', d: '修了証書の日付から次の講習の時期' },
  ].filter(Boolean);
  // いちばん上（10/27 しょーくんが3案から、スマホは「写真・見出し・業種」、パソコンは「見出しの横に写真、業種の横に小さな掲示の紙」に決めた）
  const first = themes[0];
  const gOf = (t, k) => t.gyoshu.find((x) => x.key === k);
  const hero = `<section class="hero" aria-labelledby="hero-h">
<a class="hb-ph" href="/anzen/${month}/" aria-label="${month}月の掲示と朝礼">${photo('hero', { first: true, sizes: '(min-width: 800px) 520px, 100vw' })}</a>
<div class="hero-tx"><h1 id="hero-h">${month}月の<wbr>掲示と朝礼</h1>
<p class="hero-lead">毎月、業種ごとに<wbr>A4の掲示と<wbr>1分の朝礼の文</p></div>
<div class="hero-g"><h2 class="hg-h" id="gy-h">業種をえらぶ</h2>
<nav class="g-rows g-mini" aria-labelledby="gy-h">${GYOSHU.map(
    (g) => `<a class="fuda-b" href="${entrancePath(g)}" data-k="${g.key}"><span class="mini" aria-hidden="true">${sheet(first, gOf(first, g.key))}</span><span class="gt"><b>${esc(g.label)}</b><span>${G_SUB[g.key] || ''}</span></span></a>`,
  ).join('')}</nav></div>
</section>`;
  const body = `${hero}
<section class="hs" aria-labelledby="tm-h">
<h2 class="hs-h" id="tm-h">${month}月のテーマ</h2>
<ul class="rows rows-t">${themes
    .map(
      (t) => `<li><a href="${themePath(t)}">${photo(t.slug, { sizes: '(min-width: 800px) 200px, 128px', cls: 'ph ph-s' })}<span><small>${esc(t.undo ? t.undo.name : `${t.month}月`)}</small><b>${esc(t.title)}</b>${sub(t) ? `<span>${esc(sub(t))}</span>` : ''}</span></a></li>`,
    )
    .join('')}</ul>
</section>
<section class="hs" aria-labelledby="yt-h">
<h2 class="hs-h" id="yt-h">これからの予定</h2>
<ol class="yt">${next
    .map(
      (r) => `<li><a class="ym" href="/anzen/${r.m}/"><b>${r.m}</b>月</a><div>${r.ev ? `<p class="yt-ev">${esc(r.ev)}</p>` : ''}${
        r.th.length ? `<ul class="yt-th">${r.th.map((t) => `<li><a href="${themePath(t)}">${esc(t.title)}</a></li>`).join('')}</ul>` : ''
      }</div></li>`,
    )
    .join('')}</ol>
</section>
<section class="hs" aria-labelledby="sr-h">
<h2 class="hs-h" id="sr-h">調べる</h2>
<ul class="rows">${corners.map((c) => `<li><a href="${c.href}">${hasPhoto(c.k) ? photo(c.k, { sizes: '128px', cls: 'ph ph-s' }) : ''}<span><b>${esc(c.name)}</b><span>${esc(c.d)}</span></span></a></li>`).join('')}</ul>
</section>
${adSlot('home')}`;
  return {
    path: '/',
    html: page({
      title: `${SITE.name}｜毎月の掲示と朝礼・安全衛生の決まり`,
      ogTitle: SITE.name,
      description: homeDesc({ allThemes, kihon: KIHON.length, hourei: HOUREI.length, kaisei, fmtDate }),
      // Google の「サイト名」：トップの title・og:site_name とそろえる
      ld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, alternateName: ['安全衛生便利帳', 'anzen-benricho'], url: `${SITE.url}/`, inLanguage: 'ja' }],
      path: '/',
      body,
      js: script('remember'),
      isHome: true,
      wide: true,
    }),
  };
}
