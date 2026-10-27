// 総合トップ（10/27 しょーくんが3案から「写真ふう」に決めた）：何のサイトかがわかる写真と1文、今月のテーマ、業種、これからの予定、法改正、調べるページ
// 中身のないコーナーや「準備中」の札は出さない
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { themePath, entrancePath, photo, hasPhoto } from '../parts.mjs';
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
    { k: 'hourei', href: '/hourei/', name: '法改正の一覧', d: `施行日の順に${HOUREI.length}件` },
    { k: 'shikaku', href: '/shikaku/koushin/', name: '資格の更新の期限', d: '修了証書の日付から次の講習の時期' },
  ].filter(Boolean);
  const body = `<section class="hero" aria-labelledby="hero-h">
${photo('hero', { first: true, sizes: '(min-width: 800px) 560px, 100vw' })}
<div class="hero-tx">
<h1 id="hero-h">毎月の安全衛生の<wbr>掲示と朝礼</h1>
<p>事務所・店舗、飲食、製造、清掃・ビルメンの4業種ごとに、A4で印刷できる掲示と1分で読める朝礼の文をまとめています。</p>
<a class="btn btn-go" href="/anzen/${month}/">${month}月の掲示を見る</a>
</div>
</section>
<section class="hs" aria-labelledby="tm-h">
<h2 class="hs-h" id="tm-h">${month}月のテーマ${YOTEI[month] ? `<small>${esc(YOTEI[month])}</small>` : ''}</h2>
<div class="cards">${themes
    .map(
      (t) => `<article class="card"><a href="${themePath(t)}">${photo(t.slug, { sizes: '(min-width: 800px) 520px, 100vw' })}<p class="card-tag">${esc(t.undo ? t.undo.name : `${t.month}月`)}</p><h3>${esc(t.title)}</h3>${sub(t) ? `<p class="card-d">${esc(sub(t))}</p>` : ''}</a></article>`,
    )
    .join('')}</div>
</section>
<section class="hs" aria-labelledby="gy-h">
<h2 class="hs-h" id="gy-h">業種からえらぶ<small>${month}月の掲示と朝礼へ</small></h2>
<nav class="g-rows" aria-label="業種">${GYOSHU.map((g) => `<a class="fuda-b" href="${entrancePath(g)}" data-k="${g.key}"><b>${esc(g.label)}</b><span>${G_SUB[g.key] || ''}</span></a>`).join('')}</nav>
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
${laws.length ? `<section class="hs" aria-labelledby="kz-h">
<h2 class="hs-h" id="kz-h">これからの法改正</h2>
<ul class="hr-list">${laws.map((h) => `<li><a href="${houreiPath(h)}"><span class="hr-date">${fmtDate(h.date)}から</span><span class="hr-t">${esc(h.title)}</span></a></li>`).join('')}</ul>
<p class="more"><a href="/hourei/">法改正の一覧</a></p>
</section>` : ''}
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
