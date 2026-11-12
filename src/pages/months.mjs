// 月ごとのテーマ
//   /anzen/        月の一覧（今月から先の月の順）
//   /anzen/<月>/   その月の運動・テーマ（業種ごとの掲示と朝礼へ）・その月に施行される法改正
import { page, esc, adSlot, script, clientLib } from '../layout.mjs';
import { koyomiHtml } from '../koyomi.mjs';
import { SITE } from '../site.mjs';
import { bandHead, monthHead, themePath, gyoshuPath, titleHtml, photo } from '../parts.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { HOUREI, houreiPath, fmtDate } from '../data/hourei.mjs';
import { monthDesc, monthsDesc, quizDesc } from '../describe.mjs';
import { kauOfMonth, kauPath } from '../data/kau.mjs';
import { packLineMonth } from '../pack-line.mjs';
import { REC_MONTHS } from '../client/rec.mjs';

// 今月の1問（テーマごとに1問）。押すと正解・解説・出典が出る（src/client/quiz.js。月のページでは結果を保存しない・送らない）
export const QUIZ_PATH = '/anzen/quiz/';
const KANA = ['ア', 'イ', 'ウ'];
const srcOf = (t, u) => [...t.common, ...t.gyoshu.flatMap((g) => g.src)].find((s) => s.u === u);
// 1問の部品（月のページと問題集で使う）。slug を渡すと data-s（問題集で正解を覚える印）
const qzItem = (t, title, slug = false) => {
  const q = t.quiz;
  const s = srcOf(t, q.src);
  return `<div class="qz" data-a="${q.answer}"${slug ? ` data-s="${t.slug}"` : ''}>
${title ? `<p class="qz-t">${esc(t.title)}</p>` : ''}<p class="qz-q">${esc(q.q)}</p>
<ol class="q-ch">${q.choices.map((c, i) => `<li><button type="button" data-i="${i}"><i>${KANA[i]}</i><span>${esc(c)}</span></button></li>`).join('')}</ol>
<div class="qz-r" hidden><p class="qz-ok"></p><p>${esc(q.why)}</p><div class="qz-src"><p class="u-note">出典</p><ol class="src"><li><a href="${esc(q.src)}" rel="noopener">${esc(s ? s.t : q.src)}</a></li></ol></div></div>
</div>`;
};
const quizHtml = (ts) => {
  const qs = ts.filter((t) => t.quiz);
  if (!qs.length) return '';
  return `<section class="sec qz-s" aria-labelledby="qz-h">
<h2 class="sec-h" id="qz-h">今月の1問</h2>
${qs.map((t) => qzItem(t, qs.length > 1)).join('\n')}
<p class="u-note"><a href="${QUIZ_PATH}">12か月分の1問をまとめて解く（問題集）</a></p>
</section>`;
};

// 今月の委員会で話すこと（テーマごとに議題の例3つ。印刷には出さない）。テーマごとに、その議題が入った議事録の紙（/kihon/gijiroku/?t=<テーマ>。#80）へ
const gidaiHtml = (ts, m) => {
  const gs = ts.filter((t) => t.gidai);
  if (!gs.length) return '';
  return `<section class="sec gd-s np" aria-labelledby="gd-h">
<h2 class="sec-h" id="gd-h">今月の委員会で話すこと</h2>
<p class="pg-lead">運営者が委員会の資料に使う議題の立て方です</p>
${packLineMonth(m)}
${gs.map((t) => `${gs.length > 1 ? `<h3 class="gd-t">${esc(t.title)}</h3>` : ''}<ul class="gd">${t.gidai.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
<p class="gd-a"><a href="/kihon/gijiroku/?t=${t.slug}">この議題が入った議事録の紙（A4）</a></p>`).join('\n')}
<p class="u-note">委員会のない職場は、朝礼や打ち合わせの議題に</p>
</section>`;
};

const monthsOf = (themes, from) => [...new Set(themes.map((t) => t.month))].sort((a, b) => ((a - from + 12) % 12) - ((b - from + 12) % 12));

// ほかの号（C-027 案A）：前の号と次の号（テーマのない月はとばす）
export const monthNeighbors = (m, themes) => {
  const has = (n) => themes.some((t) => t.month === n);
  const step = (d) => { for (let k = 1; k <= 12; k++) { const n = ((m - 1 + d * k + 120) % 12) + 1; if (has(n)) return n; } return m; };
  return [step(-1), step(1)].map((n, i) => ({ n, d: `${i ? '次の号' : '前の号'}：${themes.filter((t) => t.month === n).map((t) => t.title).join('・')}` }));
};
const neighborsHtml = (m, themes) => `<section class="sec paper np" aria-labelledby="mo-h">
<h2 class="sec-h" id="mo-h">ほかの号</h2>
<ul class="krel">${monthNeighbors(m, themes).map((x) => `<li><a href="/anzen/${x.n}/">${x.n}月号<span class="ym-d">${esc(x.d)}</span></a></li>`).join('')}</ul>
</section>`;

function monthPage(m, themes) {
  const ts = themes.filter((t) => t.month === m);
  const path = `/anzen/${m}/`;
  const undos = ts.filter((t) => t.undo).map((t) => `<li><b>${esc(t.undo.name)}</b><span>${esc(t.undo.span)}</span></li>`).join('');
  const laws = HOUREI.filter((h) => Number(h.date.slice(5, 7)) === m);
  // 今月そろえる物（#66）：物の名前・なぜ今かの1行・物のページへの文字のリンクだけ（楽天の商品は出さない）
  const kau = kauOfMonth(m);
  const body = `${monthHead(m, 'h1', '安全衛生テーマ', `${m}月号`)}
${undos ? `<section class="sec paper" aria-labelledby="mu-h"><h2 class="sec-h" id="mu-h">${m}月の運動</h2><ul class="mt-g mu">${undos}</ul></section>` : ''}
${ts
    .map(
      (t) => `<section class="sec sec-pick" aria-labelledby="mt-${t.slug}">
<a class="pick-ph" href="${themePath(t)}" tabindex="-1" aria-hidden="true">${photo(t.slug)}</a>
<h2 class="sec-h" id="mt-${t.slug}"><a href="${themePath(t)}">${titleHtml(t)}</a></h2>
<ul class="mt-g">${GYOSHU.map((g) => {
        const tg = t.gyoshu.find((x) => x.key === g.key);
        return `<li><a href="${gyoshuPath(t, g)}"><b>${esc(g.name)}</b><span>${esc(tg.rules[0][0])}</span></a>${tg.memo ? `<p class="mt-memo">${esc(tg.memo)}</p>` : ''}</li>`;
      }).join('')}</ul>
</section>`,
    )
    .join('\n')}
${kau ? `<section class="sec paper" aria-labelledby="mk-h"><h2 class="sec-h" id="mk-h">今月そろえる物</h2><ul class="krel mk"><li><a href="${kauPath(kau.key)}">${esc(kau.t)}</a><p>${esc(kau.why)}</p></li></ul></section>` : ''}
${koyomiHtml(m)}
${quizHtml(ts)}
${gidaiHtml(ts, m)}
${laws.length ? `<section class="sec paper" aria-labelledby="ml-h"><h2 class="sec-h" id="ml-h">${m}月に施行の法改正</h2><ul class="krel">${laws.map((h) => `<li><a href="${houreiPath(h)}">${fmtDate(h.date)} ${esc(h.title)}</a></li>`).join('')}</ul></section>` : ''}
${neighborsHtml(m, themes)}
${adSlot('end')}`;
  const names = ts.map((t) => t.seoName || t.title).join('・');
  return {
    path,
    html: page({
      title: `${m}月の安全衛生テーマ｜朝礼ネタ・掲示物・安全衛生委員会の議題（業種別）｜${SITE.name}`,
      description: monthDesc(m, ts, laws),
      path,
      corner: 'anzen',
      body,
      js: script('quiz'),
      crumbs: [{ name: '月ごとのテーマ', href: '/anzen/' }, { name: `${m}月の安全衛生` }],
    }),
    lastmod: ts.map((t) => t.checked).sort().pop(),
  };
}

function index(themes, from) {
  const path = '/anzen/';
  const ms = monthsOf(themes, from);
  const body = `${bandHead('月ごとのテーマ', '月ごとの安全衛生テーマ', '<p class="pg-lead">月をえらぶと、業種ごとの掲示と朝礼へ</p>')}
<section class="sec paper" aria-labelledby="am-h">
<h2 class="sec-h" id="am-h">月</h2>
<ul class="rows">${ms.map((m) => { const ts = themes.filter((t) => t.month === m); return `<li><a href="/anzen/${m}/">${photo(ts[0].slug, { sizes: '128px', cls: 'ph ph-s' })}<span><b>${m}月</b><span>${ts.map((t) => esc(t.title)).join('・')}</span></span></a></li>`; }).join('')}</ul>
<p class="u-note"><a href="/anzen/nenkan/">1年の計画は、安全衛生の年間計画の表（A4）へ</a></p>
<p class="u-note"><a href="/anzen/kiroku/">1年の実施記録の表（A4）へ</a></p>
<p class="u-note"><a href="${QUIZ_PATH}">12か月分の今月の1問をまとめて解く（問題集）</a></p>
</section>
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `月ごとの安全衛生テーマ一覧｜朝礼ネタ・掲示物・委員会の議題｜${SITE.name}`,
      description: monthsDesc(monthsOf(themes, from), themes),
      path,
      corner: 'anzen',
      body,
      crumbs: [{ name: '月ごとのテーマ' }],
    }),
  };
}

// 今月の1問の問題集 /anzen/quiz/（#88）：全テーマの1問を4月から3月の順に。正解した問いと12か月のスタンプは端末の中だけ
// （src/client/quiz.mjs の anzen-quiz-v1。送らない）。スタンプはその月の問いが全部正解で1つ
function quizPage(themes) {
  const path = QUIZ_PATH;
  const ms = REC_MONTHS.map((m) => [m, themes.filter((t) => t.month === m && t.quiz)]).filter(([, ts]) => ts.length);
  const n = ms.reduce((a, [, ts]) => a + ts.length, 0);
  const stp = `<div class="stp">${ms
    .map(([m, ts]) => `<div data-m="${m}" data-ss="${ts.map((t) => t.slug).join(' ')}" role="group" aria-label="${m}月"><span class="m">${m}月</span><span class="dots" aria-hidden="true">${ts.map(() => '<i></i>').join('')}</span></div>`)
    .join('')}</div>`;
  const body = `${bandHead('月ごとのテーマ', '今月の1問の問題集', '<p class="pg-lead">12か月分の1問を、4月から月の順に</p>')}
<section class="sec paper qs-top" aria-labelledby="qs-h">
<h2 class="sec-h" id="qs-h">正解した問い</h2>
<p class="kr-run">${n}問中<b class="qs-n">0</b>問正解</p>
${stp}
<p class="u-note">月の問いが全部正解で丸。この端末だけに残る</p>
</section>
${ms
    .map(([m, ts]) => `<section class="sec qz-s" aria-labelledby="qm-${m}">
<h2 class="sec-h" id="qm-${m}">${m}月</h2>
${ts.map((t) => qzItem(t, true, true)).join('\n')}
<p class="u-note"><a href="/anzen/${m}/">${m}月号へ</a></p>
</section>`)
    .join('\n')}`;
  return {
    path,
    html: page({
      title: `安全衛生の問題集（3択・全${n}問）｜今月の1問を12か月分｜${SITE.name}`,
      description: quizDesc(ms),
      path,
      corner: 'anzen',
      body,
      js: `${script('quiz')}\n${clientLib('quiz')}\n${script('quiz-shu')}`,
      crumbs: [{ name: '月ごとのテーマ', href: '/anzen/' }, { name: '今月の1問の問題集' }],
    }),
    lastmod: themes.map((t) => t.checked).sort().pop(),
  };
}

export default function monthPages(themes, from) {
  return [index(themes, from), ...monthsOf(themes, from).map((m) => monthPage(m, themes)), quizPage(themes)];
}
