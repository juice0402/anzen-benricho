// 安全衛生の法人パック（#82。くわしくは docs/pack.md）
//   /pack/            売るページ：何が入っているか・見本・値段・買うボタン（Stripe の支払いリンクへ）
//   /pack/<YYYY-MM>/  買った人だけ開く月のページ（functions/pack/_middleware.js が ?s= を Stripe に確かめる）。会社名・業種をえらんで A4 で印刷
// 中身はテーマのデータ（rules・talk・todo・memo・gidai・quiz）といまの紙の部品だけで組む。新しい事実の文は書かない
// PACK.link も testLink も null のあいだは何も作らない。testLink だけのときは /pack/ を noindex・サイトマップに入れない・どこからもリンクしない
import { page, esc, fudaLabel, script, pageCss } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { PACK } from '../data/pack.mjs';
import { packRef } from '../pack-check.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { ALL_THEMES, monthFor } from '../data/themes.mjs';
import { todayJst } from '../data/hourei.mjs';
import { sheet } from './theme.mjs';
import { titleHtml } from '../parts.mjs';

const host = SITE.url.replace(/^https?:\/\//, '');
const KANA = ['ア', 'イ', 'ウ'];
const CO = '（会社名）';
const ym = (y, m) => `${y}-${String(m).padStart(2, '0')}`;
const addMonths = (s, k) => {
  const [y, m] = s.split('-').map(Number);
  const n = y * 12 + (m - 1) + k;
  return ym(Math.floor(n / 12), (n % 12) + 1);
};
const monthOf = (s) => Number(s.slice(5, 7));
const yearOf = (s) => Number(s.slice(0, 4));
const themesOf = (s) => ALL_THEMES.filter((t) => t.month === monthOf(s));

// 売る号：トップの「今月」と同じ（15日からは翌月）。最初の号より前なら最初の号
export const sellMonth = (iso = todayJst()) => {
  const [y, mo] = iso.split('-').map(Number);
  const m = monthFor(iso);
  const yy = m < mo - 6 ? y + 1 : m > mo + 6 ? y - 1 : y;
  const s = ym(yy, m);
  return s < PACK.first ? PACK.first : s;
};
// 月のページを作る号：最初の号から、売る号の11か月先まで（前の号は買った人がずっと開ける）
export const packMonths = (iso = todayJst()) => {
  const out = [];
  for (let s = PACK.first, last = addMonths(sellMonth(iso), 11); s <= last; s = addMonths(s, 1)) if (themesOf(s).length) out.push(s);
  return out;
};
export const buyUrl = (link, s) => `${link}?client_reference_id=${packRef(s)}`;

// 紙の下の出典の1行：テーマの掲示の出典（posterSrc）をまとめる
const srcLine = (ts) => {
  const names = [...new Set(ts.flatMap((t) => (t.posterSrc || '出典：厚生労働省・労働局ほか').replace(/^出典：/, '').replace(/ほか$/, '').split('・')))];
  return `出典：${names.join('・')}ほか`;
};
const foot = (ts) => `<p class="ps-foot"><span>${esc(srcLine(ts))}</span><span>${esc(SITE.name)}　${host}</span></p>`;
const co = '<p class="pp-co" data-co>' + CO + '</p>';
const gAttr = (g, i) => ` data-g="${g.key}"${i ? ' hidden' : ''}`;

// 紙に入るように、テーマを何枚かに分ける（字の数のめやす。本文は 10.5pt より小さくしない）
const chunk = (ts, size, max) => {
  const out = [];
  let cur = [];
  let n = 0;
  for (const t of ts) {
    const w = size(t);
    if (cur.length && n + w > max) { out.push(cur); cur = []; n = 0; }
    cur.push(t);
    n += w;
  }
  if (cur.length) out.push(cur);
  return out;
};
const gOf = (t, g) => t.gyoshu.find((x) => x.key === g.key);

// 掲示：いまの業種のページの紙と同じ形。上に会社名。QR は入れない
const posters = (ts, g, i) => ts.map((t) => sheet(t, gOf(t, g)).replace('<div class="sheet">', `<div class="sheet pp"${gAttr(g, i)}>`).replace('<p class="s-kicker">', `${co}\n<p class="s-kicker">`)).join('\n');

// 朝礼の文：その月のテーマぶん。各話に「話した日・話した人」の欄
const TALK_MAX = 850;
const talkSheets = (ts, g, i, m) =>
  chunk(ts, (t) => gOf(t, g).talk.join('').length + 60, TALK_MAX)
    .map((part) => `<div class="psheet pp pp-talk"${gAttr(g, i)}><div class="ps-in">
${co}
<p class="ps-title">${m}月の朝礼<span class="pp-sub">${esc(g.label)}</span></p>
${part.map((t) => `<div class="pp-b"><p class="pp-h">${titleHtml(t)}</p><div class="pp-tx">${gOf(t, g).talk.map((p) => `<p>${esc(p)}</p>`).join('')}</div><dl class="pg-f pp-f"><div><dt>話した日</dt><dd></dd></div><div><dt>話した人</dt><dd></dd></div></dl></div>`).join('\n')}
${foot(part)}
</div></div>`)
    .join('\n');

// 委員会の資料：テーマごとに数字の1行・話すこと・担当者のやること・今月の1問。答えは紙のいちばん下に小さく
const IINKAI_MAX = 620;
const iinkaiSize = (t, g) => {
  const x = gOf(t, g);
  return [x.memo || '', ...(t.gidai || []), ...x.todo, t.quiz ? t.quiz.q : '', ...(t.quiz ? t.quiz.choices : [])].join('').length + 80;
};
const iinkaiSheets = (ts, g, i, m) =>
  chunk(ts, (t) => iinkaiSize(t, g), IINKAI_MAX)
    .map((part) => {
      const qs = part.filter((t) => t.quiz);
      return `<div class="psheet pp pp-ii"${gAttr(g, i)}><div class="ps-in">
${co}
<p class="ps-title">${m}月の委員会の資料<span class="pp-sub">${esc(g.label)}</span></p>
<p class="pp-kai">第　　回 安全衛生委員会　　　月　　日</p>
${part.map((t) => {
        const x = gOf(t, g);
        return `<div class="pp-b"><p class="pp-h">${titleHtml(t)}</p>
${x.memo ? `<p class="pp-memo">${esc(x.memo)}</p>` : ''}
${t.gidai ? `<p class="pp-k">話すこと</p><ul class="pp-ul">${t.gidai.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
<p class="pp-k">担当者のやること</p><ul class="pp-ul">${x.todo.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
${t.quiz ? `<p class="pp-k">今月の1問</p><p class="pp-q">${esc(t.quiz.q)}</p><ol class="pp-ch">${t.quiz.choices.map((c, j) => `<li><i>${KANA[j]}</i>${esc(c)}</li>`).join('')}</ol>` : ''}
</div>`;
      }).join('\n')}
${qs.length ? `<p class="pp-ans">答え　${qs.map((t) => `${esc(t.title)} ${KANA[t.quiz.answer]}`).join('　')}</p>` : ''}
${foot(part)}
</div></div>`;
    })
    .join('\n');

// 議事録：/kihon/gijiroku/ の紙と同じ欄。議題にその月のテーマの話すこと（gidai）。テーマが3つ以上の月は、書く行を1行ずつへらして1枚に収める
const gijiroku = (ts, n = ts.length > 2 ? 3 : 4) => `<div class="psheet pp pj"><div class="ps-in">
${co}
<p class="ps-title">安全衛生 議事録</p>
<dl class="pg-f pj-f"><div><dt>日時</dt><dd></dd></div><div><dt>場所</dt><dd></dd></div><div class="pj-w"><dt>出席者</dt><dd></dd></div></dl>
<div class="pj-b"><p class="pj-h">議題</p><ol class="pp-gd">${ts.map((t) => `<li><b>${esc(t.title)}</b>${t.gidai ? `　${t.gidai.map(esc).join('／')}` : ''}</li>`).join('')}</ol></div>
<div class="pj-b"><p class="pj-h">話したこと</p><p class="pj-l" style="--l:${n}"></p></div>
<table class="pg-t pj-t"><thead><tr><th>決めたこと</th><th>担当</th><th>いつまで</th></tr></thead><tbody>${'<tr><td></td><td></td><td></td></tr>'.repeat(n)}</tbody></table>
<dl class="pg-f pj-f pj-e"><div><dt>次の回</dt><dd></dd></div><div><dt>記録した人</dt><dd></dd></div><div><dt>確認した人</dt><dd></dd></div></dl>
${foot(ts)}
</div></div>`;

// その月の実施記録表：テーマごとの行。掲示・朝礼・やることの実施した日と人、確認
const kiroku = (ts, m) => `<div class="psheet pp pp-kr"><div class="ps-in">
${co}
<p class="ps-title">${m}月の実施記録</p>
<table class="pg-t pp-krt"><thead><tr><th rowspan="2">テーマ</th><th colspan="2">掲示</th><th colspan="2">朝礼</th><th colspan="2">やること</th><th rowspan="2">確認</th></tr><tr><th>日</th><th>人</th><th>日</th><th>人</th><th>日</th><th>人</th></tr></thead>
<tbody>${ts.map((t) => `<tr><th scope="row">${esc(t.title)}</th>${'<td></td>'.repeat(7)}</tr>`).join('')}</tbody></table>
<p class="ps-note">日は実施した日、人は実施した人の名前。確認は担当者の印</p>
${foot(ts)}
</div></div>`;

// 入っている紙（/pack/ の目次）
const tocItems = (ts) => [
  `掲示（${ts.map((t) => t.title).join('・')}。テーマごとに1枚）`,
  `朝礼の文（${ts.length}話。話した日・話した人の欄つき）`,
  '委員会の資料（数字・話すこと・担当者のやること・今月の1問）',
  '議事録（議題に今月の話すこと）',
  '実施記録表（掲示・朝礼・やることの実施した日と人）',
];

const PICK = () => `<div class="fuda pk-pick" role="group" aria-label="業種">${GYOSHU.map((g, i) => `<button type="button" class="fuda-b" data-g="${g.key}" aria-pressed="${i ? 'false' : 'true'}">${fudaLabel(g.label)}</button>`).join('')}</div>`;

function monthPage(s) {
  const ts = themesOf(s);
  const m = monthOf(s);
  const path = `/pack/${s}/`;
  const papers = [
    ...GYOSHU.map((g, i) => posters(ts, g, i)),
    ...GYOSHU.map((g, i) => talkSheets(ts, g, i, m)),
    ...GYOSHU.map((g, i) => iinkaiSheets(ts, g, i, m)),
    gijiroku(ts),
    kiroku(ts, m),
  ].join('\n');
  const body = `<header class="th-head"><h1 class="th-title pg-title"><small>${yearOf(s)}年${m}月号</small>安全衛生の法人パック</h1></header>
<section class="sec paper pk-ctl np" aria-labelledby="pc-h">
<h2 class="sec-h" id="pc-h">印刷の前に</h2>
<p class="pk-save">このページのリンクを保存してください（会社のパソコンでも開けます）</p>
<p class="pk-mail"><a href="mailto:">リンクをメールで自分に送る</a></p>
<label class="ks-date" for="pk-co">会社名（事業所名）<input id="pk-co" type="text" maxlength="24" autocomplete="off"></label>
${PICK()}
<button class="btn print-btn" type="button">A4で印刷</button>
<p class="u-note">PDFは印刷の画面の「PDFに保存」で</p>
</section>
<section class="sec sec-poster sec-sheet pk-papers" aria-labelledby="pp-h">
<h2 class="sec-h" id="pp-h">紙</h2>
${papers}
</section>`;
  return {
    path,
    noSitemap: true,
    html: page({
      title: `安全衛生の法人パック ${yearOf(s)}年${m}月号｜${SITE.name}`,
      description: `安全衛生の法人パック ${yearOf(s)}年${m}月号。掲示・朝礼の文・委員会の資料・議事録・実施記録表。`,
      path,
      body,
      js: script('pack'),
      noAds: true,
      moreCss: pageCss('pack'),
      noindex: true,
      head: '<meta name="referrer" content="no-referrer">',
      crumbs: [{ name: '法人パック', href: '/pack/' }, { name: `${yearOf(s)}年${m}月号` }],
    }),
  };
}

function salePage(s, link, live) {
  const ts = themesOf(s);
  const m = monthOf(s);
  const path = '/pack/';
  const g = GYOSHU[0];
  const sample = sheet(ts[0], gOf(ts[0], g)).replace('<p class="s-kicker">', `${co}\n<p class="s-kicker">`);
  const body = `<header class="th-head"><h1 class="th-title pg-title">安全衛生の法人パック ${m}月号</h1></header>
<p class="pk-lead">その月の掲示・朝礼・委員会の資料・記録表を、会社名入りで A4 にまとめて印刷できます</p>
<p class="pk-err" hidden>開けませんでした。リンクをもう一度確かめるか、${SITE.contact ? '<a href="/contact/">お問い合わせ</a>' : 'お問い合わせ'}から</p>
<div class="pk-buyrow"><p class="pk-price">1か月分 ${PACK.price}円（税込）</p>
<a class="btn pk-buy" href="${esc(buyUrl(link, s))}" rel="nofollow noopener">${m}月号を買う（${PACK.price}円）</a></div>
<section class="sec paper" aria-labelledby="pt-h">
<h2 class="sec-h" id="pt-h">入っている紙</h2>
<ul class="krel pk-toc">${tocItems(ts).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
</section>
<section class="sec" aria-labelledby="pm-h">
<h2 class="sec-h" id="pm-h">見本</h2>
<div class="pk-mihon" aria-label="1枚目の掲示の見本（上半分）">${sample}</div>
</section>
<section class="sec paper" aria-labelledby="pn-h">
<h2 class="sec-h" id="pn-h">買う前に</h2>
<div class="pk-doc">
<p>お支払いはクレジットカードで、Stripe の支払いページで行います。</p>
<p>払うとすぐ、その月のパックのページが開きます。そのページのリンクが、買った人の専用リンクです。保存しておくと、会社のパソコンでも開けます。</p>
<p>サイトの掲示や朝礼の文は、いままでどおり無料で見られます。パックは会社名入りで、まとめて印刷でき、委員会の資料と記録表がつきます。</p>
<p>インボイス（適格請求書）は発行していません。</p>
<p><a href="/tokushoho/">特定商取引法に基づく表記</a></p>
</div>
</section>`;
  const names = ts.map((t) => t.title).join('・');
  return {
    path,
    noSitemap: !live,
    html: page({
      title: `安全衛生の法人パック ${m}月号｜掲示・朝礼・委員会の資料（A4）｜${SITE.name}`,
      description: `安全衛生の法人パック${m}月号は、${names}の掲示${ts.length}枚と朝礼の文・委員会の資料・議事録・実施記録表を、会社名入りでA4にまとめて印刷できます。1か月分500円（税込）。`,
      path,
      body,
      js: script('pack-sale'),
      noAds: true,
      moreCss: pageCss('pack'),
      noindex: !live,
      crumbs: [{ name: '法人パック' }],
    }),
  };
}

export default function packPages(iso = todayJst()) {
  const live = Boolean(PACK.link);
  const link = PACK.link || PACK.testLink;
  if (!link) return [];
  return [salePage(sellMonth(iso), link, live), ...packMonths(iso).map(monthPage)];
}
