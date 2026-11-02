// 資格の更新：資格ごとの3ページ・期限の計算・出典と確認日
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icsLimit } from '../src/client/ics.mjs';
import { SHIKAKU, KOUSHIN_PAGES, SHIKAKU_CHECKED, BOUKA_CHECKED, koushinPath } from '../src/data/shikaku.mjs';
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
