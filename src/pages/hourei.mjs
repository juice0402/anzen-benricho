// 法改正
//   /hourei/          一覧：施行日の順。「うちの職場」に印をつけると、あてはまらない改正を隠す
//   /hourei/<改正>/   改正ごと：施行日・義務か努力義務か・対象、何が変わるか、職場ですること、出典
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { bandHead } from '../parts.mjs';
import { HOUREI, HOUREI_CHECKED, CONDS, houreiPath, fmtDate, inForce, todayJst } from '../data/hourei.mjs';
import { houreiDesc, houreiListDesc } from '../describe.mjs';

const NOTE = '施行日や中身は変わることがあります。厚生労働省や労働局の公式ページで確認してください。';
const srcBlock = (list) => `<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
<ol class="src">${list.map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol>
<p class="src-note">確認日 ${fmtDate(HOUREI_CHECKED)}。${NOTE}</p>
</section>`;

function list(today) {
  const path = '/hourei/';
  // これから（近い順）を先に、施行済み（新しい順）をあとに
  const order = [...HOUREI.filter((h) => !inForce(h, today)), ...HOUREI.filter((h) => inForce(h, today)).reverse()];
  const rows = order.map((h) => {
    const done = inForce(h, today);
    return `<li${h.cond ? ` data-cond="${h.cond}"` : ''}><a href="${houreiPath(h)}"><span class="hr-date${done ? '' : ' soon'}">${fmtDate(h.date)}<span class="hr-st">${done ? '施行済み' : 'これから'}</span></span><b class="hr-t">${esc(h.title)}</b><span class="hr-k">${h.kind}　${esc(h.whoShort)}</span></a></li>`;
  }).join('');
  const seen = new Set();
  const src = HOUREI.flatMap((h) => h.src).filter((s) => !seen.has(s.u) && seen.add(s.u));
  const cond = `<div class="u-cond" role="group" aria-label="うちの職場">
<p class="u-note" aria-live="polite">うちの職場に印をつけると、関係する改正だけ残ります</p>
<ul class="todo">${CONDS.map((c) => `<li><label for="u-${c.key}"><input type="checkbox" id="u-${c.key}" value="${c.key}"><span>${esc(c.label)}</span></label></li>`).join('')}</ul>
</div>`;
  const body = `${bandHead('法改正', '法改正の一覧', cond, 'hourei')}
<section class="sec paper hr-paper" aria-labelledby="hr-h">
<h2 class="sec-h" id="hr-h">改正</h2>
<ol class="hr-list">${rows}</ol>
</section>
${srcBlock(src)}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `労働安全衛生法などの改正 2026・2027 一覧｜施行日と義務・努力義務｜${SITE.name}`,
      description: houreiListDesc(HOUREI, HOUREI.filter((h) => !inForce(h, today)).sort((a, b) => (a.date < b.date ? -1 : 1))[0], fmtDate),
      path,
      corner: 'kyotsu',
      body,
      js: script('hourei'),
      crumbs: [{ name: '法改正の一覧' }],
    }),
    lastmod: HOUREI_CHECKED,
  };
}

function detail(h, today) {
  const path = houreiPath(h);
  const done = inForce(h, today);
  const facts = `<dl class="hr-facts">
<div><dt>施行日</dt><dd class="hr-day${done ? '' : ' soon'}">${fmtDate(h.date)}<span class="hr-st">${done ? '施行済み' : 'これから'}</span></dd></div>
<div><dt>区分</dt><dd><b>${h.kind}</b></dd></div>
<div><dt>対象</dt><dd>${esc(h.who)}</dd></div>
${h.bassoku ? `<div><dt>罰則</dt><dd>${esc(h.bassoku)}</dd></div>` : ''}
${h.todokede ? `<div><dt>届出</dt><dd>${esc(h.todokede)}</dd></div>` : ''}
</dl>`;
  const body = `${bandHead('法改正', h.title, facts)}
<section class="sec paper" aria-labelledby="ch-h">
<h2 class="sec-h" id="ch-h">何が変わるか</h2>
<div class="hr-change">${h.change.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
</section>
<section class="sec sec-todo" aria-labelledby="todo-h">
<h2 class="sec-h" id="todo-h">職場ですること</h2>
<ul class="todo">${h.todo.map((s, j) => `<li><label for="c-${j}"><input type="checkbox" id="c-${j}"><span>${esc(s)}</span></label></li>`).join('')}</ul>
</section>
${h.related && h.related.length ? `<section class="sec paper" aria-labelledby="rel-h">\n<h2 class="sec-h" id="rel-h">あわせて見る</h2>\n<ul class="krel">${h.related.map((r) => `<li><a href="${r.href}">${esc(r.t)}</a></li>`).join('')}</ul>\n</section>` : ''}
${adSlot('mid')}
${srcBlock(h.src)}
<p class="back"><a href="/hourei/">法改正の一覧</a></p>`;
  const d = fmtDate(h.date);
  return {
    path,
    html: page({
      title: `${h.seoTitle || `${h.title}（${d}施行・${h.kind}）`}｜${SITE.name}`,
      description: houreiDesc(h, done, fmtDate),
      path,
      corner: 'kyotsu',
      body,
      crumbs: [{ name: '法改正の一覧', href: '/hourei/' }, { name: h.title }],
    }),
    lastmod: HOUREI_CHECKED,
  };
}

export default function houreiPages(today = todayJst()) {
  return [list(today), ...HOUREI.map((h) => detail(h, today))];
}
