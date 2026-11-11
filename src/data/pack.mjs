// 安全衛生の法人パック（#82。1か月分 500円・1回払い。くわしくは docs/pack.md）
// link・linkId：本番の Stripe の支払いリンクの URL と、その ID（plink_…）。testLink・testLinkId：テストの支払いリンク
// しょーくんが Stripe の画面で作ったあと、昼のチャットが入れる。鍵はここに書かない（Cloudflare の秘密の設定 STRIPE_KEY・STRIPE_TEST_KEY）
// link も testLink も null のあいだは /pack/ も月のページも作らない。testLink だけのときは /pack/ を noindex・どこからもリンクしない
// このファイルは Pages Functions（functions/pack/_middleware.js）からも読むので、node: の部品を使わない
export const PACK = {
  price: 500,
  link: null,
  linkId: null,
  testLink: null,
  testLinkId: null,
  // 最初の号。これより前の号は売らない・作らない
  first: '2026-12',
};
