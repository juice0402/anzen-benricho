// 楽天の商品の取り方（#66。machi-shakaika の tests/rakuten.test.mjs をこのサイトの形にした）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanName, fits, pick, searchUrl, priceBand, HEADERS, SHOW, RAKUTEN_CREDIT } from '../src/rakuten.mjs';

const kau = { must: ['台車'], ng: ['部品'] };
const item = (o) => ({ code: 'c', name: '台車 業務用 150kg', price: 5000, url: 'https://hb.afl.rakuten.co.jp/x', img: 'https://thumbnail.image.rakuten.co.jp/x.jpg', shop: 'A', avail: 1, reviews: 100, rating: 4.5, ...o });

test('商品名の飾りと絵文字を外す', () => {
  assert.equal(cleanName('【送料無料】台車 ★150kg★ 業務用 [静音]'), '台車 150kg 業務用');
  assert.equal(cleanName('台車😀 業務用'), '台車 業務用');
  assert.equal(cleanName('【だけ】'), '【だけ】');
});

test('物の条件：must・ng・在庫・レビュー10件以上・評価4.0以上', () => {
  assert.equal(fits(item(), kau), true);
  assert.equal(fits(item({ name: '台車 部品 キャスター' }), kau), false);
  assert.equal(fits(item({ name: '運搬カート' }), kau), false);
  assert.equal(fits(item({ name: '【中古】台車' }), kau), false);
  assert.equal(fits(item({ avail: 0 }), kau), false);
  assert.equal(fits(item({ reviews: 9 }), kau), false);
  assert.equal(fits(item({ rating: 3.9 }), kau), false);
  // 物ごとにレビューの条件をゆるめられる
  const loose = { ...kau, minReviews: 3, minRating: 3.5 };
  assert.equal(fits(item({ reviews: 3, rating: 3.5 }), loose), true);
  assert.equal(fits(item({ reviews: 2 }), loose), false);
  assert.equal(fits(item({ rating: 3.4 }), loose), false);
  assert.equal(fits(item({ img: '' }), kau), false);
});

test('えらび方：レビューが多い順・同じ商品とお店は1つ・まん中の3倍をこえる値段は外す・3つまで', () => {
  const c = [
    item({ code: 'a', reviews: 50, shop: 'S1' }),
    item({ code: 'b', reviews: 900, shop: 'S2' }),
    item({ code: 'b', reviews: 900, shop: 'S2' }),
    item({ code: 'x1', reviews: 800, shop: 'X' }),
    item({ code: 'x2', reviews: 700, shop: 'X' }),
    item({ code: 'high', reviews: 5000, price: 50000, shop: 'S5' }),
    item({ code: 'ng', reviews: 9999, name: '台車 部品', shop: 'S6' }),
    item({ code: 'c', reviews: 20, shop: 'S7' }),
  ];
  assert.deepEqual(pick(c, kau, 10).map((x) => x.code), ['b', 'x1', 'a', 'c']);
  assert.deepEqual(pick(c, kau).map((x) => x.code), ['b', 'x1', 'a']);
  assert.equal(SHOW, 3);
  // ページに出すのは名前（飾りを外したもの）・値段・URL・画像・お店だけ
  assert.deepEqual(Object.keys(pick(c, kau)[0]).sort(), ['code', 'img', 'name', 'price', 'shop', 'url']);
});

test('値段の幅', () => {
  assert.equal(priceBand(980), '1,000円未満');
  assert.equal(priceBand(2480), '2,000円台');
  assert.equal(priceBand(9999), '9,000円台');
  assert.equal(priceBand(12800), '1万円台');
});

test('呼び出し：新方式のキー・レビューが多い順・買えるものだけ・画像あり・Referer と Origin', () => {
  const u = new URL(searchUrl({ appId: 'A', accessKey: 'K', affiliateId: 'F' }, '台車 業務用'));
  assert.equal(u.searchParams.get('applicationId'), 'A');
  assert.equal(u.searchParams.get('accessKey'), 'K');
  assert.equal(u.searchParams.get('affiliateId'), 'F');
  assert.equal(u.searchParams.get('sort'), '-reviewCount');
  assert.equal(u.searchParams.get('availability'), '1');
  assert.equal(u.searchParams.get('imageFlag'), '1');
  assert.ok(u.searchParams.get('NGKeyword').includes('中古'));
  assert.deepEqual(HEADERS, { Referer: 'https://anzen-benricho.com/', Origin: 'https://anzen-benricho.com' });
});

test('クレジットは楽天の文字版のスニペットのまま', () => {
  assert.equal(RAKUTEN_CREDIT, '<!-- Rakuten Web Services Attribution Snippet FROM HERE -->\n<a href="https://developers.rakuten.com/" target="_blank">Supported by Rakuten Developers</a>\n<!-- Rakuten Web Services Attribution Snippet TO HERE -->');
});
