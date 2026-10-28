// 知識のページ：1ページで1つの問い。答え1行 → うちの職場（業種・人数）→ 道具 → 表 → チェック → A4の紙 → よくある質問 → 出典
// 印刷は A4 の紙（.psheet）だけ。ほかの部分には np をつけて印刷に出さない
import { page, esc, script, adSlot, fudaLabel } from '../layout.mjs';
import { kihonHubDesc, kagakuHubDesc } from '../describe.mjs';
import { SITE } from '../site.mjs';
import { bandHead, gyoshuPath } from '../parts.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { KIHON, BANDS } from '../data/kihon/index.mjs';
import { fmtDate, HOUREI, todayJst } from '../data/hourei.mjs';
import { ALL_THEMES } from '../data/themes.mjs';
import { YOTEI } from '../data/kihon/nenkan.mjs';
import { tool } from './kihon-tools.mjs';
import { qrSvg } from '../qr.mjs';

const whenAttr = (w) => (w ? `${w.g ? ` data-g="${w.g.join(' ')}"` : ''}${w.n ? ` data-n="${w.n.join(' ')}"` : ''}` : '');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const host = SITE.url.replace('https://', '');

// 義務の区別の案（MOCK_KUBUN=a|b|c。えらんだら切りかえは消し、区分はデータに持たせる）
const MOCK = process.env.MOCK_KUBUN || '';
const KB_NAME = { g: '法令の義務', d: '努力義務', s: '職場で決めること' };
const KB_MARK = { g: '◎', d: '○', s: '△' };
const KB_LEGEND = '<p class="kb-leg"><span>◎ 法令の義務</span><span>○ 努力義務</span><span>△ 職場で決めること</span></p>';
const MOCK_KB = {
  ninzu: {
    rows: ['', '', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'd', 'g', 'd', 'g', 'g', ''],
    check: [['g', 'g', 's', 'g'], ['g', 'g', 'g', 'g', 's', 's'], ['g', 'g', 'g', 'g'], ['g', 'g']],
  },
};
const todoLi = (s, i, j, kb) =>
  `<li><label for="k-${i}-${j}"><input type="checkbox" id="k-${i}-${j}"><span>${MOCK === 'b' && kb ? `<span class="kb-m">${KB_MARK[kb]}</span>` : ''}${esc(s)}${MOCK === 'a' && kb ? `<small class="kb kb-${kb}">${KB_NAME[kb]}</small>` : ''}</span></label></li>`;
const todoMock = (p, c, i) => {
  const kbs = MOCK ? ((MOCK_KB[p.slug] || {}).check || [])[i] || [] : [];
  if (MOCK === 'c' && kbs.length) {
    return ['g', 'd', 's']
      .filter((k) => kbs.includes(k))
      .map((k) => `<h3 class="kb-h kb-${k}">${KB_NAME[k]}</h3><ul class="todo">${c.items.map((s, j) => (kbs[j] === k ? todoLi(s, i, j, '') : '')).join('')}</ul>`)
      .join('');
  }
  return `${MOCK === 'b' && i === 0 && kbs.length ? KB_LEGEND : ''}<ul class="todo">${c.items.map((s, j) => todoLi(s, i, j, kbs[j])).join('')}</ul>`;
};

const choice = (dim, items, label) =>
  `<div class="fuda kp-row" role="group" aria-label="${label}">${items
    .map(([k, t]) => `<button type="button" class="fuda-b" data-${dim}="${k}" aria-pressed="false">${t}</button>`)
    .join('')}</div>`;

const pickBlock = (p) => {
  if (!p.pick) return '';
  const fallback = p.pick.g && p.pick.n ? '業種と人数をえらぶと、答えが出ます' : p.pick.g ? '業種をえらぶと、答えが出ます' : '人数をえらぶと、答えが出ます';
  return `<section class="sec paper kp np" aria-labelledby="kp-h" data-need="${[p.pick.g ? 'g' : '', p.pick.n ? 'n' : ''].join(' ').trim()}">
<h2 class="sec-h" id="kp-h">うちの職場</h2>
${p.pick.g ? choice('g', GYOSHU.map((g) => [g.key, fudaLabel(g.label)]), '業種') : ''}
${p.pick.n ? choice('n', BANDS.map((b) => [b.key, esc(b.label)]), '人数') : ''}
<p class="kres" aria-live="polite" data-empty="${fallback}">${fallback}</p>
${p.result ? `<script type="application/json" class="kres-d">${json(p.result)}</script>` : ''}
</section>`;
};

// 表は1つ（table）か、いくつか（table を配列に）。2つめからは id に番号をつける
const tableBlock = (p) =>
  [].concat(p.table || [])
    .map((t, i) => {
      const id = i ? `kt-h${i}` : 'kt-h';
      return `<section class="sec paper np" aria-labelledby="${id}">
<h2 class="sec-h" id="${id}">${esc(t.h)}</h2>
${MOCK === 'b' && i === 0 && MOCK_KB[p.slug] ? KB_LEGEND : ''}<dl class="ktbl">${t.rows
    .map((r, ri) => { const kb = MOCK && i === 0 ? (MOCK_KB[p.slug] || {}).rows?.[ri] : ''; const mk = MOCK === 'b' && kb ? `<span class="kb-m">${KB_MARK[kb]}</span>` : ''; const lw = MOCK && MOCK !== 'b' && kb ? `<b class="kb-${kb}">${KB_NAME[kb]}</b>${r.law ? `・${esc(r.law)}` : ''}` : r.law ? esc(r.law) : ''; return `<div${whenAttr(r.when)}><dt>${esc(r.k)}</dt><dd>${mk}${esc(r.v)}${lw ? `<span class="law">${lw}</span>` : ''}${r.src ? `<a class="law" href="${esc(r.src)}" rel="noopener">${esc(r.srcT || '事例を見る')}</a>` : ''}</dd></div>`; })
    .join('')}</dl>
</section>`;
    })
    .join('\n');

const checkBlock = (p) =>
  (p.check || [])
    .map(
      (c, i) => `<section class="sec sec-todo np"${whenAttr(c.when)} aria-labelledby="kc-h${i}">
<h2 class="sec-h" id="kc-h${i}">${esc(c.h)}</h2>
${todoMock(p, c, i)}
</section>`,
    )
    .join('\n');

// 紙のすみにサイト名と、そのページの QR（印刷のときだけ出る）
const qr = (p) => qrSvg(SITE.url + p.path);
const foot = (p) => `<p class="ps-foot"><span>${esc(SITE.name)}</span><span>${host}</span>${qr(p)}</p>`;

// 年間計画の紙（/anzen/nenkan/）：列は 月・全国の運動・うちの職場のテーマ・担当・済。
// 全国の運動は YOTEI でいつも埋める。業種ごとの表（テーマ名・掲示の決まりの1つ目・その月に施行の法改正）は
// ビルドのときに4つ作って入れておき、えらんだ業種のものだけ見せる（kihon.js）。えらばないとき・JavaScript なしは空欄の表
// 法改正は、作り直した日をふくむ年度（4月〜3月）の施行日のものだけ
export const fiscalYear = (iso = todayJst()) => {
  const [y, m] = iso.split('-').map(Number);
  return m >= 4 ? y : y - 1;
};
const monthNo = (label) => parseInt(label, 10);
export const nenkanLaws = (m, fy = fiscalYear()) =>
  HOUREI.filter((h) => {
    const [y, mm] = h.date.split('-').map(Number);
    return mm === m && y === (m >= 4 ? fy : fy + 1);
  });
export const nenkanCell = (m, g, fy = fiscalYear()) => {
  const ts = ALL_THEMES.filter((t) => t.month === m);
  const laws = nenkanLaws(m, fy);
  if (!ts.length && !laws.length) return '';
  const rule = ts.length ? ts[0].gyoshu.find((x) => x.key === g.key).rules[0][0] : '';
  return `${ts.length ? `<span class="pn-t">${ts.map((t) => `<a href="${gyoshuPath(t, g)}">${esc(t.title)}</a>`).join('・')}</span>` : ''}${rule ? `<span class="pn-r">${esc(rule)}</span>` : ''}${laws.map((h) => `<span class="pn-h">${Number(h.date.slice(5, 7))}/${Number(h.date.slice(8, 10))}施行 ${esc(h.title)}</span>`).join('')}`;
};
const nenkanBodies = (s) => {
  const fy = fiscalYear();
  const body = (g) =>
    `<tbody data-pg="${g ? g.key : ''}"${g ? ' hidden' : ''}>${s.first
      .map((f) => {
        const m = monthNo(f);
        return `<tr><td>${esc(f)}</td><td class="pn-u">${esc(YOTEI[m] || '')}</td><td>${g ? nenkanCell(m, g, fy) : ''}</td>${'<td></td>'.repeat(s.cols.length - 3)}</tr>`;
      })
      .join('')}</tbody>`;
  return [null, ...GYOSHU].map(body).join('');
};

const sheetBlock = (p) => {
  const s = p.sheet;
  if (!s) return '';
  let ctl = '';
  let paper = '';
  if (s.kind === 'keiji') {
    const r0 = s.roles[0];
    ctl = `<div class="ks-ctl np">
<label for="kk-role">役目<select id="kk-role">${s.roles.map((r, i) => `<option value="${i}">${esc(r.name)}</option>`).join('')}</select></label>
<label for="kk-name">名前<input id="kk-name" type="text" maxlength="20" autocomplete="off" placeholder="名前を入れる"></label>
<p class="ks-hint">入れた名前はこの端末の中だけで使い、送りません</p>
${s.note ? `<p class="ks-hint">${esc(s.note)}</p>` : ''}
</div>
<script type="application/json" class="kk-d">${json(s.roles)}</script>`;
    paper = `<div class="psheet pk"><div class="tora" aria-hidden="true"></div><div class="ps-in">
<p class="pk-role" data-kk="role">${esc(r0.name)}</p>
<p class="pk-name" data-kk="name">　</p>
<p class="pk-sub">おもな職務</p>
<ol class="pk-duties" data-kk="duties">${r0.duties.map((d) => `<li>${esc(d)}</li>`).join('')}</ol>
<p class="pk-date">選任した日　　　　年　　月　　日</p>
${foot(p)}
</div></div>`;
  } else if (s.kind === 'form') {
    paper = `<div class="psheet pf"><div class="ps-in">
<p class="ps-title">${esc(s.title)}</p>
${s.note ? `<p class="ps-note">${esc(s.note)}</p>` : ''}
<dl class="pf-rows">${s.rows.map((r) => `<div><dt>${esc(r.k)}</dt><dd style="--l:${r.lines || 1}"></dd></div>`).join('')}</dl>
${foot(p)}
</div></div>`;
  } else if (s.kind === 'poster') {
    // 毎月のテーマの掲示と同じ形（決まり・確認欄・出典の1行）
    paper = `<div class="sheet"><div class="tora" aria-hidden="true"></div><div class="sheet-in">
<p class="s-kicker"><span>${esc(s.kicker[0])}</span><span>${esc(s.kicker[1])}</span></p>
<p class="s-title">${esc(s.title)}</p>
<ol class="rules">${s.rules.map(([a, b]) => `<li><div>${esc(a)}<span>${esc(b)}</span></div></li>`).join('')}</ol>
<table class="kakunin" aria-label="確認欄"><thead><tr><th>確認した日</th><th>名前</th><th>確認した日</th><th>名前</th></tr></thead><tbody>${'<tr><td></td><td></td><td></td><td></td></tr>'.repeat(5)}</tbody></table>
<p class="s-foot"><span>${esc(s.foot)}</span><span>${esc(SITE.name)}　${host}</span>${qr(p)}</p>
</div></div>`;
  } else if (s.kind === 'grid') {
    const first = s.first || [];
    if (s.fill === 'nenkan')
      ctl = `<div class="fuda pn-pick np" role="group" aria-label="業種">${GYOSHU.map((g) => `<button type="button" class="fuda-b" data-pg="${g.key}" aria-pressed="false">${fudaLabel(g.label)}</button>`).join('')}</div>`;
    paper = `<div class="psheet pg"><div class="ps-in">
<p class="ps-title">${esc(s.title)}</p>
${s.note ? `<p class="ps-note">${esc(s.note)}</p>` : ''}
${s.fields ? `<dl class="pg-f">${s.fields.map((f) => `<div><dt>${esc(f)}</dt><dd></dd></div>`).join('')}</dl>` : ''}
<table class="pg-t${s.fill === 'nenkan' ? ' pg-n' : ''}"><thead><tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>${s.fill === 'nenkan' ? nenkanBodies(s) : `<tbody>${Array.from({ length: s.rows }, (_, i) => `<tr>${s.cols.map((_, j) => `<td>${j === 0 && first[i] ? esc(first[i]) : ''}</td>`).join('')}</tr>`).join('')}</tbody>`}</table>
${foot(p)}
</div></div>`;
  }
  return `<section class="sec sec-poster sec-sheet" aria-labelledby="ks-h">
<h2 class="sec-h" id="ks-h">${s.kind === 'keiji' || s.kind === 'poster' ? '掲示' : '用紙'}</h2>
${ctl}
${paper}
<button class="btn print-btn" type="button">A4で印刷</button>
</section>`;
};

const faqBlock = (p) =>
  p.faq && p.faq.length
    ? `<section class="sec paper np" aria-labelledby="kf-h">
<h2 class="sec-h" id="kf-h">よくある質問</h2>
<dl class="faq">${p.faq.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>
</section>`
    : '';

const relatedBlock = (p) =>
  p.related && p.related.length
    ? `<section class="sec paper np" aria-labelledby="kr-h">
<h2 class="sec-h" id="kr-h">あわせて見る</h2>
<ul class="krel">${p.related.map((r) => `<li><a href="${esc(r.href)}">${esc(r.t)}</a></li>`).join('')}</ul>
</section>`
    : '';

const srcBlock = (p) => `<section class="sec sec-src np" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
<ol class="src">${p.src.map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol>
<p class="src-note">確認日 ${fmtDate(p.checked)}。法令は改正されることがあります。最新の内容は e-Gov 法令検索と厚生労働省の公式ページで確認してください。</p>
</section>`;

// 目次のあるコーナー（/kihon/・/kagaku/）は、パンくずに目次をはさむ
const HUBS = { '/kihon/': '基本の決まり', '/kagaku/': '化学物質' };
const hubOf = (p) => Object.keys(HUBS).find((h) => p.path.startsWith(h));
const crumbsFor = (p) => (hubOf(p) ? [{ name: HUBS[hubOf(p)], href: hubOf(p) }, { name: p.h1 }] : [{ name: p.h1 }]);
const cornerFor = (p) => (p.path.startsWith('/anzen/') ? 'anzen' : p.path.startsWith('/kihon/') ? 'kihon' : p.path.startsWith('/kagaku/') ? 'kagaku' : 'kyotsu');

function one(p) {
  const body = `${bandHead(p.band || '基本の決まり', p.h1, `<p class="k-ans">${esc(p.answer)}</p>`)}
${pickBlock(p)}
${tool(p)}
${tableBlock(p)}
${checkBlock(p)}
${sheetBlock(p)}
${faqBlock(p)}
${relatedBlock(p)}
${adSlot('end')}
${srcBlock(p)}`;
  return {
    path: p.path,
    html: page({
      title: `${p.title}｜${SITE.name}`.replace('｜｜', '｜'),
      description: p.description,
      path: p.path,
      corner: cornerFor(p),
      body,
      js: script('kihon'),
      crumbs: crumbsFor(p),
    }),
  };
}

// 目次（/kihon/・/kagaku/）。できたページだけを並べる
function hub({ path, corner, band, h1, lead, title, description, list }) {
  const body = `${bandHead(band, h1, `<p class="pg-lead">${esc(lead)}</p>`, corner)}
<section class="sec paper" aria-labelledby="kh-h">
<h2 class="sec-h" id="kh-h">ページ</h2>
<ul class="khub">${list.map((p) => `<li><a href="${p.path}"><b>${esc(p.h1)}</b><span>${esc(p.answer)}</span></a></li>`).join('')}</ul>
</section>
${adSlot('end')}`;
  return { path, html: page({ title, description, path, corner, body, crumbs: [{ name: band }] }) };
}

export default function kihonPages() {
  const kihon = KIHON.filter((p) => !p.path.startsWith('/kagaku/'));
  const kagaku = KIHON.filter((p) => p.path.startsWith('/kagaku/'));
  const hubs = [];
  if (kihon.length)
    hubs.push(hub({ path: '/kihon/', corner: 'kihon', band: '基本の決まり', h1: '安全衛生の基本の決まり', lead: '人数・選任・記録の決まりを1ページずつ', title: `安全衛生の基本の決まり 早見と用紙（推進者・人数・記録・掲示）｜${SITE.name}`, description: kihonHubDesc(kihon), list: kihon }));
  if (kagaku.length)
    hubs.push(hub({ path: '/kagaku/', corner: 'kagaku', band: '化学物質', h1: '化学物質と洗剤の安全', lead: 'まぜない・SDS・管理者を1ページずつ', title: `化学物質の管理 まぜるな危険・SDSの見方・化学物質管理者｜${SITE.name}`, description: kagakuHubDesc(kagaku), list: kagaku }));
  return [...hubs, ...KIHON.map(one)];
}
