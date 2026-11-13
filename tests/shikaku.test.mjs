// 資格の更新：資格ごとの3ページ・期限の計算・出典と確認日
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { icsLimit } from '../src/client/ics.mjs';
import { DAI_KEY, daiPut, daiDel, daiRows, daiLeft, daiName } from '../src/client/daicho.mjs';
import { SHIKAKU, KOUSHIN_PAGES, SHIKAKU_CHECKED, BOUKA_CHECKED, NITTEI_CHECKED, koushinPath } from '../src/data/shikaku.mjs';
import shikakuPages from '../src/pages/shikaku.mjs';

const day = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const lim = (key, y, m, d) => {
  const s = SHIKAKU.find((x) => x.key === key);
  return day(icsLimit(new Date(y, m - 1, d), s.years, s.count));
};
const within90 = (iso) => (Date.now() - Date.parse(iso + 'T00:00:00+09:00')) / 86400000 <= 90;
const NG = ['しましょう', 'ぜひ', '便利', '簡単', '安心', 'おすすめ', 'ポイント', 'コツ', '——'];

test('資格ごとのページが3つあり、入口とあわせて4ページ', () => {
  const paths = shikakuPages().map((p) => p.path);
  assert.deepEqual(paths, ['/shikaku/koushin/', '/shikaku/koushin/kantoku/', '/shikaku/koushin/byouin/', '/shikaku/koushin/bouka/']);
  for (const s of SHIKAKU) assert.ok(KOUSHIN_PAGES.some((p) => p.page === s.page), `${s.name} のページがない`);
});

test('防火・防災：修了した日以後の最初の4月1日から5年以内', () => {
  for (const k of ['kouhou', 'bousai']) {
    assert.equal(lim(k, 2020, 10, 1), '2026-03-31');
    assert.equal(lim(k, 2020, 4, 1), '2025-03-31');
    assert.equal(lim(k, 2021, 3, 31), '2026-03-31');
    assert.equal(lim(k, 2020, 4, 2), '2026-03-31');
  }
});

test('清掃の2つは修了した日から6年・4年（今と同じ答え）', () => {
  assert.equal(lim('kantoku', 2024, 4, 15), '2030-04-15');
  assert.equal(lim('byouin', 2024, 2, 29), '2028-02-29');
  assert.equal(lim('byouin', 2023, 2, 28), '2027-02-28');
});

test('資格ごとのページ：出典と確認日・中身がそろい、使わない言葉がない', () => {
  assert.ok(within90(SHIKAKU_CHECKED), `確認日 ${SHIKAKU_CHECKED}`);
  assert.ok(within90(BOUKA_CHECKED), `確認日 ${BOUKA_CHECKED}`);
  for (const p of KOUSHIN_PAGES) {
    assert.ok(p.src.length >= 2, `${p.page} の出典`);
    for (const s of p.src) assert.match(s.u, /^https:\/\//, s.t);
    assert.ok(within90(p.checked), `${p.page} の確認日`);
    assert.match(p.h1, /再講習はいつまで？$/);
    assert.ok(p.lead.length <= 22, `${p.page} の1行が長い`);
    assert.ok(p.faq.length >= 3 && p.faq.length <= 4, `${p.page} のよくある質問`);
    assert.ok(p.rules.length >= 4, `${p.page} の更新の決まり`);
    const text = JSON.stringify([p.rules, p.kata, p.memo, p.faq, p.title, p.h1, p.lead, p.note || '']);
    for (const w of NG) assert.ok(!text.includes(w), `${p.page} に「${w}」`);
  }
});

test('資格ごとのページ：本文（右の柱をのぞく）は800字以上・1画面めは計算まで', () => {
  for (const pg of shikakuPages().slice(1)) {
    const main = pg.html.split('<main')[1].split('</main>')[0].replace(/<aside class="rail">[\s\S]*?<\/aside>/, '').replace(/<script[\s\S]*?<\/script>/g, '');
    const text = main.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    assert.ok(text.length >= 800, `${pg.path} の本文 ${text.length}字`);
    // 計算の紙が見出しのすぐあと（ほかの節より前）
    assert.ok(main.indexOf('id="ks-h"') < main.indexOf('id="rule-h"'), pg.path);
    assert.ok(!main.includes('type="radio"'), `${pg.path} で資格をえらばせない`);
    assert.ok(main.includes(`data-url="https://anzen-benricho.com${pg.path}"`) || main.includes(`${pg.path}"`), pg.path);
  }
});

test('入口：4つの資格をえらべて、各ページへリンクし、題の頭は変えない', () => {
  const [hub] = shikakuPages();
  assert.equal((hub.html.match(/type="radio" name="k"/g) || []).length, 4);
  for (const p of KOUSHIN_PAGES) assert.ok(hub.html.includes(`href="${koushinPath(p.page)}"`), p.page);
  assert.match(hub.html, /<title>清掃作業監督者・病院清掃受託責任者/);
  assert.ok(!hub.html.includes('講義のまとめの小テスト'), '経験の文は byouin のページへ');
});

test('再講習の日程と受講料：4項目（いつ・どこで・受講料・申し込み）と主催・出典・確認日がそろい、計算のすぐ下にある', () => {
  assert.ok(within90(NITTEI_CHECKED), `確認日 ${NITTEI_CHECKED}`);
  const pages = shikakuPages();
  for (const p of KOUSHIN_PAGES) {
    const n = p.nittei;
    assert.ok(n, `${p.page} に日程と受講料がない`);
    for (const f of ['shusai', 'itsu', 'doko', 'ryokin', 'moushikomi', 'desc']) assert.ok(n[f] && n[f].trim(), `${p.page} の ${f}`);
    assert.match(n.ryokin, /[\d,]+円/, `${p.page} の受講料に額がない`);
    assert.ok(n.src.length >= 1, `${p.page} の日程の出典`);
    for (const s of n.src) assert.match(s.u, /^https:\/\//, s.t);
    assert.ok(within90(n.checked), `${p.page} の日程の確認日`);
    const text = JSON.stringify(n);
    for (const w of NG) assert.ok(!text.includes(w), `${p.page} の日程に「${w}」`);
    const main = pages.find((x) => x.path === koushinPath(p.page)).html.split('<main')[1];
    const at = main.indexOf('id="nt-h"');
    assert.ok(at > main.indexOf('id="ks-h"') && at < main.indexOf('id="rule-h"'), `${p.page} の表は計算のすぐ下`);
    for (const k of ['主催', 'いつ', 'どこで（形）', '受講料', '申し込み', '出典', '確認日']) assert.ok(main.includes(`<dt>${k}</dt>`), `${p.page} の表に ${k}`);
    for (const s of n.src) assert.ok(main.includes(`href="${s.u}"`), `${p.page} の表に出典のリンク`);
    assert.ok(!JSON.stringify(p.kata).includes('年度で変わるので'), `${p.page} の申し込みの文`);
  }
  // 入口：4つの資格を1行ずつ
  const hub = pages[0].html.split('<main')[1];
  const nt = hub.slice(hub.indexOf('id="nt-h"'), hub.indexOf('</section>', hub.indexOf('id="nt-h"')));
  assert.equal((nt.match(/<dt>/g) || []).length, SHIKAKU.length);
  for (const s of SHIKAKU) assert.ok(s.ichi && /円/.test(s.ichi) && nt.includes(s.ichi.replace(/&/g, '&amp;')), `${s.name} の1行`);
  assert.ok(hub.indexOf('id="nt-h"') > hub.indexOf('id="ks-h"') && hub.indexOf('id="nt-h"') < hub.indexOf('id="rule-h"'), '入口の表は計算のすぐ下');
});

test('題と説明文：はじめに日程・受講料のことがある', () => {
  for (const pg of shikakuPages()) {
    const title = pg.html.match(/<title>([^<]*)/)[1];
    const desc = pg.html.match(/<meta name="description" content="([^"]*)">/)[1];
    assert.match(title, /再講習｜/, pg.path);
    assert.match(title, /受講料/, pg.path);
    assert.match(desc.split('。')[0] + desc.split('。')[1], /[\d,]+円/, `${pg.path} のはじめに受講料`);
    assert.match(desc, /日付から.*期限を計算します。/, pg.path);
  }
});

// 資格の期限の台帳（#102）
const q = (key) => {
  const s = SHIKAKU.find((x) => x.key === key);
  return { k: s.key, s: s.name, years: s.years, count: s.count };
};

test('台帳：キーは anzen-shikaku-v1。いまの koushin のキーとはべつ', () => {
  assert.equal(DAI_KEY, 'anzen-shikaku-v1');
  assert.notEqual(DAI_KEY, 'koushin');
  const js = readFileSync(new URL('../src/client/koushin.js', import.meta.url), 'utf8');
  assert.ok(js.includes("localStorage.setItem('koushin'"), 'koushin のキーはそのまま');
});

test('台帳：入れたものを送らない（通信の関数を使わない）', () => {
  for (const f of ['src/client/daicho.mjs', 'src/client/daicho.js']) {
    const js = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    for (const w of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'navigator.share', '.submit(', 'new Image', 'innerHTML']) assert.ok(!js.includes(w), `${f} に ${w}`);
  }
});

test('台帳：期限の近い順。過ぎた行は「期限切れ」で残る。消せる', () => {
  let l = daiPut([], 'Aさん', q('kantoku'), '2024-04-15');
  l = daiPut(l, 'Bさん', q('byouin'), '2023-02-28');
  l = daiPut(l, 'Cさん', q('byouin'), '2019-05-01');
  const today = new Date(2026, 10, 14);
  const rows = daiRows(l, today);
  assert.deepEqual(rows.map((x) => x.who), ['Cさん', 'Bさん', 'Aさん']);
  assert.deepEqual(rows.map((x) => x.r.lim), ['2023-05-01', '2027-02-28', '2030-04-15']);
  assert.ok(rows[0].left < 0);
  assert.equal(daiLeft(rows[0].left), '期限切れ');
  assert.equal(daiLeft(0), '今日まで');
  assert.equal(daiLeft(rows[1].left), '106日');
  const left = daiDel(l, rows[0].r.id);
  assert.deepEqual(daiRows(left, today).map((x) => x.who), ['Bさん', 'Aさん']);
});

test('台帳：同じ呼び名・同じ資格は上書き。資格がちがえば足す。呼び名が空の行は足して番号で出す', () => {
  let l = daiPut([], 'Aさん', q('kantoku'), '2020-04-15');
  l = daiPut(l, 'Aさん', q('kantoku'), '2024-04-15');
  assert.equal(l.length, 1);
  assert.equal(l[0].lim, '2030-04-15');
  l = daiPut(l, 'Aさん', q('byouin'), '2024-04-15');
  assert.equal(l.length, 2);
  l = daiPut(l, '', q('kantoku'), '2025-01-10');
  l = daiPut(l, ' ', q('kantoku'), '2025-02-10');
  assert.equal(l.length, 4);
  const who = daiRows(l, new Date(2026, 10, 14)).filter((x) => !x.r.n).map((x) => x.who);
  assert.deepEqual(who, ['1人目', '2人目']);
  assert.equal(daiPut(l, 'Dさん', q('kantoku'), ''), l, '日付がなければ足さない');
  assert.equal(daiName('あいうえおかきくけこさ'), 'あいうえおかきくけこ');
});

test('台帳：防火・防災の4月1日の数え方が計算と同じ', () => {
  for (const k of ['kouhou', 'bousai']) {
    for (const [d, want] of [['2020-10-01', '2026-03-31'], ['2020-04-01', '2025-03-31'], ['2021-03-31', '2026-03-31'], ['2020-04-02', '2026-03-31']]) {
      const [y, m, dd] = d.split('-').map(Number);
      assert.equal(daiPut([], 'X', q(k), d)[0].lim, want, `${k} ${d}`);
      assert.equal(lim(k, y, m, dd), want);
    }
  }
});

test('台帳：入口だけに節とボタン。呼び名の欄は text・10字まで。0件は見出しと1行', () => {
  const [hub, ...rest] = shikakuPages();
  const main = hub.html.split('<main')[1];
  assert.ok(main.includes('id="db-h"') && main.indexOf('id="db-h"') > main.indexOf('id="ks-h"') && main.indexOf('id="db-h"') < main.indexOf('id="nt-h"'));
  assert.match(main, /<input id="k-who" type="text" inputmode="text" maxlength="10"/);
  assert.ok(main.includes('id="k-save"'));
  assert.ok(hub.html.includes('anzen-shikaku-v1'), 'ページに台帳の部品');
  assert.ok(!hub.html.includes('import {'), 'import の行はページに入れない');
  for (const p of rest) assert.ok(!p.html.includes('id="db-h"') && !p.html.includes('anzen-shikaku-v1'), `${p.path} には台帳を入れない`);
});
