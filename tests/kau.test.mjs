// そろえる物のデータ（#66）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KAU, KAU_MONTH, KAU_READY, kauOfMonth, kauOfTheme } from '../src/data/kau.mjs';
import { ALL_THEMES } from '../src/data/themes.mjs';
import soroeruPages from '../src/pages/soroeru.mjs';
import monthPages from '../src/pages/months.mjs';
import themePages from '../src/pages/theme.mjs';
import { GYOSHU } from '../src/data/gyoshu.mjs';
import SETSUBI from '../src/data/kihon/setsubi.mjs';

const NG = ['おすすめ', 'お得', '最安', '今すぐ', 'しましょう', 'ぜひ', '便利', '簡単', '安心', 'ポイント', 'コツ', '定価', '手遅れ'];

test('すべての物に、名前・さがす言葉・must がある。月の物はテーマと月が合う', () => {
  for (const [key, k] of Object.entries(KAU)) {
    assert.match(key, /^[a-z0-9]+$/, key);
    assert.ok(k.t && k.kw.length && k.must.length && Array.isArray(k.ng), key);
    if (k.sokutei) assert.ok(!k.month && !k.theme, key);
    else {
      const t = ALL_THEMES.find((x) => x.slug === k.theme);
      assert.ok(t, `${key}：テーマ ${k.theme} がない`);
      assert.equal(t.month, k.month, key);
    }
  }
  // 1つの月に1つ。3月と9月はなし
  assert.deepEqual(Object.keys(KAU_MONTH).map(Number).sort((a, b) => a - b), [1, 2, 4, 5, 6, 7, 8, 10, 11, 12]);
});

test('中身のある物：なぜ今か・選ぶときに見る所3つ・出典2つ以上・確認日から90日', () => {
  assert.deepEqual(KAU_READY.map((k) => k.key).sort(), Object.keys(KAU).sort(), 'どの物にも中身がある（#75）');
  for (const k of KAU_READY) {
    assert.ok(k.why && !k.why.endsWith('。'), `${k.key}：why（文末の「。」はページで足す）`);
    assert.equal(k.points.length, 3, k.key);
    assert.ok(k.src.length >= 2, k.key);
    for (const s of k.src) assert.ok(s.t && s.url.startsWith('https://'), k.key);
    const days = (Date.now() - Date.parse(`${k.checked}T00:00:00+09:00`)) / 86400000;
    assert.ok(days >= 0 && days <= 90, `${k.key}：確認日 ${k.checked} から ${Math.floor(days)} 日。出典を開いて確かめ直し、checked を直す`);
    const text = [k.why, ...k.points].join('');
    for (const w of NG) assert.ok(!text.includes(w), `${k.key}：使わない言葉「${w}」`);
    // なぜ今かの数字は、そのテーマのデータにある数字だけ（測る道具は知識のページ setsubi の数字）
    const data = k.sokutei ? JSON.stringify(SETSUBI) : JSON.stringify(ALL_THEMES.find((x) => x.slug === k.theme));
    for (const n of k.why.match(/[\d,]+(?:\.\d+)?/g) ?? []) assert.ok(data.includes(n), `${k.key}：数字 ${n} がテーマのデータにない`);
  }
  // 吐いた物の処理セットと保冷剤は病気を防ぐ・治すと書かない
  for (const k of [KAU.hakimono, KAU.horeizai]) assert.ok(!/防ぐ|防げ|治|予防/.test([k.why, ...k.points].join('')), k.t);
  // 消火器の設置の決まりは、なぜ今かに書かない（火事のテーマにある）
  assert.ok(!/設置|義務|置かなければ/.test(KAU.shokaki.why));
  // 出典の題に機種の型番を書かない
  for (const k of KAU_READY) for (const s of k.src) assert.ok(!/[A-Z]{1,4}-?\d{2,}[A-Z]*/.test(s.t.replace(/JIS [A-Z] \d+(-\d)?|EN388|ISO \d+|CO2|C 7612/g, '')), `${k.key}：型番 ${s.t}`);
});

const products = {
  fetchedAt: '2026-11-06T03:00:00Z',
  items: Object.fromEntries(KAU_READY.map((k) => [k.key, [1, 2, 3].map((i) => ({ code: `${k.key}${i}`, name: `見本の商品${i}`, price: 2480, url: `https://hb.afl.rakuten.co.jp/ichiba/x${i}/`, img: `https://thumbnail.image.rakuten.co.jp/x${i}.jpg`, shop: `S${i}` }))])),
};

test('物のページ：商品があるとき・ないとき（AdSense なし・楽天以外へのリンクなし）', () => {
  const withP = soroeruPages(ALL_THEMES, 12, products);
  const noP = soroeruPages(ALL_THEMES, 12, null);
  assert.deepEqual(withP.map((p) => p.path), ['/soroeru/', ...KAU_READY.map((k) => `/soroeru/${k.key}/`)]);
  for (const p of withP.slice(1)) {
    assert.ok(p.html.includes('<p class="pg-lead">広告　楽天アフィリエイトを利用しています</p>'));
    assert.equal((p.html.match(/rel="sponsored nofollow noopener" target="_blank"/g) || []).length, 3);
    assert.ok(p.html.includes('2,000円台') && p.html.includes('楽天市場で見る') && p.html.includes('2026年11月6日'));
    assert.ok(p.html.includes('Supported by Rakuten Developers'));
    assert.ok(!p.html.includes('adsbygoogle'));
    for (const m of p.html.matchAll(/href="(https?:[^"]+)"/g)) assert.match(m[1], /^https:\/\/([a-z0-9-]+\.)*(rakuten\.co\.jp|rakuten\.com|anzen-benricho\.com)\//);
    // 1画面めの順：見出し → 広告の1行 → なぜ今か → 選ぶときに見る所 → 商品 → クレジット → あわせて見る
    const at = (s) => p.html.indexOf(s);
    assert.ok(at('<h1') < at('楽天アフィリエイトを利用') && at('楽天アフィリエイトを利用') < at('id="sr-why"') && at('id="sr-why"') < at('id="sr-pt"') && at('id="sr-pt"') < at('id="sr-shop"') && at('id="sr-shop"') < at('Supported by') && at('Supported by') < at('id="sr-more"'));
  }
  for (const p of noP.slice(1)) {
    assert.ok(!p.html.includes('rows shop') && !p.html.includes('楽天アフィリエイトを利用') && !p.html.includes('Rakuten Developers'));
    assert.ok(!p.html.includes('adsbygoogle'));
  }
  // 3件に届かない物は商品の節を出さない
  const few = soroeruPages(ALL_THEMES, 12, { ...products, items: { ...products.items, daisha: products.items.daisha.slice(0, 2) } });
  assert.ok(!few.find((p) => p.path === '/soroeru/daisha/').html.includes('rows shop'));
  // minShow の物（吐いた物の処理セット）は2件でも出す。1件なら出さない
  const two = soroeruPages(ALL_THEMES, 12, { ...products, items: { ...products.items, hakimono: products.items.hakimono.slice(0, 2) } });
  assert.equal((two.find((p) => p.path === '/soroeru/hakimono/').html.match(/<li/g) || []).length >= 2, true);
  assert.ok(two.find((p) => p.path === '/soroeru/hakimono/').html.includes('rows shop'));
  const one = soroeruPages(ALL_THEMES, 12, { ...products, items: { ...products.items, hakimono: products.items.hakimono.slice(0, 1) } });
  assert.ok(!one.find((p) => p.path === '/soroeru/hakimono/').html.includes('rows shop'));
  // 目次は商品を出さないので AdSense はそのまま
  assert.ok(withP[0].html.includes('adsbygoogle') && !withP[0].html.includes('rows shop'));
});

test('月のページ：物のある月に「今月そろえる物」（文字のリンクだけ）、3月・9月・10月は出さない', () => {
  const pages = monthPages(ALL_THEMES, 12);
  for (const m of [12, 1, 2, 4, 5, 6, 7, 8, 11]) {
    const html = pages.find((p) => p.path === `/anzen/${m}/`).html;
    const k = kauOfMonth(m);
    assert.ok(html.includes('今月そろえる物') && html.includes(`<a href="/soroeru/${k.key}/">${k.t}</a>`), `${m}月`);
    assert.ok(!html.includes('rakuten'), `${m}月に楽天の商品やリンクがある`);
    assert.ok(html.includes('adsbygoogle'), `${m}月の AdSense はそのまま`);
  }
  // 10月は CO2モニターとつながる行がテーマにないのでリンクを出さない（monthLink: false）
  for (const m of [3, 9, 10]) assert.ok(!pages.find((p) => p.path === `/anzen/${m}/`).html.includes('今月そろえる物'), `${m}月`);
});

// #94：テーマのページと問題集から、そろえる物へ1行（文字のリンクだけ。AdSense はそのまま）
const relOf = (html) => html.match(/<section class="sec paper np" aria-labelledby="rel-h">[\s\S]*?<\/section>/)?.[0] ?? '';
const noShop = (html, at) => {
  assert.ok(!html.includes('rakuten') && !html.includes('楽天アフィリエイトを利用') && !html.includes('Rakuten Developers') && !html.includes('rows shop'), `${at}：楽天の商品やクレジットがある`);
  assert.ok(html.includes('adsbygoogle'), `${at}：AdSense のコードがない`);
};

// そろえる物のあとは、このページをつないだ読みもの（#98）だけ
test('テーマの入口と4業種のページ：あわせて見るの最後（読みものの前）に、そのテーマのそろえる物へ1行', () => {
  const withKau = new Set(KAU_READY.filter((k) => k.theme && k.monthLink !== false).map((k) => k.theme));
  for (const t of ALL_THEMES) {
    const k = kauOfTheme(t.slug);
    assert.equal(Boolean(k), withKau.has(t.slug), t.slug);
    const pages = themePages(t);
    assert.equal(pages.length, 1 + GYOSHU.length, t.slug);
    for (const p of pages) {
      const rel = relOf(p.html).replace(/<li><a href="\/yomimono\/[a-z0-9-]+\/">読みもの：[^<]*<\/a><\/li>/g, '');
      if (k) {
        const li = `<li><a href="/soroeru/${k.key}/">そろえる物：${k.t}</a></li></ul>`;
        assert.ok(rel.includes(li), `${p.path}：あわせて見るの最後に ${k.key} がない`);
        assert.equal(p.html.split(`href="/soroeru/${k.key}/"`).length - 1, 1, `${p.path}：リンクは1つだけ`);
      } else {
        assert.ok(!/href="\/soroeru\/[a-z0-9]+\/"/.test(p.html), `${p.path}：物のないテーマにそろえる物のリンクがある`);
      }
      noShop(p.html, p.path);
    }
  }
  // 10月の空気と換気（CO2モニターは monthLink: false）には出さない
  assert.equal(KAU.co2.monthLink, false);
  assert.equal(kauOfTheme('kanki'), null);
  // 測る道具（theme なし）は、どのテーマにも出ない
  for (const t of ALL_THEMES) for (const key of ['ondo', 'shodo']) if (KAU[key]) assert.ok(!themePages(t).some((p) => p.html.includes(`/soroeru/${key}/`)), `${t.slug}：${key}`);
});

test('問題集：月の節の「◯月号へ」の下に、その月のそろえる物へ1行', () => {
  const q = monthPages(ALL_THEMES, 12).find((p) => p.path === '/anzen/quiz/');
  assert.ok(q, '問題集のページがない');
  const secs = [...q.html.matchAll(/<section class="sec qz-s" aria-labelledby="qm-(\d+)">[\s\S]*?<\/section>/g)];
  assert.ok(secs.length > 0);
  for (const [sec, m] of secs) {
    const k = kauOfMonth(Number(m));
    const line = k ? `<p class="u-note"><a href="/anzen/${m}/">${m}月号へ</a></p>\n<p class="u-note"><a href="/soroeru/${k.key}/">そろえる物：${k.t}</a></p>\n</section>` : null;
    if (k) assert.ok(sec.includes(line), `${m}月：そろえる物の1行がない`);
    else assert.ok(!sec.includes('/soroeru/'), `${m}月：物のない月にリンクがある`);
  }
  // 物のある月（10月は monthLink: false でなし）のうち、問題集にある月はすべて出る
  const shown = secs.map(([, m]) => Number(m)).filter((m) => kauOfMonth(m));
  assert.ok(shown.length >= 9, `そろえる物の1行のある月が ${shown.length}`);
  assert.ok(!secs.some(([s, m]) => m === '10' && s.includes('/soroeru/')));
  noShop(q.html, '/anzen/quiz/');
});
