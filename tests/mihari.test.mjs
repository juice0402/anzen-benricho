// 見張り（scripts/mihari.mjs）の判定。外のページと GitHub にはつながない
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  jstToday, addDays, daysBetween, inPeriod, recentMonths, norm, htmlText, pageLinks, decodeBody, getPage, makeCtx,
  CHECKED_RE, oldestChecked, watchC, isA, titleA, isB1, isD, titleE, isE, titleF, isF, isFCampaign, pickG,
  WATCHES, decide, reporter, RUNS, classify, cut, failBody, failedSteps, updateState, longFails, runWatches, FOOTER,
  notedToday, closedAfter, pickLatest, judge,
} from '../scripts/mihari.mjs';

const W = Object.fromEntries(WATCHES.map((w) => [w.id, w]));
const res = (status, body = '', ctype = 'text/html; charset=UTF-8') => new Response(body, { status, headers: { 'content-type': ctype } });
// URL → HTML の偽の fetch（ないものは 404）
const fakeFetch = (pages) => async (url) => (url in pages ? (pages[url] instanceof Error ? Promise.reject(pages[url]) : res(200, pages[url])) : res(404));
const ctxOf = (today, pages) => makeCtx({ today, fetchImpl: fakeFetch(pages), wait: 0, log: () => {} });
const pressUrl = (ym) => `https://www.mhlw.go.jp/stf/houdou/houdou_list_${ym}.html`;
const pressHtml = (items) => `<html><body><h3>2026年11月4日（火）掲載</h3><ul>${items.map(([href, t]) => `<li><a href="${href}">${t}</a></li>`).join('')}</ul><a href="/stf/seisakunitsuite/index.html">政策について</a></body></html>`;

test('日付：日本時間・期間・今月と先月', () => {
  assert.equal(jstToday(new Date('2026-11-01T15:30:00Z')), '2026-11-02');
  assert.equal(jstToday(new Date('2026-11-01T14:59:00Z')), '2026-11-01');
  assert.equal(addDays('2026-10-22', 90), '2027-01-20');
  assert.equal(daysBetween('2026-12-30', '2027-01-20'), 21);
  assert.ok(inPeriod('2027-01-31', ['2026-10-27', '2027-01-31']));
  assert.ok(!inPeriod('2027-02-01', ['2026-10-27', '2027-01-31']));
  assert.deepEqual(recentMonths('2027-01-05'), ['202701', '202612']);
  assert.deepEqual(recentMonths('2026-11-02'), ['202611', '202610']);
});

test('ページの文字：全角をそろえる・リンク・Shift_JIS', () => {
  assert.equal(norm('第３回「化学物質管理強調月間」を２月に実施&amp;'), '第3回「化学物質管理強調月間」を2月に実施&');
  assert.equal(htmlText('<p>令和８年度<script>x="令和9年度"</script>\n<b>全国</b></p>'), '令和8年度 全国');
  const ls = pageLinks('<a class="x" href="/stf/newpage_1.html"><span>第３回</span> 月間</a><a href="mailto:a">b</a>', 'https://www.mhlw.go.jp/stf/houdou/houdou_list_202611.html');
  assert.deepEqual(ls[0], { url: 'https://www.mhlw.go.jp/stf/newpage_1.html', text: '第3回 月間' });
  const sjis = new Uint8Array([0x3c, 0x6d, 0x65, 0x74, 0x61, 0x20, 0x63, 0x68, 0x61, 0x72, 0x73, 0x65, 0x74, 0x3d, 0x22, 0x53, 0x68, 0x69, 0x66, 0x74, 0x5f, 0x4a, 0x49, 0x53, 0x22, 0x3e, 0x97, 0xdf, 0x98, 0x61]);
  assert.match(decodeBody(sjis, 'text/html'), /令和$/);
});

test('外のページ：404 は「まだない」、つながらないは1回やり直して失敗', async () => {
  let n = 0;
  const flaky = async () => { n++; throw Object.assign(new Error('x'), { cause: { code: 'ECONNRESET' } }); };
  const r = await getPage('https://example.jp/', { fetchImpl: flaky, wait: 0 });
  assert.equal(n, 2);
  assert.deepEqual([r.ok, r.missing], [false, false]);
  assert.match(r.why, /ECONNRESET/);
  const m = await getPage('https://example.jp/', { fetchImpl: async () => res(404), wait: 0 });
  assert.deepEqual([m.ok, m.missing], [false, true]);
  const ctx = makeCtx({ today: '2026-11-02', fetchImpl: async (u) => (u.includes('ng') ? res(503) : res(404)), wait: 0, log: () => {} });
  await ctx.page('https://example.jp/ng');
  await ctx.page('https://example.jp/none');
  assert.deepEqual([...ctx.failed.keys()], ['https://example.jp/ng']);
  const st = updateState({ 'https://example.jp/ng': '2026-10-27', 'https://old.example.jp/': '2026-10-01' }, ctx, '2026-11-02');
  assert.deepEqual(st, { 'https://example.jp/ng': '2026-10-27' });
  assert.equal(longFails(st, '2026-11-02').length, 1);
  assert.equal(longFails(st, '2026-11-01').length, 0);
});

test('C：いちばん古い確認日・90日の期限が21日以内で issue', () => {
  const files = [
    { path: 'src/data/a.mjs', text: "export const X = { checked: '2026-10-23' };" },
    { path: 'src/data/hourei.mjs', text: "export const HOUREI_CHECKED = '2026-10-22';\nconst y = { checked:'2026-11-01' }" },
    { path: 'src/data/kihon/b.mjs', text: "SHIKAKU_CHECKED='2026-10-22'; // checked 2025-01-01 は形が違うので数えない" },
  ];
  assert.equal([...files[1].text.matchAll(CHECKED_RE)].length, 2);
  const o = oldestChecked(files);
  assert.deepEqual(o, { date: '2026-10-22', where: ['src/data/hourei.mjs', 'src/data/kihon/b.mjs'] });
  assert.equal(watchC(o, '2026-12-29').hit, false);
  const c = watchC(o, '2026-12-30');
  assert.equal(c.hit, true);
  assert.equal(c.title, '【夜】確認日の確かめ直し（2027-01-20 まで）');
  assert.match(c.body, /確認日（checked・HOUREI_CHECKED）が 2026-12-06 より前のもの全部/);
  assert.match(c.body, /^- やること：テストが止まる前に/);
  assert.match(c.body, /- マージ：する\n\n見張りが見つけたこと：いちばん古い確認日 2026-10-22（src\/data\/hourei\.mjs・src\/data\/kihon\/b\.mjs）。期限 2027-01-20（あと 21 日）。$/);
  assert.equal(watchC({ date: null, where: [] }, '2026-12-30'), null);
});

test('A：第3回の実施要綱が出たときだけ（スローガンの募集では出ていない）', async () => {
  assert.ok(!titleA('第３回「化学物質管理強調月間」のスローガンを募集します'.normalize('NFKC')));
  assert.ok(titleA('第3回「化学物質管理強調月間」を2月に実施'));
  assert.ok(isA(norm('第２回… （別添）第３回化学物質管理強調月間実施要綱［235KB］')));
  assert.ok(!isA(norm('（別添）第２回化学物質管理強調月間実施要綱［235KB］')));
  assert.ok(!isA('第3回化学物質管理強調月間のスローガン募集要領'));
  const slogan = 'https://www.mhlw.go.jp/stf/newpage_75410.html';
  const jisshi = 'https://www.mhlw.go.jp/stf/newpage_77000.html';
  // まだ：一覧にはスローガンの募集だけ
  let ctx = ctxOf('2026-11-02', { [pressUrl('202610')]: pressHtml([['/stf/newpage_75410.html', '第３回「化学物質管理強調月間」のスローガンを募集します']]), [slogan]: '<h1>第３回</h1>募集要領' });
  assert.equal(await W.A.find(ctx), null);
  // 出た：今月の一覧に実施の発表、ページに要綱
  ctx = ctxOf('2026-11-02', { [pressUrl('202611')]: pressHtml([['/stf/newpage_77000.html', '第３回「化学物質管理強調月間」を２月に実施']]), [jisshi]: '<a href="/content/x.pdf">（別添）第３回化学物質管理強調月間実施要綱［240KB］</a>' });
  const hit = await W.A.find(ctx);
  assert.equal(hit.url, jisshi);
  // ページに要綱がなければ出ていない
  ctx = ctxOf('2026-11-02', { [pressUrl('202611')]: pressHtml([['/stf/newpage_77000.html', '第３回「化学物質管理強調月間」を２月に実施']]), [jisshi]: '<p>準備中</p>' });
  assert.equal(await W.A.find(ctx), null);
  const body = W.A.body(hit);
  assert.match(body, /見張りが見つけた要綱：https:\/\/www\.mhlw\.go\.jp\/stf\/newpage_77000\.html\n- 分け方：/);
  assert.equal(W.A.title, '【夜】2月 化学物質管理強調月間のテーマ「洗剤と薬品のラベルを確かめる」');
});

test('B1：定期健康診断結果報告書の様式の注記が令和8年以降になる・クレアチニンが出る', async () => {
  // 2026-11-02 に Actions で取った本物の形（表の行の中に「（定期健康診断結果報告書はインターネット上で…）」がある）
  const now = norm('各種健康診断結果報告書 定期健康診断結果報告書様式（定期健康診断結果報告書はインターネット上で作成できるようになりました。詳しくは本ページ下をご覧ください。） ※令和４年10月１日に様式が改正されました 有害な業務に係る歯科健康診断結果報告書様式 ※令和４年10月１日に様式が新しく定められました 電離放射線健康診断結果報告書様式 ※令和３年４月１日に様式が改正されました 定期健康診断結果報告書の入力支援サービス');
  assert.ok(!isB1(now));
  assert.ok(isB1(now.replace('令和4年10月1日に様式が改正', '令和9年4月1日に様式が改正')));
  assert.ok(isB1(now + ' 血清クレアチニン'));
  assert.ok(isB1(now.replace('※令和4年10月1日に様式が改正されました', '※令和9年4月1日から新しい様式になります')));
  assert.ok(!isB1(now + ' 令和8年5月1日 入力支援サービスを更新しました'));
  assert.ok(!isB1(now.replace('電離放射線健康診断結果報告書様式 ※令和3年', '電離放射線健康診断結果報告書様式 ※令和9年')));
  const url = 'https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei36/18.html';
  assert.equal(await W.B1.find(ctxOf('2026-11-02', { [url]: `<p>${now}</p>` })), null);
  const hit = await W.B1.find(ctxOf('2026-11-02', { [url]: '<td>定期健康診断結果報告書様式</td><td>※令和９年４月１日に様式が改正されます</td>' }));
  assert.equal(hit.url, url);
  assert.match(W.B1.body(hit), /厚労省が出した 新しい結果報告の様式（名前・番号・使い始める日） を足す/);
  assert.match(W.B1.body(hit), /見張りが見つけたページ：https:\/\/www\.mhlw\.go\.jp\/bunya\/roudoukijun\/anzeneisei36\/18\.html\n- マージ：する$/);
});

test('D：令和8年度の自殺対策強化月間のページ', async () => {
  const r8 = 'https://www.mhlw.go.jp/stf/r8_jisatsutaisakugekkan.html';
  assert.equal(await W.D.find(ctxOf('2027-02-20', {})), null);
  assert.equal(await W.D.find(ctxOf('2027-02-20', { [r8]: '<h1>３月は「自殺対策強化月間」です</h1>令和７年度の取組' })), null);
  const hit = await W.D.find(ctxOf('2027-02-20', { [r8]: '<h1>３月は「自殺対策強化月間」です</h1><p>令和８年度の取組</p>' }));
  assert.equal(hit.url, r8);
  // ページの名前が変わっても、報道発表の一覧から見つける
  const alt = 'https://www.mhlw.go.jp/stf/newpage_80000.html';
  const hit2 = await W.D.find(ctxOf('2027-03-01', { [pressUrl('202702')]: pressHtml([['/stf/newpage_80000.html', '３月は「自殺対策強化月間」です']]), [alt]: '令和８年度 自殺対策強化月間' }));
  assert.equal(hit2.url, alt);
  assert.match(W.D.body(hit), /^- やること：src\/data\/kokoro\.mjs の出典 「厚生労働省 自殺対策強化月間」（https:\/\/www\.mhlw\.go\.jp\/stf\/r7_jisatsutaisakugekkan\.html） を新しい版 https:\/\/www\.mhlw\.go\.jp\/stf\/r8_jisatsutaisakugekkan\.html に差しかえ/);
});

test('E：令和9年度の全国労働衛生週間（スローガンの募集・決定では出ていない）', async () => {
  assert.ok(titleE(norm('令和９年度「全国労働衛生週間」を10月に実施')));
  assert.ok(!titleE(norm('令和８年度「全国労働衛生週間」を10月に実施')));
  assert.ok(!titleE('令和9年度全国労働衛生週間のスローガンを募集します'));
  assert.ok(isE(norm('令和９年度「全国労働衛生週間」を10月に実施 令和９年度全国労働衛生週間　実施要領［335KB］')));
  assert.ok(!isE('令和9年度 全国労働衛生週間 スローガン'));
  const u = 'https://www.mhlw.go.jp/stf/newpage_90000.html';
  const hit = await W.E.find(ctxOf('2027-08-01', { [pressUrl('202707')]: pressHtml([['https://www.mhlw.go.jp/stf/newpage_90000.html', '令和９年度「全国労働衛生週間」を10月に実施']]), [u]: '<h1>令和９年度「全国労働衛生週間」を10月に実施</h1><a>令和９年度全国労働衛生週間　実施要領</a>' }));
  assert.equal(hit.url, u);
  assert.equal(await W.E.find(ctxOf('2027-08-01', { [pressUrl('202707')]: pressHtml([['/stf/newpage_74929.html', '令和８年度「全国労働衛生週間」を10月に実施']]) })), null);
});

test('F：令和9年の過重労働解消キャンペーン', async () => {
  assert.ok(titleF('11月は「過労死等防止啓発月間」です'));
  assert.ok(!titleF('令和8年度過重労働解消キャンペーンの重点監督の実施結果を公表します'));
  assert.ok(isF(norm('令和９年11月の月間でも「過重労働解消キャンペーン」を実施')));
  assert.ok(!isF(norm('令和８年11月の月間でも「過重労働解消キャンペーン」を実施')));
  assert.ok(isFCampaign(norm('実施期間　令和９年11月１日（月）から11月30日（火）まで')));
  assert.ok(!isFCampaign(norm('実施期間　令和８年11月１日（日）から11月30日（月）まで')));
  const camp = 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/roudoukijun/campaign_00004.html';
  assert.equal(await W.F.find(ctxOf('2027-10-05', { [camp]: '実施期間　令和８年11月１日（日）から' })), null);
  assert.equal((await W.F.find(ctxOf('2027-10-05', { [camp]: '実施期間　令和９年11月１日（月）から' }))).url, camp);
  const pr = 'https://www.mhlw.go.jp/stf/newpage_95000.html';
  const hit = await W.F.find(ctxOf('2027-10-08', { [pressUrl('202710')]: pressHtml([['/stf/newpage_95000.html', '11月は「過労死等防止啓発月間」です']]), [pr]: '令和９年11月の月間でも「過重労働解消キャンペーン」を実施' }));
  assert.equal(hit.url, pr);
  assert.match(W.F.body(hit), /直したファイルの checked を今日に。令和8年度の過労死等の労災補償状況・監督指導の結果が出ていれば、memo の数字もそれに直す。\n/);
});

test('G：消防庁の令和9年秋季全国火災予防運動の通知（長官通知を先に）', async () => {
  const base = 'https://www.fdma.go.jp/laws/tutatsu/2027/';
  const html = (y) => `<ul><li><a href="items/2027_09_06_yobo2.pdf">消防予第400号　令和${y}年秋季全国火災予防運動の実施について（予防課長通知）（令和${y}年９月６日）<img src="/icon-pdf.svg" alt=""></a></li><li><a href="https://www.fdma.go.jp/laws/tutatsu/items/2027_09_06_yobo1.pdf">消防予第397号　令和${y}年秋季全国火災予防運動の実施について（消防庁長官通知）（令和${y}年９月６日）</a></li></ul>`;
  assert.equal(await W.G.find(ctxOf('2027-09-01', {})), null);
  assert.equal(await W.G.find(ctxOf('2027-09-10', { [base]: html('８') })), null);
  const hit = await W.G.find(ctxOf('2027-09-10', { [base]: html('９') }));
  assert.equal(hit.url, 'https://www.fdma.go.jp/laws/tutatsu/items/2027_09_06_yobo1.pdf');
  assert.equal(pickG([{ url: 'a', text: '令和9年秋季全国火災予防運動の実施について(予防課長通知)' }]).url, 'a');
  assert.match(W.G.body(hit), /^- やること：src\/data\/kasai\.mjs（undo の span「令和8年11月9日〜15日」・朝礼の「11月9日から15日」） の出典/);
});

test('見る期間と題（予約タスクの題のまま）', () => {
  assert.deepEqual(WATCHES.map((w) => [w.id, w.period.join('〜')]), [
    ['A', '2026-10-27〜2027-01-31'], ['B1', '2026-10-27〜2027-06-30'], ['D', '2027-02-01〜2027-03-20'],
    ['E', '2027-05-15〜2027-08-31'], ['F', '2027-10-01〜2027-11-10'], ['G', '2027-08-15〜2027-10-31'],
  ]);
  for (const w of WATCHES) {
    assert.match(w.title, /^【夜】/);
    const b = w.body({ url: 'https://example.jp/x', what: 'x' });
    for (const k of ['- やること：', '- できあがりの条件：', '- 決まったこと', '- 迷ったら：', '- 読むファイル：', '- マージ：する']) assert.ok(b.includes(k), `${w.id} ${k}`);
    assert.ok(b.includes('https://example.jp/x'), `${w.id} 見つけた URL`);
    assert.ok(!/<見つけた URL>|<ファイル>|<いまの出典の題>/.test(b), w.id);
  }
});

test('issue：同じ題があれば作らない（night は閉じたものも）・コメントはその日1回', async () => {
  const issues = [{ number: 5, title: 'T', state: 'closed' }, { number: 6, title: 'U', state: 'open' }];
  assert.equal(decide(issues, 'T', 'night').act, 'skip');
  assert.equal(decide(issues, 'T', 'mihari').act, 'create');
  assert.equal(decide(issues, 'U', 'night').act, 'comment');
  assert.equal(decide(issues, 'V', 'night').act, 'create');
  const calls = [];
  let comments = [];
  const api = {
    ensureLabel: async (n) => calls.push(['label', n]),
    create: async (t, b, l) => { calls.push(['create', t, b, l]); return { number: 9 }; },
    comments: async () => comments,
    comment: async (n, b) => calls.push(['comment', n, b]),
    close: async (n) => calls.push(['close', n]),
  };
  const rep = reporter({ api, issues, dry: false, runUrl: 'https://github.com/r/actions/runs/1', today: '2026-11-02', log: () => {} });
  await rep.open({ title: 'V', body: 'B', label: 'night' });
  assert.deepEqual(calls.slice(0, 2), [['label', 'night'], ['create', 'V', `B\n\n${FOOTER}`, 'night']]);
  await rep.open({ title: 'V', body: 'B', label: 'night' }); // 作った日（created_at）が today とちがえばコメント
  assert.deepEqual(calls[2], ['comment', 9, 'まだ続いている（https://github.com/r/actions/runs/1）']);
  comments = [{ body: 'まだ続いている（x）', created_at: '2026-11-01T21:00:00Z' }];
  await rep.open({ title: 'U', body: 'B', label: 'mihari' });
  assert.equal(calls.length, 3, 'その日コメント済みなら足さない');
  await rep.resolve('U', 'https://github.com/r/actions/runs/2');
  assert.deepEqual(calls.slice(3), [['comment', 6, '直った（https://github.com/r/actions/runs/2）'], ['close', 6]]);
  const logs = [];
  const dry = reporter({ api: {}, issues: [], dry: true, runUrl: 'u', today: '2026-11-02', log: (s) => logs.push(s) });
  await dry.open({ title: 'W', body: 'B', label: 'night' });
  assert.match(logs[0], /^\[dry_run\] 作る（ラベル night）：W\nB\n\n見張り（\.github\/workflows\/mihari\.yml）が作った/);
});

test('公開・作り直し・出典の点検：失敗の本文', () => {
  assert.deepEqual(['success', 'failure', 'timed_out', 'cancelled', 'skipped'].map(classify), ['ok', 'ng', 'ng', 'ignore', 'ignore']);
  assert.deepEqual(RUNS['.github/workflows/deploy.yml'].events, ['push', 'schedule', 'workflow_dispatch']);
  assert.ok(!RUNS['.github/workflows/check-sources.yml'].events.includes('pull_request'));
  assert.match(RUNS['.github/workflows/deploy.yml'].what('schedule'), /毎月1日と15日/);
  const jobs = [
    { id: 1, name: 'build-deploy', conclusion: 'failure', steps: [{ name: 'テスト', conclusion: 'failure' }, { name: 'ビルド', conclusion: 'skipped' }] },
    { id: 2, name: 'other', conclusion: 'success', steps: [] },
    { id: 3, name: 'slow', conclusion: 'timed_out', steps: [] },
  ];
  assert.deepEqual(failedSteps(jobs), ['ジョブ「build-deploy」のステップ「テスト」', 'ジョブ「slow」']);
  assert.equal([...cut('あ'.repeat(300))].length, 200);
  const b = failBody({ what: 'X が失敗した。', when: '2026-11-02 05:41', url: 'https://github.com/r/actions/runs/1', steps: failedSteps(jobs), notes: ['a', 'b', 'c', 'd'] });
  assert.equal(b.split('\n').length, 8);
  assert.match(b, /^何が止まったか：X が失敗した。\nいつ：2026-11-02 05:41（日本時間）\n失敗した実行：https:\/\/github\.com\/r\/actions\/runs\/1\n/);
  assert.ok(!b.includes('- d'));
});

test('毎朝の見張り：期間外のページは取りに行かない・出ていなければ何もしない', async () => {
  const root = mkdtempSync(join(tmpdir(), 'mihari-'));
  mkdirSync(join(root, 'src/data/kihon'), { recursive: true });
  writeFileSync(join(root, 'src/data/a.mjs'), "export const A = { checked: '2026-10-22' };");
  writeFileSync(join(root, 'src/data/kihon/b.mjs'), "export const B = { checked: '2026-10-30' };");
  const asked = [];
  const ctx = makeCtx({ today: '2026-11-02', fetchImpl: async (u) => { asked.push(u); return res(404); }, wait: 0, log: () => {} });
  const opened = [];
  const rep = { open: async (x) => opened.push(x), resolve: async () => {} };
  await runWatches({ root, today: '2026-11-02', ctx, issues: [], rep, log: () => {} });
  assert.deepEqual(opened, []);
  assert.deepEqual(asked.sort(), [pressUrl('202610'), pressUrl('202611'), 'https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei36/18.html'].sort());
  // 期限が近い日：C の issue。A が閉じた issue であれば取りに行かない
  asked.length = 0;
  const ctx2 = makeCtx({ today: '2027-01-05', fetchImpl: async (u) => { asked.push(u); return res(404); }, wait: 0, log: () => {} });
  await runWatches({ root, today: '2027-01-05', ctx: ctx2, issues: [{ number: 1, title: W.A.title, state: 'closed' }], rep, log: () => {} });
  assert.equal(opened.length, 1);
  assert.equal(opened[0].title, '【夜】確認日の確かめ直し（2027-01-20 まで）');
  assert.equal(opened[0].label, 'night');
  assert.deepEqual(asked, ['https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei36/18.html']);
});

test('いちばん新しい実行：main の完了した実行だけ・cancelled などは飛ばしてその前・見張るきっかけ（events）のものだけ', () => {
  const def = RUNS['.github/workflows/deploy.yml'];
  const run = (id, conclusion, created, more = {}) => ({ id, conclusion, status: 'completed', head_branch: 'main', event: 'push', created_at: created, ...more });
  const runs = [
    run(7, 'failure', '2026-11-13T03:30:00Z', { head_branch: 'claude/x' }),
    run(6, 'failure', '2026-11-13T03:00:00Z', { event: 'pull_request' }),
    run(5, null, '2026-11-13T02:30:00Z', { status: 'in_progress' }),
    run(4, 'cancelled', '2026-11-13T02:00:00Z'),
    run(3, 'skipped', '2026-11-13T01:30:00Z'),
    run(2, 'failure', '2026-11-13T01:00:00Z', { event: 'workflow_dispatch' }),
    run(1, 'success', '2026-11-12T22:00:00Z'),
  ];
  assert.equal(pickLatest(runs, def).id, 2);
  assert.equal(pickLatest([...runs].reverse(), def).id, 2);
  assert.equal(pickLatest(runs.slice(6), def).id, 1);
  assert.equal(pickLatest(runs.slice(0, 5), def), null);
  assert.equal(pickLatest([run(8, 'failure', '2026-11-13T04:00:00Z')], RUNS['.github/workflows/check-sources.yml']), null); // 出典の点検は push を見ない
});

test('その日もう知らせたか：その日に作った issue・その日の「まだ続いている」', () => {
  const old = { created_at: '2026-11-10T01:00:00Z' };
  assert.equal(notedToday({ created_at: '2026-11-12T16:00:00Z' }, [], '2026-11-13'), true); // 日本時間 11/13 1:00
  assert.equal(notedToday(old, [], '2026-11-13'), false);
  assert.equal(notedToday(old, [{ body: 'まだ続いている（u）', created_at: '2026-11-13T00:20:00Z' }], '2026-11-13'), true);
  assert.equal(notedToday(old, [{ body: 'まだ続いている（u）', created_at: '2026-11-12T14:00:00Z' }], '2026-11-13'), false); // 日本時間 11/12 23:00
  assert.equal(notedToday(old, [{ body: '直った（u）', created_at: '2026-11-13T00:20:00Z' }], '2026-11-13'), false);
  assert.equal(notedToday({}, [], '2026-11-13'), false);
  const t = RUNS['.github/workflows/deploy.yml'].title;
  const closed = [{ number: 9, title: t, closed_at: '2026-11-13T05:00:00Z' }, { number: 8, title: 'ほか', closed_at: '2026-11-13T06:00:00Z' }];
  assert.equal(closedAfter(closed, t, '2026-11-13T04:00:00Z').number, 9);
  assert.equal(closedAfter(closed, t, '2026-11-13T05:30:00Z'), null);
});

test('判定（workflow_run といちばん新しい実行で同じ）：成功なら閉じる・失敗なら作る・今日もう知らせたら何もしない・閉じられたら作り直さない', async () => {
  const t = RUNS['.github/workflows/deploy.yml'].title;
  const ev = (conclusion, more = {}) => ({ id: 1, name: 'Build and Deploy', path: '.github/workflows/deploy.yml', event: 'workflow_dispatch', head_branch: 'main', conclusion, html_url: 'https://github.com/r/actions/runs/1', updated_at: '2026-11-13T03:00:00Z', ...more });
  const fake = (closed = []) => {
    const calls = [];
    return {
      calls,
      jobs: async () => ({ jobs: [] }),
      annotations: async () => [],
      comments: async () => [],
      comment: async (n, b) => calls.push(['comment', n, b]),
      close: async (n) => calls.push(['close', n]),
      ensureLabel: async () => {},
      create: async (title, body, label) => { calls.push(['create', title, label]); return { number: 20 }; },
      closedMihari: async () => closed,
    };
  };
  const log = () => {};
  let api = fake();
  await judge(ev('success'), { api, issues: [{ number: 3, title: t, state: 'open' }], latest: true, log });
  assert.deepEqual(api.calls, [['comment', 3, '直った（https://github.com/r/actions/runs/1）'], ['close', 3]]);
  api = fake();
  await judge(ev('failure'), { api, issues: [], latest: true, log });
  assert.deepEqual(api.calls, [['create', t, 'mihari']]);
  api = fake();
  await judge(ev('failure'), { api, issues: [{ number: 3, title: t, state: 'open', created_at: new Date().toISOString() }], latest: true, log });
  assert.deepEqual(api.calls, [], '今日作った issue にはコメントしない');
  api = fake();
  await judge(ev('failure'), { api, issues: [{ number: 3, title: t, state: 'open', created_at: '2026-11-01T00:00:00Z' }], latest: true, log });
  assert.deepEqual(api.calls, [['comment', 3, 'まだ続いている（https://github.com/r/actions/runs/1）']]);
  api = fake([{ number: 4, title: t, closed_at: '2026-11-13T05:00:00Z' }]);
  await judge(ev('failure'), { api, issues: [], latest: true, log });
  assert.deepEqual(api.calls, [], '失敗のあとに閉じられたら作り直さない');
  api = fake();
  await judge(ev('cancelled'), { api, issues: [], latest: true, log });
  await judge(ev('failure', { head_branch: 'claude/x' }), { api, issues: [], log });
  assert.deepEqual(api.calls, []);
});

test('mihari.yml：3時間ごとにも見る（毎朝の見張りは1日1回のまま）・見張る workflow は RUNS と同じ', () => {
  const wf = readFileSync(new URL('../.github/workflows/mihari.yml', import.meta.url), 'utf8');
  assert.match(wf, /^\s*schedule:\n\s*- cron: '41 20 \* \* \*'.*\n\s*- cron: '53 \*\/3 \* \* \*'/m);
  const job = (name) => wf.split(/\n {2}(?=[a-z]+:\n)/).find((b) => b.startsWith(`${name}:`)) || '';
  assert.match(job('latest'), /github\.event\.schedule == '53 \*\/3 \* \* \*'/);
  assert.match(job('latest'), /node scripts\/mihari\.mjs latest/);
  assert.match(job('watch'), /github\.event\.schedule == '41 20 \* \* \*'/);
  assert.doesNotMatch(job('watch'), /\*\/3/);
  assert.match(job('watch'), /node scripts\/mihari\.mjs watch/);
  const listed = wf.match(/workflows: \[(.+)\]/)[1].split(',').map((x) => x.trim().replace(/^'|'$/g, ''));
  assert.deepEqual(listed.sort(), Object.values(RUNS).map((d) => d.name).sort());
});
