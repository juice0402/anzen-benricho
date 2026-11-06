// そろえる物（#66。11/6 しょーくんが見本2案から案1「別のページ」に決めた）
//   /soroeru/        目次（商品を出さないので AdSense はそのまま）
//   /soroeru/<key>/  物のページ：見出し → 広告の1行 → なぜ今か → 選ぶときに見る所 → 楽天市場の商品3つ → 値段を見た日 → クレジット → あわせて見る
// 物のページは AdSense を置かない（noAds）・楽天以外へのリンクを置かない（楽天ウェブサービス規約 第8条4項。出典は名前と確認日だけ）
// 商品はビルドの前に Actions が取る（scripts/fetch-rakuten.mjs）。ないとき・3件に届かないときは、商品の節と広告の1行とクレジットを出さない
import { page, esc, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { bandHead, themePath, photo } from '../parts.mjs';
import { KAU_READY, kauPath } from '../data/kau.mjs';
import { RAKUTEN_CREDIT, RAKUTEN_PR, SHOW, priceBand } from '../rakuten.mjs';
import { soroeruHubDesc, soroeruDesc } from '../describe.mjs';

const ym = (iso) => `${Number(iso.slice(0, 4))}年${Number(iso.slice(5, 7))}月`;
const jstDay = (iso) => {
  const d = new Date(Date.parse(iso) + 9 * 3600000).toISOString().slice(0, 10);
  return `${Number(d.slice(0, 4))}年${Number(d.slice(5, 7))}月${Number(d.slice(8, 10))}日`;
};
const sub = (k) => (k.sokutei ? '測る道具' : `${k.month}月にそろえる物`);

function shopHtml(list, fetchedAt) {
  return `<section class="sec paper" aria-labelledby="sr-shop">
<h2 class="sec-h" id="sr-shop">楽天市場の商品</h2>
<ul class="rows shop">${list
    .map(
      (x) => `<li><a href="${esc(x.url)}" rel="sponsored nofollow noopener" target="_blank"><img class="shop-im" src="${esc(x.img)}" width="128" height="128" loading="lazy" alt=""><span><b>${esc(x.name)}</b><span>${priceBand(x.price)}</span><span>楽天市場で見る</span></span></a></li>`,
    )
    .join('')}</ul>
<p class="u-note">値段は${jstDay(fetchedAt)}に見たもの</p>
<p class="sr-credit">${RAKUTEN_CREDIT}</p>
</section>`;
}

function itemPage(k, themes, products) {
  const path = kauPath(k.key);
  const theme = k.theme ? themes.find((t) => t.slug === k.theme) : null;
  const list = products?.items?.[k.key] ?? [];
  const shop = list.length >= SHOW ? list.slice(0, SHOW) : [];
  const more = [
    ...(k.month ? [[`/anzen/${k.month}/`, `${k.month}月の安全衛生（${k.month}月号）`]] : []),
    ...(theme ? [[themePath(theme), `${theme.title}の掲示と朝礼`]] : []),
    ['/anzen/kiroku/', '1年の実施記録の表（A4）'],
  ];
  const body = `<header class="th-head"><h1 class="th-title"><small>${esc(sub(k))}</small>${esc(k.t)}</h1>
${shop.length ? `<p class="pg-lead">${RAKUTEN_PR}</p>` : ''}
</header>
<section class="sec paper" aria-labelledby="sr-why">
<h2 class="sec-h" id="sr-why">${k.sokutei ? 'なぜ測るか' : 'なぜ今か'}</h2>
<p>${esc(k.why)}。</p>
</section>
<section class="sec paper" aria-labelledby="sr-pt">
<h2 class="sec-h" id="sr-pt">選ぶときに見る所</h2>
<ol class="gd sr-pt">${k.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
<p class="u-note">出典（${ym(k.checked)}確認）</p>
<ol class="src">${k.src.map((s) => `<li>${esc(s.t)}</li>`).join('')}</ol>
</section>
${shop.length ? shopHtml(shop, products.fetchedAt) : ''}
<section class="sec paper" aria-labelledby="sr-more">
<h2 class="sec-h" id="sr-more">あわせて見る</h2>
<ul class="krel">${more.map(([h, n]) => `<li><a href="${h}">${esc(n)}</a></li>`).join('')}</ul>
</section>`;
  return {
    path,
    html: page({
      title: `${k.t}の選び方｜${sub(k)}｜${SITE.name}`,
      description: soroeruDesc(k, theme),
      path,
      corner: 'soroeru',
      body,
      noAds: true,
      crumbs: [{ name: 'そろえる物', href: '/soroeru/' }, { name: k.t }],
    }),
    lastmod: k.checked,
  };
}

function index(themes, from) {
  const path = '/soroeru/';
  const order = (k) => (k.month ? (k.month - from + 12) % 12 : 12);
  const list = [...KAU_READY].sort((a, b) => order(a) - order(b));
  const body = `${bandHead('そろえる物', '職場にそろえる物', '<p class="pg-lead">月のテーマに合わせて職場にそろえる物</p>')}
<section class="sec paper" aria-labelledby="sr-list">
<h2 class="sec-h" id="sr-list">物</h2>
<ul class="rows">${list
    .map((k) => {
      const t = themes.find((x) => x.slug === k.theme);
      return `<li><a href="${kauPath(k.key)}">${t ? photo(t.slug, { sizes: '128px', cls: 'ph ph-s' }) : ''}<span><b>${esc(k.t)}</b><span>${esc(sub(k))}${t ? `・${esc(t.title)}` : ''}</span></span></a></li>`;
    })
    .join('')}</ul>
</section>
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `職場にそろえる物｜月の安全衛生テーマ別の選び方｜${SITE.name}`,
      description: soroeruHubDesc(list),
      path,
      corner: 'soroeru',
      body,
      crumbs: [{ name: 'そろえる物' }],
    }),
    lastmod: list.map((k) => k.checked).sort().pop(),
  };
}

export default function soroeruPages(themes, from, products) {
  if (!KAU_READY.length) return [];
  return [index(themes, from), ...KAU_READY.map((k) => itemPage(k, themes, products))];
}
