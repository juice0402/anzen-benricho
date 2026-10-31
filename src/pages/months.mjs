// 月ごとのテーマ
//   /anzen/        月の一覧（今月から先の月の順）
//   /anzen/<月>/   その月の運動・テーマ（業種ごとの掲示と朝礼へ）・その月に施行される法改正
import { page, esc, adSlot, script } from '../layout.mjs';
import { koyomiHtml } from '../koyomi.mjs';
import { SITE } from '../site.mjs';
import { bandHead, monthHead, themePath, gyoshuPath, titleHtml, photo } from '../parts.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { HOUREI, houreiPath, fmtDate } from '../data/hourei.mjs';
import { monthDesc, monthsDesc } from '../describe.mjs';

// 今月の1問（テーマごとに1問）。押すと正解・解説・出典が出る（src/client/quiz.js。結果は保存しない・送らない）
const KANA = ['ア', 'イ', 'ウ'];
const srcOf = (t, u) => [...t.common, ...t.gyoshu.flatMap((g) => g.src)].find((s) => s.u === u);
const quizHtml = (ts) => {
  const qs = ts.filter((t) => t.quiz);
  if (!qs.length) return '';
  return `<section class="sec qz-s" aria-labelledby="qz-h">
<h2 class="sec-h" id="qz-h">今月の1問</h2>
${qs.map((t) => {
    const q = t.quiz;
    const s = srcOf(t, q.src);
    return `<div class="qz" data-a="${q.answer}">
${qs.length > 1 ? `<p class="qz-t">${esc(t.title)}</p>` : ''}<p class="qz-q">${esc(q.q)}</p>
<ol class="q-ch">${q.choices.map((c, i) => `<li><button type="button" data-i="${i}"><i>${KANA[i]}</i><span>${esc(c)}</span></button></li>`).join('')}</ol>
<div class="qz-r" hidden><p class="qz-ok"></p><p>${esc(q.why)}</p><div class="qz-src"><p class="u-note">出典</p><ol class="src"><li><a href="${esc(q.src)}" rel="noopener">${esc(s ? s.t : q.src)}</a></li></ol></div></div>
</div>`;
  }).join('\n')}
</section>`;
};

// 今月の委員会で話すこと（テーマごとに議題の例3つ。印刷には出さない）
const gidaiHtml = (ts) => {
  const gs = ts.filter((t) => t.gidai);
  if (!gs.length) return '';
  return `<section class="sec gd-s np" aria-labelledby="gd-h">
<h2 class="sec-h" id="gd-h">今月の委員会で話すこと</h2>
<p class="pg-lead">運営者が委員会の資料に使う議題の立て方です</p>
${gs.map((t) => `${gs.length > 1 ? `<h3 class="gd-t">${esc(t.title)}</h3>` : ''}<ul class="gd">${t.gidai.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>`).join('\n')}
<p class="u-note">委員会のない職場は、朝礼や打ち合わせの議題に</p>
</section>`;
};

const monthsOf = (themes, from) => [...new Set(themes.map((t) => t.month))].sort((a, b) => ((a - from + 12) % 12) - ((b - from + 12) % 12));

function monthPage(m, themes) {
  const ts = themes.filter((t) => t.month === m);
  const path = `/anzen/${m}/`;
  const undos = ts.filter((t) => t.undo).map((t) => `<li><b>${esc(t.undo.name)}</b><span>${esc(t.undo.span)}</span></li>`).join('');
  const laws = HOUREI.filter((h) => Number(h.date.slice(5, 7)) === m);
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
${koyomiHtml(m)}
${quizHtml(ts)}
${gidaiHtml(ts)}
${laws.length ? `<section class="sec paper" aria-labelledby="ml-h"><h2 class="sec-h" id="ml-h">${m}月に施行の法改正</h2><ul class="krel">${laws.map((h) => `<li><a href="${houreiPath(h)}">${fmtDate(h.date)} ${esc(h.title)}</a></li>`).join('')}</ul></section>` : ''}
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

export default function monthPages(themes, from) {
  return [index(themes, from), ...monthsOf(themes, from).map((m) => monthPage(m, themes))];
}
