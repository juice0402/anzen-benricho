// 見張り（.github/workflows/mihari.yml から動く。Node の標準だけ・依存なし。Claude の使用量は使わない）
// 何もなければ何もしない。何かあったときだけ issue を作る
//   node scripts/mihari.mjs notify … 公開・作り直し・出典の点検が失敗 → issue（mihari）。成功 → 同じ題の開いた issue を閉じる
//   node scripts/mihari.mjs watch  … 毎朝：確認日の期限（C）と国の発表（A・B1・D〜G）→ issue（night。夜のまとめ作業が進める）
// 環境変数：GH_TOKEN・GITHUB_REPOSITORY・GITHUB_RUN_ID（Actions が入れる）、DRY_RUN=true で issue を作らずログに出す、TODAY で日付を変える（dry_run のときだけ）
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const FOOTER = '見張り（.github/workflows/mihari.yml）が作った';
const UA = 'Mozilla/5.0 (compatible; anzen-benricho-mihari; +https://anzen-benricho.com/about/)';
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

// ---------- 日付（日本時間） ----------
const jst = (d) => new Date(d.getTime() + 9 * 3600e3).toISOString();
export const jstToday = (d = new Date()) => jst(d).slice(0, 10);
export const jstStamp = (iso) => { const t = jst(new Date(iso)); return `${t.slice(0, 10)} ${t.slice(11, 16)}`; };
export const addDays = (ymd, n) => new Date(Date.parse(ymd + 'T00:00:00Z') + n * 86400e3).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400e3);
export const inPeriod = (today, [from, to]) => today >= from && today <= to;
// 今月と先月（月の変わり目の発表を見のがさない）
export const recentMonths = (today) => {
  const [y, m] = today.split('-').map(Number);
  const p = m === 1 ? [y - 1, 12] : [y, m - 1];
  return [[y, m], p].map(([a, b]) => `${a}${String(b).padStart(2, '0')}`);
};

// ---------- ページの文字 ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export const decodeEntities = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] !== '#') return ENT[e.toLowerCase()] ?? m;
  const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
  return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
});
// 全角の数字・空白をそろえる（「第３回」→「第3回」）
export const norm = (s) => decodeEntities(s).normalize('NFKC').replace(/\s+/g, ' ').trim();
export const htmlText = (html) => norm(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '));
export const pageLinks = (html, base) => {
  const out = [];
  for (const m of html.matchAll(/<a\s[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url;
    try { url = new URL(decodeEntities(m[1]), base).href; } catch { continue; }
    out.push({ url, text: htmlText(m[2]) });
  }
  return out;
};
export function decodeBody(buf, ctype = '') {
  let cs = /charset=["']?([\w-]+)/i.exec(ctype || '')?.[1];
  if (!cs) cs = /<meta[^>]+charset=["']?([\w-]+)/i.exec(new TextDecoder('latin1').decode(buf.slice(0, 4096)))?.[1];
  cs = (cs || 'utf-8').toLowerCase();
  if (/^(x-)?s(hift)?[-_]?jis$/.test(cs) || cs === 'windows-31j' || cs === 'cp932') cs = 'shift_jis';
  try { return new TextDecoder(cs).decode(buf); } catch { return new TextDecoder('utf-8').decode(buf); }
}

// 外のページ：timeout 20 秒・1回だけやり直す。404 は「まだない」（失敗にしない）
export async function getPage(url, { fetchImpl = fetch, wait = 3000 } = {}) {
  let why = '';
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetchImpl(url, { redirect: 'follow', headers: { 'User-Agent': UA, 'Accept-Language': 'ja' }, signal: AbortSignal.timeout(20000) });
      if (r.status === 404 || r.status === 410) { await r.body?.cancel?.(); return { ok: false, missing: true, why: `返事 ${r.status}` }; }
      if (r.ok) return { ok: true, html: decodeBody(new Uint8Array(await r.arrayBuffer()), r.headers.get('content-type')) };
      await r.body?.cancel?.();
      why = `返事 ${r.status}`;
    } catch (e) {
      why = `つながらない（${e.cause?.code || e.name}）`;
    }
    if (i === 0) await sleep(wait);
  }
  return { ok: false, missing: false, why };
}

// 1回の実行のあいだ、同じページは1回だけ取る。見られなかったページを数える
export function makeCtx({ today, fetchImpl = fetch, wait = 3000, log = console.log } = {}) {
  const cache = new Map();
  const failed = new Map();
  const tried = new Set();
  const page = (url) => {
    if (!cache.has(url)) {
      cache.set(url, getPage(url, { fetchImpl, wait }).then((r) => {
        tried.add(url);
        if (!r.ok && !r.missing) { failed.set(url, r.why); log(`見られなかった：${url}（${r.why}）`); }
        return r.ok ? r.html : null;
      }));
    }
    return cache.get(url);
  };
  // 厚生労働省の報道発表資料（月ごとの一覧）。今月と先月
  const press = async () => {
    const out = [];
    for (const ym of recentMonths(today)) {
      const url = `https://www.mhlw.go.jp/stf/houdou/houdou_list_${ym}.html`;
      const html = await page(url);
      if (html) out.push(...pageLinks(html, url).filter((l) => /\/stf\/|\/content\//.test(l.url)));
    }
    return out;
  };
  return { today, page, press, failed, tried };
}

// ---------- 見張り C：確認日の期限 ----------
export const CHECKED_RE = /(checked|CHECKED)[A-Z_]*:? *=? *'(20[0-9]{2}-[0-9]{2}-[0-9]{2})'/g;
export function dataFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.mjs')) out.push(p);
    }
  };
  walk(join(root, 'src/data'));
  return out;
}
// [{ path, text }] → いちばん古い確認日と、その日のファイル
export function oldestChecked(files) {
  let date = null;
  let where = [];
  for (const f of files) {
    for (const m of f.text.matchAll(CHECKED_RE)) {
      if (!date || m[2] < date) { date = m[2]; where = [f.path]; }
      else if (m[2] === date && !where.includes(f.path)) where.push(f.path);
    }
  }
  return { date, where };
}
export const bodyC = (before) => `- やること：テストが止まる前に、確認日の古いデータを公式を開いて確かめ直す。対象は src/data/*.mjs・src/data/kihon/*.mjs のうち、確認日（checked・HOUREI_CHECKED）が ${before} より前のもの全部。出典を1つずつ開き、データの数字・日付・決まりがいまも合っているか確かめる。新しい年度の版（運動の要綱・統計・キャンペーンのページ）が出ていれば差しかえ、文中の年度・期間・数字も直す。開けない出典（GitHub からの 403・404・503 もふくむ）は、同じことが書いてある公的な資料に差しかえる。確かめたファイルの checked（法改正は HOUREI_CHECKED）を今日に。
- できあがりの条件：npm run check が緑。PR の出典の点検（check-run の注記）に警告がない。いちばん古い確認日が今日から45日以内でなくなる。
- 決まったこと：出典は公的なサイトだけ、2つ以上で一致したものだけ使う、文章は写さない。熱中症の数字は確定値と速報値を混ぜない。掲示の決まり（rules）を変えるとポスターの作り直しになるので、変えるのはどうしても必要なときだけ（足すなら朝礼の最後の段落か、やること）。使わない言葉（しましょう・ぜひ・便利・簡単・安心・おすすめ・ポイント・コツ・——）。
- 迷ったら：新しい年の確定値などの数字の更新は、2つ以上で一致すれば直す。決まりそのものが変わった・運動がなくなった・ページを消す必要がある、ときは止める（night-stopped）。確かめられない項目を黙って消さない。
- 読むファイル：リポジトリの CLAUDE.md、プロジェクトの資料 claude/anzen-handoff.md の「大事な決めごと」「自動で動いていること・期限」「テーマの作り方のメモ」
- 分け方：対象のファイルを確認日の古い順に半分ずつ、手伝い2人。checked を直すのはそれぞれの受けもちのファイルだけ、HOUREI_CHECKED はまとめ役。
- マージ：する`;
// 期限（いちばん古い確認日の90日後）が今日から21日以内なら issue
export function watchC({ date, where }, today) {
  if (!date) return null;
  const deadline = addDays(date, 90);
  const left = daysBetween(today, deadline);
  if (left > 21) return { hit: false, note: `いちばん古い確認日 ${date}・期限 ${deadline}（あと ${left} 日）` };
  const files = where.slice(0, 3).join('・') + (where.length > 3 ? ` ほか${where.length - 3}件` : '');
  return {
    hit: true,
    title: `【夜】確認日の確かめ直し（${deadline} まで）`,
    body: `${bodyC(addDays(date, 45))}\n\n見張りが見つけたこと：いちばん古い確認日 ${date}（${files}）。期限 ${deadline}（${left >= 0 ? `あと ${left} 日` : `${-left} 日過ぎた`}）。`,
  };
}

// ---------- 見張り A・B1・D〜G：国の発表 ----------
const bodyA = (url) => `- やること：2月の2つ目のテーマ「洗剤と薬品のラベルを確かめる」（slug は label。運動は化学物質管理強調月間 第3回・令和9年2月1日〜28日。要綱で確かめる）を、4業種（事務所・店舗／飲食／製造／清掃・ビルメン）ぶん作る：テーマの入口・業種のページ（掲示・朝礼・やること・出典）・ポスター4枚（Canva・案B）・写真1枚。中身は化学物質のコーナー（/kagaku/ のまぜない・SDS の見方・化学物質管理者が要るか・リスクアセスメントの入口）へつなぐ形。トップのこれからの予定など、ほかの運動が載っている所にも同じ形で足す。
- できあがりの条件：npm run check が緑。PR の出典の点検の注記に警告がない（403・404・503 は差しかえ）。業種のページの印刷が Playwright の PDF で A4 1枚。ポスター public/poster/2027-02/label-<業種>.pdf が4枚あり、業種のデータの poster に置き場所。写真 public/img/photo/label-640.webp・-1200.webp と src/data/photos.mjs の説明。2027-01-15 の作り直しより前に main に入る（15日からトップの「今月」が2月になる）。
- 決まったこと（2026-10-27 しょーくんと）：2月の2つ目のテーマにする（4業種・ポスター4枚・写真1枚、化学物質のコーナーへつなぐ形）。題は「洗剤と薬品のラベルを確かめる」。重点は要綱に合わせる（第2回の要綱では、化学物質管理者の選任と掲示・ラベルと SDS・リスクアセスメントの結果に基づく保護具、第三次産業と中小零細）。事務所は弱いので「市販の洗剤で事務所を掃除するだけなら該当しない」（香川労働局）と「業務で使う前提の製品は店で買える物でも対象外にならない」（徳島・香川）の両方を守る。次亜塩素酸ナトリウムは2027-04-01から対象物・裾切値はラベルと SDS とも1重量%（薄める前の製品の数字で見る・有効塩素とは別・1%未満でも、まぜない・保護具の注意は同じ）。作り方は claude/anzen-handoff.md の「テーマの作り方のメモ」「ポスターの作り方」「写真の作り方」と、既存のテーマ（src/data/kasai.mjs など）の形のとおり。仕上げに、下書きを見ていない確認係（別の Claude）2人が現場の人として確かめる（業種2つずつ）。
- 迷ったら：要綱と公的な資料で確かめられないことは書かない（2つ以上で一致したものだけ）。運動の期間に「毎年」と書くのは、要綱にそうあるときだけ。ポスターの絵は人も手も描かず、ほかのテーマの絵を使い回さない。Canva の生成が quota_cooldown のときは時間をおいて出し直す。写真かポスターがどうしてもできないときは、なしで出さずに止める（night-stopped）。
- 読むファイル：プロジェクトの資料 claude/anzen-handoff.md・claude/site-principles.md、リポジトリの CLAUDE.md、src/data/kihon/ の mazenai・sds・kanrisha・risk。見張りが見つけた要綱：${url}
- 分け方：調べ物（軽いモデル2人）と、Canva の型の写し・絵を描くのは同時に進められる。確認係は業種2つずつ2人。
- マージ：する`;

const bodyB = (what, url) => `- やること：法改正 /hourei/kenshin-2027/（src/data/hourei.mjs の slug kenshin-2027）に、厚労省が出した ${what} を足す（届出 todokede の行・やること・出典）。9月のテーマ（src/data/kenshin.mjs）と合わなくなる所があれば直す。kenshin-2027 の頭の注記「報告書の様式の名前と公表の時期は確かめられなかったので書かない。eGFR の有所見の基準値も書かない」を確かめた内容に直す。
- できあがりの条件：npm run check が緑。PR の出典の点検の注記に警告がない。
- 決まったこと：公的な資料2つ以上で一致したものだけ。様式の名前・番号・日付・基準の数字は通達や様式に書いてあるとおり（自分で計算しない）。ほかの改正の行とページの形は変えない。
- 迷ったら：言い切れないことは書かない。
- 読むファイル：リポジトリの CLAUDE.md、claude/anzen-handoff.md の「大事な決めごと」。見張りが見つけたページ：${url}
- マージ：する`;

const bodyNew = (file, src, url, extra = '') => `- やること：${file} の出典 ${src} を新しい版 ${url} に差しかえ、出典の題（t）と、文中の年度・期間・日付・スローガン・数字が変わっていれば直す（掲示の決まり rules はなるべく変えない。足すなら朝礼の最後の段落か、やること）。同じ運動のほかの出典も新しい版が出ていれば差しかえる。直したファイルの checked を今日に。${extra}
- できあがりの条件：npm run check が緑。PR の出典の点検の注記に警告がない。
- 決まったこと：公的な資料2つ以上で一致したものだけ。文章は写さない。使わない言葉（しましょう・ぜひ・便利・簡単・安心・おすすめ・ポイント・コツ・——）。
- 迷ったら：運動の中身が大きく変わったとき（期間・重点が変わり、掲示やポスターの作り直しが要るとき）は、PR まで作って止める（night-stopped）。
- 読むファイル：リポジトリの CLAUDE.md、claude/anzen-handoff.md の「大事な決めごと」
- マージ：する`;

// 判定（どれも「出た」と言い切れるときだけ true。迷うときは出ていない扱い）
// A：第3回（令和9年2月）の化学物質管理強調月間の実施要綱。スローガンの募集・決定だけでは出ていない
export const isA = (text) => /第3回.{0,3}化学物質管理強調月間.{0,3}実施要綱/.test(text)
  || (/化学物質管理強調月間/.test(text) && /実施要綱/.test(text) && /令和9年2月1日/.test(text));
export const titleA = (t) => /化学物質管理強調月間/.test(t) && !/募集/.test(t);
// B1：定期健康診断結果報告書の新しい様式（血清クレアチニン・eGFR の欄・令和8年以降の改正の注記）
export function isB1(text) {
  if (/クレアチニン|eGFR/i.test(text)) return true;
  // 様式の表の「定期健康診断結果報告書様式」の行（次の様式の名前まで）にある日付を見る
  for (const m of text.matchAll(/定期健康診断結果報告書様式/g)) {
    let seg = text.slice(m.index + 13, m.index + 13 + 200);
    const next = seg.search(/(結果報告書|報告)様式/);
    if (next >= 0) seg = seg.slice(0, next);
    for (const d of seg.matchAll(/令和(\d+)年(\d+)月(\d+)日/g)) if (Number(d[1]) >= 8 && /様式/.test(seg)) return true;
  }
  return false;
}
// D：自殺対策強化月間 令和8年度（2027年3月）のページ
export const isD = (text) => /自殺対策強化月間/.test(text) && /令和8年度/.test(text);
// E：令和9年度 全国労働衛生週間（厚労省は「実施要領」、労働局は「実施要綱」と書く）
export const titleE = (t) => /令和9年度/.test(t) && /全国労働衛生週間/.test(t) && !/スローガン|募集|結果/.test(t);
export const isE = (text) => /令和9年度/.test(text) && /全国労働衛生週間/.test(text) && /実施要領|実施要綱/.test(text);
// F：令和9年の過重労働解消キャンペーン（11月の過労死等防止啓発月間の発表）
export const titleF = (t) => /過労死等防止啓発月間|過重労働解消キャンペーン/.test(t) && !/結果/.test(t);
export const isF = (text) => /過重労働解消キャンペーン/.test(text) && /令和9年/.test(text);
export const isFCampaign = (text) => /実施期間 ?令和9年11月/.test(text);
// G：消防庁の令和9年秋季全国火災予防運動の通知（長官通知を先に）
export function pickG(links) {
  const hits = links.filter((l) => /令和9年秋季全国火災予防運動の実施について/.test(l.text));
  return hits.find((l) => /長官通知/.test(l.text)) || hits[0] || null;
}

async function fromPress(ctx, titleOk, pageOk) {
  for (const l of await ctx.press()) {
    if (!titleOk(l.text)) continue;
    const html = await ctx.page(l.url);
    if (html && pageOk(htmlText(html))) return { url: l.url, what: l.text };
  }
  return null;
}

export const WATCHES = [
  {
    id: 'A', period: ['2026-10-27', '2027-01-31'],
    title: '【夜】2月 化学物質管理強調月間のテーマ「洗剤と薬品のラベルを確かめる」',
    find: (ctx) => fromPress(ctx, titleA, isA),
    body: (hit) => bodyA(hit.url),
  },
  {
    id: 'B1', period: ['2026-10-27', '2027-06-30'],
    title: '【夜】健診の改正：新しい結果報告の様式を法改正のページに足す',
    find: async (ctx) => {
      const url = 'https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei36/18.html';
      const html = await ctx.page(url);
      return html && isB1(htmlText(html)) ? { url, what: '厚生労働省 各種健康診断結果報告書（定期健康診断結果報告書様式）の注記が変わった' } : null;
    },
    body: (hit) => bodyB('新しい結果報告の様式（名前・番号・使い始める日）', hit.url),
  },
  {
    id: 'D', period: ['2027-02-01', '2027-03-20'],
    title: '【夜】3月 心の健康：自殺対策強化月間の出典を令和8年度版に',
    find: async (ctx) => {
      const url = 'https://www.mhlw.go.jp/stf/r8_jisatsutaisakugekkan.html';
      const html = await ctx.page(url);
      if (html && isD(htmlText(html))) return { url, what: '厚生労働省 自殺対策強化月間（令和8年度）' };
      return fromPress(ctx, (t) => /自殺対策強化月間/.test(t), isD);
    },
    body: (hit) => bodyNew('src/data/kokoro.mjs', '「厚生労働省 自殺対策強化月間」（https://www.mhlw.go.jp/stf/r7_jisatsutaisakugekkan.html）', hit.url),
  },
  {
    id: 'E', period: ['2027-05-15', '2027-08-31'],
    title: '【夜】9月・10月：全国労働衛生週間の要綱を令和9年度版に',
    find: (ctx) => fromPress(ctx, titleE, isE),
    body: (hit) => bodyNew('src/data/kanki.mjs と src/data/kenshin.mjs', '「徳島労働局 令和8年度 全国労働衛生週間実施要綱」（kanki）・「山形労働局 令和8年度 全国労働衛生週間実施要綱」と富山労働局の職場の健康診断実施強化月間 R08 のページ（kenshin）', hit.url),
  },
  {
    id: 'F', period: ['2027-10-01', '2027-11-10'],
    title: '【夜】11月 働きすぎ：過重労働解消キャンペーンを令和9年度版に',
    find: async (ctx) => {
      const hit = await fromPress(ctx, titleF, isF);
      if (hit) return hit;
      const url = 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/roudoukijun/campaign_00004.html';
      const html = await ctx.page(url);
      return html && isFCampaign(htmlText(html)) ? { url, what: '厚生労働省 過重労働解消キャンペーン（実施期間 令和9年11月）' } : null;
    },
    body: (hit) => bodyNew('src/data/karou.mjs', '「11月は過労死等防止啓発月間です（令和8年10月の発表）」とキャンペーンのページ', hit.url, '令和8年度の過労死等の労災補償状況・監督指導の結果が出ていれば、memo の数字もそれに直す。'),
  },
  {
    id: 'G', period: ['2027-08-15', '2027-10-31'],
    title: '【夜】11月 火事：秋季全国火災予防運動を令和9年の日付に',
    find: async (ctx) => {
      const base = 'https://www.fdma.go.jp/laws/tutatsu/2027/';
      const html = await ctx.page(base);
      const l = html && pickG(pageLinks(html, base));
      return l ? { url: l.url, what: `消防庁 ${l.text}` } : null;
    },
    body: (hit) => bodyNew('src/data/kasai.mjs（undo の span「令和8年11月9日〜15日」・朝礼の「11月9日から15日」）', '「消防庁 令和8年秋季全国火災予防運動の実施について」と埼玉県のページ', hit.url),
  },
];
// B2（eGFR の有所見の基準）は通達の PDF に出るので、プログラムでは見ない（Claude の予約タスクに残す）

// ---------- issue ----------
export const LABELS = {
  mihari: { color: 'd93f0b', description: '見張りが見つけた。しょーくんに知らせるだけ' },
  night: { color: '5319e7', description: '夜のまとめ作業がする' },
};
// 同じ題の開いた issue → コメント（その日1回）。night は閉じたものがあっても作らない（済んだものをまた作らない）
export function decide(issues, title, label) {
  const same = issues.filter((i) => i.title === title);
  const open = same.find((i) => i.state === 'open');
  if (open) return { act: 'comment', issue: open };
  if (label === 'night' && same.length) return { act: 'skip', issue: same[0] };
  return { act: 'create' };
}
export const withFooter = (body) => `${body}\n\n${FOOTER}`;

export function github({ token, repo, fetchImpl = fetch }) {
  const call = async (method, path, body) => {
    const r = await fetchImpl(`https://api.github.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'anzen-benricho-mihari', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) { const e = new Error(`GitHub ${method} ${path}：${r.status} ${(await r.text()).slice(0, 200)}`); e.status = r.status; throw e; }
    return r.status === 204 ? null : r.json();
  };
  const R = `/repos/${repo}`;
  return {
    call,
    async issues(state = 'all') {
      const out = [];
      for (let p = 1; p <= 10; p++) {
        const a = await call('GET', `${R}/issues?state=${state}&per_page=100&page=${p}`);
        out.push(...a.filter((i) => !i.pull_request));
        if (a.length < 100) break;
      }
      return out;
    },
    async ensureLabel(name) {
      try { await call('GET', `${R}/labels/${encodeURIComponent(name)}`); }
      catch (e) { if (e.status !== 404) throw e; await call('POST', `${R}/labels`, { name, ...LABELS[name] }); }
    },
    create: (title, body, label) => call('POST', `${R}/issues`, { title, body, labels: [label] }),
    comments: (n, since) => call('GET', `${R}/issues/${n}/comments?per_page=100&since=${encodeURIComponent(since)}`),
    comment: (n, body) => call('POST', `${R}/issues/${n}/comments`, { body }),
    close: (n) => call('PATCH', `${R}/issues/${n}`, { state: 'closed', state_reason: 'completed' }),
    jobs: (runId) => call('GET', `${R}/actions/runs/${runId}/jobs?per_page=100`),
    annotations: (checkRunId) => call('GET', `${R}/check-runs/${checkRunId}/annotations?per_page=50`),
  };
}

// issue を作る・コメントする（dry_run のときはログだけ）
export function reporter({ api, issues, dry, runUrl, today, log = console.log }) {
  const startOfDay = new Date(Date.parse(today + 'T00:00:00+09:00')).toISOString();
  return {
    async open({ title, body, label }) {
      const d = decide(issues, title, label);
      if (d.act === 'skip') return log(`すでにある（#${d.issue.number}・閉じた）：${title}`);
      if (d.act === 'comment') {
        const msg = `まだ続いている（${runUrl}）`;
        if (dry) return log(`[dry_run] #${d.issue.number} にコメント（その日まだなら）：${msg}`);
        const cs = await api.comments(d.issue.number, startOfDay);
        if (cs.some((c) => c.body.startsWith('まだ続いている') && Date.parse(c.created_at) >= Date.parse(startOfDay))) return log(`今日はコメント済み：#${d.issue.number}`);
        await api.comment(d.issue.number, msg);
        return log(`コメントした：#${d.issue.number} ${title}`);
      }
      const full = withFooter(body);
      if (dry) return log(`[dry_run] 作る（ラベル ${label}）：${title}\n${full}\n---`);
      await api.ensureLabel(label);
      const i = await api.create(title, full, label);
      issues.push({ number: i.number, title, state: 'open' });
      log(`作った：#${i.number} ${title}`);
    },
    async resolve(title, url = runUrl) {
      const open = issues.filter((i) => i.title === title && i.state === 'open');
      for (const i of open) {
        if (dry) { log(`[dry_run] #${i.number} を閉じる：直った（${url}）`); continue; }
        await api.comment(i.number, `直った（${url}）`);
        await api.close(i.number);
        log(`閉じた：#${i.number} ${title}`);
      }
    },
  };
}

// ---------- workflow_run：公開・作り直し・出典の点検 ----------
export const RUNS = {
  '.github/workflows/deploy.yml': {
    name: 'Build and Deploy',
    title: '【見張り】本番の公開が止まった',
    events: ['push', 'schedule', 'workflow_dispatch'],
    what: (ev) => ({
      push: 'main に入れた変更の本番への公開（Build and Deploy）が失敗した。サイトは前の版のまま。',
      schedule: '毎月1日と15日の本番の作り直し（Build and Deploy）が失敗した。今月のテーマ・次の改正が切りかわっていないかもしれない。',
    })[ev] || '手で動かした本番の公開（Build and Deploy）が失敗した。サイトは前の版のまま。',
  },
  '.github/workflows/check-sources.yml': {
    name: '出典の点検',
    title: '【見張り】毎週の出典の点検が止まった',
    events: ['schedule', 'workflow_dispatch'],
    what: () => '毎週月曜の出典の点検（出典の点検）が最後まで動かなかった。出典と確認日の点検の結果が出ていない。',
  },
};
export const classify = (conclusion) => (conclusion === 'success' ? 'ok' : ['failure', 'timed_out'].includes(conclusion) ? 'ng' : 'ignore');
export const cut = (s, n = 200) => { const a = [...String(s).replace(/\s+/g, ' ').trim()]; return a.length > n ? a.slice(0, n - 1).join('') + '…' : a.join(''); };
export function failBody({ what, when, url, steps, notes }) {
  return [
    `何が止まったか：${what}`,
    `いつ：${when}（日本時間）`,
    `失敗した実行：${url}`,
    `失敗したジョブとステップ：${steps.length ? steps.join('、') : '（わからなかった）'}`,
    `失敗の注記：${notes.length ? '' : 'なし'}`,
    ...notes.slice(0, 3).map((n) => `- ${cut(n)}`),
  ].join('\n');
}
export const failedSteps = (jobs) => jobs.filter((j) => ['failure', 'timed_out'].includes(j.conclusion)).flatMap((j) => {
  const s = (j.steps || []).filter((x) => ['failure', 'timed_out'].includes(x.conclusion)).map((x) => `ジョブ「${j.name}」のステップ「${x.name}」`);
  return s.length ? s : [`ジョブ「${j.name}」`];
});

async function notify(env, log) {
  const ev = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8')).workflow_run;
  const def = RUNS[ev.path] || Object.values(RUNS).find((d) => d.name === ev.name);
  const kind = classify(ev.conclusion);
  log(`${ev.name}（${ev.event}・${ev.head_branch}）：${ev.conclusion}`);
  if (!def || !def.events.includes(ev.event) || ev.head_branch !== 'main' || kind === 'ignore') return log('見張る対象ではないので何もしない');
  const api = github({ token: env.GH_TOKEN, repo: env.GITHUB_REPOSITORY });
  const issues = await api.issues('open');
  const rep = reporter({ api, issues, dry: false, runUrl: ev.html_url, today: jstToday(), log });
  if (kind === 'ok') return rep.resolve(def.title, ev.html_url);
  let steps = [];
  const notes = [];
  try {
    const { jobs } = await api.jobs(ev.id);
    steps = failedSteps(jobs);
    for (const j of jobs.filter((x) => ['failure', 'timed_out'].includes(x.conclusion))) {
      try {
        for (const a of await api.annotations(j.id)) if (a.annotation_level === 'failure' && notes.length < 3) notes.push(a.message);
      } catch (e) { log(`注記を読めなかった：${e.message}`); }
    }
  } catch (e) { log(`ジョブを読めなかった：${e.message}`); }
  await rep.open({ title: def.title, label: 'mihari', body: failBody({ what: def.what(ev.event), when: jstStamp(ev.updated_at || ev.run_started_at || new Date().toISOString()), url: ev.html_url, steps, notes }) });
}

// ---------- 毎朝：C と A〜G ----------
export const UNREACHABLE_TITLE = '【見張り】公式のページが7日続けて見られない';
// 見られなかったページの記録（{ url: 見られなくなった最初の日 }）。今日見なかったページは消す
export function updateState(prev, ctx, today) {
  const next = {};
  for (const url of ctx.tried) if (ctx.failed.has(url)) next[url] = prev[url] || today;
  return next;
}
export const longFails = (state, today) => Object.entries(state).filter(([, since]) => daysBetween(since, today) >= 6);

export async function runWatches({ root, today, ctx, issues, rep, log = console.log }) {
  const files = dataFiles(root).map((p) => ({ path: relative(root, p), text: readFileSync(p, 'utf8') }));
  const c = watchC(oldestChecked(files), today);
  if (c?.hit) await rep.open({ title: c.title, body: c.body, label: 'night' });
  else log(`C：${c ? c.note : '確認日が見つからない'}`);
  for (const w of WATCHES) {
    if (!inPeriod(today, w.period)) continue;
    const d = decide(issues, w.title, 'night');
    if (d.act === 'skip') { log(`${w.id}：すでにある（#${d.issue.number}）`); continue; }
    const hit = await w.find(ctx);
    if (!hit) { log(`${w.id}：まだ出ていない`); continue; }
    log(`${w.id}：出た ${hit.url}`);
    await rep.open({ title: w.title, label: 'night', body: `${w.body(hit)}\n\n見張りが見つけたこと：${hit.what}（${hit.url}・${today} に見た）` });
  }
}

async function watch(env, log) {
  const dry = env.DRY_RUN === 'true';
  const today = dry && /^\d{4}-\d{2}-\d{2}$/.test(env.TODAY || '') ? env.TODAY : jstToday();
  const root = fileURLToPath(new URL('..', import.meta.url));
  const runUrl = `${env.GITHUB_SERVER_URL || 'https://github.com'}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`;
  const api = github({ token: env.GH_TOKEN, repo: env.GITHUB_REPOSITORY });
  const issues = await api.issues('all');
  const rep = reporter({ api, issues, dry, runUrl, today, log });
  const ctx = makeCtx({ today, log });
  log(`今日（日本時間）：${today}${dry ? '（dry_run）' : ''}`);
  await runWatches({ root, today, ctx, issues, rep, log });

  const file = join(root, '.mihari/state.json');
  let prev = {};
  try { prev = JSON.parse(readFileSync(file, 'utf8')).unreachable || {}; } catch {}
  const state = updateState(prev, ctx, today);
  const long = longFails(state, today);
  if (long.length) {
    await rep.open({
      title: UNREACHABLE_TITLE, label: 'mihari',
      body: [`何が止まったか：見張りが見る公式のページが7日続けて開けない（国の発表を見のがすかもしれない）。`, `いつ：${today}（日本時間）`, `実行：${runUrl}`, ...long.map(([u, s]) => `- ${u}（${s} から。${ctx.failed.get(u)}）`)].join('\n'),
    });
  } else await rep.resolve(UNREACHABLE_TITLE);
  if (!dry) { mkdirSync(join(root, '.mihari'), { recursive: true }); writeFileSync(file, JSON.stringify({ unreachable: state }, null, 1)); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cmd = process.argv[2];
  const log = (s) => console.log(s);
  const run = cmd === 'notify' ? notify : cmd === 'watch' ? watch : null;
  if (!run) { console.error('使い方：node scripts/mihari.mjs notify|watch'); process.exit(2); }
  run(process.env, log).catch((e) => { console.error(e.stack || e.message); process.exit(1); });
}
