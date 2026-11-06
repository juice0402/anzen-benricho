// 楽天市場の商品（そろえる物のページ /soroeru/<key>/ だけに出す。#66）
// machi-shakaika の src/rakuten.mjs を写して、このサイトの形にした（ランキングは使わない・1つの物に3件・同じお店は1つまで）
// 呼び方は新方式（applicationId＋accessKey、Referer と Origin に許可されたWebサイト）
// このリポジトリは公開なので、楽天から取った情報はコミットしない・ログに出さない（楽天ウェブサービス規約 第10条9号）
//   取ったものは data/rakuten/（.gitignore）に置き、ビルドで HTML にするだけ

export const SEARCH = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';
// 楽天のアプリの「許可されたWebサイト」（anzen-benricho.com）
export const SITE_ORIGIN = 'https://anzen-benricho.com';
export const HEADERS = { Referer: `${SITE_ORIGIN}/`, Origin: SITE_ORIGIN };
export const PRODUCTS_PATH = 'data/rakuten/products.json';
// 1つの物に出す数
export const SHOW = 3;
// 商品の節を出す最小の件数（ふつうは SHOW。物ごとに kau.minShow で下げられる＝吐いた物の処理セットは2・11/7 しょーくん）
export const minShowOf = (kau = {}) => kau.minShow ?? SHOW;

// 楽天のクレジット（文字版のスニペット。1文字も変えない）
export const RAKUTEN_CREDIT = `<!-- Rakuten Web Services Attribution Snippet FROM HERE -->
<a href="https://developers.rakuten.com/" target="_blank">Supported by Rakuten Developers</a>
<!-- Rakuten Web Services Attribution Snippet TO HERE -->`;
// 1画面めに出す広告の表示
export const RAKUTEN_PR = '広告　楽天アフィリエイトを利用しています';

const ELEMENTS = ['itemName', 'itemCode', 'itemPrice', 'affiliateUrl', 'mediumImageUrls', 'shopName', 'availability', 'reviewCount', 'reviewAverage'];
// どの物でも外す言葉（楽天側の NGKeyword にも渡す）
const NG_ALL = ['中古', 'ふるさと納税', '訳あり', '定期便', 'レンタル', '福袋'];

export function cleanKeys(env) {
  return {
    appId: String(env.RAKUTEN_APPLICATION_ID ?? '').trim(),
    accessKey: String(env.RAKUTEN_ACCESS_KEY ?? '').trim(),
    affiliateId: String(env.RAKUTEN_AFFILIATE_ID ?? '').trim(),
  };
}

// 商品検索：レビューが多い順・買えるものだけ・画像あり
export function searchUrl(keys, keyword) {
  const p = new URLSearchParams({
    applicationId: keys.appId,
    accessKey: keys.accessKey,
    affiliateId: keys.affiliateId,
    formatVersion: '2',
    keyword,
    hits: '30',
    page: '1',
    sort: '-reviewCount',
    availability: '1',
    imageFlag: '1',
    NGKeyword: NG_ALL.join(' '),
    elements: ELEMENTS.join(','),
  });
  return `${SEARCH}?${p}`;
}

function firstImage(it) {
  const v = Array.isArray(it.mediumImageUrls) ? it.mediumImageUrls[0] : null;
  return typeof v === 'string' ? v : (v?.imageUrl ?? '');
}

export function parseItems(json) {
  return (json?.Items ?? json?.items ?? []).map((r) => {
    const it = r.Item ?? r.item ?? r;
    return {
      code: String(it.itemCode ?? ''),
      name: String(it.itemName ?? ''),
      price: Number(it.itemPrice ?? 0),
      url: String(it.affiliateUrl ?? ''),
      img: firstImage(it),
      shop: String(it.shopName ?? ''),
      avail: it.availability == null ? 1 : Number(it.availability),
      reviews: Number(it.reviewCount ?? 0),
      rating: Number(it.reviewAverage ?? 0),
    };
  });
}

// 商品名の飾り（【送料無料】・★・絵文字など）を外して、ページに出す名前にする
export function cleanName(s) {
  const t = String(s)
    .replace(/【[^】]*】|［[^］]*］|\[[^\]]*\]|＜[^＞]*＞|<[^>]*>/g, ' ')
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[★☆◆◇■□●○◎※♪♡♥！!]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t || String(s).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').trim();
}

// レビューの条件（ふつうは10件以上・評価4.0以上。物ごとに kau.minReviews・kau.minRating で変えられる）
export const MIN_REVIEWS = 10;
export const MIN_RATING = 4.0;
export const reviewOk = (it, kau = {}) => it.reviews >= (kau.minReviews ?? MIN_REVIEWS) && it.rating >= (kau.minRating ?? MIN_RATING);

// 物ごとの条件に合うか（商品名に must のどれか。ng と全体の外す言葉が入っていない。レビューの条件）
export function fits(it, kau) {
  const n = it.name;
  if (!(it.avail === 1 && it.price > 0 && it.url.startsWith('https://') && it.img.startsWith('https://'))) return false;
  if (!(kau.must ?? []).some((w) => n.includes(w))) return false;
  if ([...NG_ALL, ...(kau.ng ?? [])].some((w) => n.includes(w))) return false;
  if (!reviewOk(it, kau)) return false;
  return true;
}

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

// 候補から SHOW 件をえらぶ：条件に合うもの → 値段がまん中の3倍をこえるものは外す → レビューが多い順に、同じ商品・同じお店は1つまで
export function pick(cands, kau, n = SHOW) {
  const seen = new Set();
  const ok = [];
  for (const it of cands) {
    if (!it.code || seen.has(it.code) || !fits(it, kau)) continue;
    seen.add(it.code);
    ok.push(it);
  }
  const mid = median(ok.map((x) => x.price));
  const shops = new Set();
  const out = [];
  for (const it of ok.filter((x) => x.price <= mid * 3).sort((a, b) => b.reviews - a.reviews)) {
    if (shops.has(it.shop)) continue;
    shops.add(it.shop);
    out.push({ code: it.code, name: cleanName(it.name), price: it.price, url: it.url, img: it.img, shop: it.shop });
    if (out.length >= n) break;
  }
  return out;
}

// 値段の幅（「2,000円台」）。くわしい値段は楽天市場のページで見てもらう
export function priceBand(p) {
  if (p < 1000) return '1,000円未満';
  if (p < 10000) return `${(Math.floor(p / 1000) * 1000).toLocaleString('en-US')}円台`;
  return `${Math.floor(p / 10000)}万円台`;
}
