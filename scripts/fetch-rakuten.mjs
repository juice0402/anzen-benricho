// 楽天市場から、そろえる物のページ（/soroeru/<key>/）に出す商品を取る（GitHub Actions で、ビルドの前に毎回。#66）
// 物ごとに：src/data/kau.mjs の kw で商品検索（レビューが多い順・買えるものだけ・画像あり）→ 条件に合うものを3つ（src/rakuten.mjs の pick）
// このリポジトリは公開なので、取ったものは data/rakuten/（.gitignore）に置くだけ。商品名などはログに出さない（呼び出しの回数と件数だけ）
// キーがない（Secrets のない PR・手元）：取らずに終わる（商品の節を出さずにビルドする）。REQUIRE_RAKUTEN=1（main・作り直し）のときは止める
// 取れない・3件以上の物が半分より少ない：止める（終了コード 1）→ 公開しない（前の公開がそのまま残る）。3件に届かない物は空にする（その物の商品の節だけ出さない）

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { KAU_READY } from '../src/data/kau.mjs';
import { cleanKeys, searchUrl, parseItems, pick, fits, HEADERS, PRODUCTS_PATH, SHOW, reviewOk } from '../src/rakuten.mjs';

const keys = cleanKeys(process.env);
const note = (level, msg) => {
  console.log(msg);
  if (process.env.GITHUB_ACTIONS) console.log(`::${level} title=楽天の商品::${msg}`);
};
if (!keys.appId || !keys.accessKey || !keys.affiliateId) {
  if (process.env.REQUIRE_RAKUTEN === '1') {
    note('error', '楽天のキー（RAKUTEN_APPLICATION_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_AFFILIATE_ID）がありません');
    process.exit(1);
  }
  console.log('楽天のキーがないので、商品は取りません（商品の節を出さずにビルドします）');
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
let calls = 0;
// 1.1秒以上あけて呼ぶ。混んでいる（429・5xx）ときは待って3回まで。404（なし）は空で返す
async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const wait = last + 1100 - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    calls++;
    const res = await fetch(url, { headers: HEADERS });
    const text = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await sleep(5000 * attempt);
      continue;
    }
    if (res.status === 404) return [];
    if (!res.ok) {
      // 本文には商品の情報が入らない（エラーの説明だけ）。念のため英数字の長い並びは伏せる
      const hint = /SCOPES_NOT_ALLOWED/.test(text) ? '（楽天のアプリで楽天市場APIが許可されていません）' : /REFERRER|referer|Referer/.test(text) ? '（許可されたWebサイトを確かめてください）' : /applicationId|accessKey|wrong_parameter|invalid/i.test(text) ? '（キーを確かめてください）' : '';
      throw new Error(`HTTP ${res.status}${hint} ${text.slice(0, 120).replace(/[A-Za-z0-9_-]{20,}/g, '…').replace(/\s+/g, ' ')}`);
    }
    return parseItems(JSON.parse(text));
  }
  throw new Error('楽天APIが混んでいて取れませんでした');
}

const out = {};
const counts = [];
try {
  for (const k of KAU_READY) {
    const found = [];
    for (const kw of k.kw) found.push(...(await get(searchUrl(keys, kw))));
    const list = pick(found, k, SHOW);
    out[k.key] = list.length >= SHOW ? list : [];
    // 3件に届かないときは、言葉を直す手がかりに数だけ出す（検索の結果・must に合う・条件に合う・お店の数。商品名は出さない）
    if (list.length < SHOW) {
      const must = found.filter((x) => (k.must ?? []).some((w) => x.name.includes(w)));
      const ok = found.filter((x) => fits(x, k));
      const rv = must.filter((x) => reviewOk(x, k));
      counts.push(`${k.key} ${list.length}件（結果${found.length}・must${must.length}・レビュー${rv.length}・条件${ok.length}・お店${new Set(ok.map((x) => x.shop)).size}）`);
    } else counts.push(`${k.key} ${list.length}件`);
  }
} catch (e) {
  note('error', `取れませんでした：${String(e.message ?? e).slice(0, 200)}`);
  process.exit(1);
}

// 見張り：商品が3件ある物が半分より少なければ、楽天の仕様が変わったなどと考えて止める
const enough = Object.values(out).filter((l) => l.length >= SHOW).length;
if (enough < Math.ceil(KAU_READY.length / 2)) {
  note('error', `商品が少なすぎます（呼び出し ${calls}回：${counts.join('・')}）`);
  process.exit(1);
}
mkdirSync(dirname(PRODUCTS_PATH), { recursive: true });
writeFileSync(PRODUCTS_PATH, JSON.stringify({ fetchedAt: new Date().toISOString(), items: out }));
note('notice', `呼び出し ${calls}回：${counts.join('・')}`);
