// 月ごとのテーマ
//   /anzen/        月の一覧（今月から先の月の順）
//   /anzen/<月>/   その月の運動・テーマ（業種ごとの掲示と朝礼へ）・その月に施行される法改正
import { page, esc, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { bandHead, monthHead, themePath, gyoshuPath, titleHtml, photo } from '../parts.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { HOUREI, houreiPath, fmtDate } from '../data/hourei.mjs';
import { monthDesc, monthsDesc } from '../describe.mjs';

const monthsOf = (themes, from) => [...new Set(themes.map((t) => t.month))].sort((a, b) => ((a - from + 12) % 12) - ((b - from + 12) % 12));

function monthPage(m, themes) {
  const ts = themes.filter((t) => t.month === m);
  const path = `/anzen/${m}/`;
  const undos = ts.filter((t) => t.undo).map((t) => `<li><b>${esc(t.undo.name)}</b><span>${esc(t.undo.span)}</span></li>`).join('');
  const laws = HOUREI.filter((h) => Number(h.date.slice(5, 7)) === m);
  const body = `${monthHead(m, 'h1', '安全衛生テーマ', `${m}月の`)}
${undos ? `<section class="sec paper" aria-labelledby="mu-h"><h2 class="sec-h" id="mu-h">${m}月の運動</h2><ul class="mt-g mu">${undos}</ul></section>` : ''}
${ts
    .map(
      (t) => `<section class="sec sec-pick" aria-labelledby="mt-${t.slug}">
<a class="pick-ph" href="${themePath(t)}" tabindex="-1" aria-hidden="true">${photo(t.slug)}</a>
<h2 class="sec-h" id="mt-${t.slug}"><a href="${themePath(t)}">${titleHtml(t)}</a></h2>
<ul class="mt-g">${GYOSHU.map((g) => {
        const tg = t.gyoshu.find((x) => x.key === g.key);
        return `<li><a href="${gyoshuPath(t, g)}"><b>${esc(g.name)}</b><span>${esc(tg.rules[0][0])}</span></a></li>`;
      }).join('')}</ul>
</section>`,
    )
    .join('\n')}
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
