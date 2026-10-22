// 法改正
//   /hourei/          一覧：施行日の順。「うちの職場」に印をつけると、あてはまらない改正を隠す
//   /hourei/<改正>/   改正ごと：施行日・義務か努力義務か・対象、何が変わるか、職場ですること、出典
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { bandHead } from '../parts.mjs';
import { HOUREI, HOUREI_CHECKED, CONDS, houreiPath, fmtDate, inForce, todayJst } from '../data/hourei.mjs';

const NOTE = '施行日や中身は変わることがあります。厚生労働省や労働局の公式ページで確認してください。';
const srcBlock = (list) => `<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
<ol class="src">${list.map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol>
<p class="src-note">確認日 ${fmtDate(HOUREI_CHECKED)}。${NOTE}</p>
</section>`;

function list(today) {
  const path = '/hourei/';
  const rows = HOUREI.map((h) => {
    const done = inForce(h, today);
    return `<li${h.cond ? ` data-cond="${h.cond}"` : ''}><a href="${houreiPath(h)}"><span class="hr-date${done ? '' : ' soon'}">${fmtDate(h.date)}<span class="hr-st">${done ? '施行済み' : 'これから'}</span></span><b class="hr-t">${esc(h.title)}</b><span class="hr-k">${h.kind}　${esc(h.whoShort)}</span></a></li>`;
  }).join('');
  const seen = new Set();
  const src = HOUREI.flatMap((h) => h.src).filter((s) => !seen.has(s.u) && seen.add(s.u));
  const cond = `<div class="u-cond" role="group" aria-label="うちの職場">
<p class="u-note" aria-live="polite">うちの職場に印をつけると、関係する改正だけ残ります</p>
<ul class="todo">${CONDS.map((c) => `<li><label for="u-${c.key}"><input type="checkbox" id="u-${c.key}" value="${c.key}"><span>${esc(c.label)}</span></label></li>`).join('')}</ul>
</div>`;
  const body = `${bandHead('法改正', '法改正の一覧', cond)}
<section class="sec paper hr-paper" aria-labelledby="hr-h">
<h2 class="sec-h" id="hr-h">改正</h2>
<ol class="hr-list">${rows}</ol>
</section>
${srcBlock(src)}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `安全衛生の法改正の一覧（2025〜2028年）施行日と義務・努力義務｜${SITE.name}`,
      description: '熱中症の報告体制、カスハラ防止の義務化、50人未満のストレスチェック義務化など、安全衛生にかかわる法改正を施行日の順にまとめ、義務か努力義務か、どの職場が対象かを出典つきで示しています。',
      path,
      corner: 'kyotsu',
      body,
      js: script('hourei'),
      crumbs: [{ name: '法改正の一覧' }],
    }),
  };
}

function detail(h, today) {
  const path = houreiPath(h);
  const done = inForce(h, today);
  const facts = `<dl class="hr-facts">
<div><dt>施行日</dt><dd class="hr-day${done ? '' : ' soon'}">${fmtDate(h.date)}<span class="hr-st">${done ? '施行済み' : 'これから'}</span></dd></div>
<div><dt>区分</dt><dd><b>${h.kind}</b></dd></div>
<div><dt>対象</dt><dd>${esc(h.who)}</dd></div>
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
${adSlot('mid')}
${srcBlock(h.src)}
<p class="back"><a href="/hourei/">法改正の一覧</a></p>`;
  const d = fmtDate(h.date);
  return {
    path,
    html: page({
      title: `${h.title}（${d}施行・${h.kind}）｜${SITE.name}`,
      description: `${d}${done ? 'から' : 'に施行。'}${h.who.replace(/（.*$/, '')}の${h.kind}${done ? 'になった' : 'になる'}「${h.title}」。何が変わるかと、職場ですること3つを出典つきでまとめています。`,
      path,
      corner: 'kyotsu',
      body,
      crumbs: [{ name: '法改正の一覧', href: '/hourei/' }, { name: h.title }],
    }),
  };
}

export default function houreiPages(today = todayJst()) {
  return [list(today), ...HOUREI.map((h) => detail(h, today))];
}
