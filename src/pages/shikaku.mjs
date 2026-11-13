// 資格の更新の期限：入口 /shikaku/koushin/（資格をえらぶ）と、資格ごとのページ /shikaku/koushin/<page>/（えらばせない）
// 計算はブラウザの中だけ（src/client/koushin.js・ics.mjs）
import { page, esc, script, clientLib, adSlot } from '../layout.mjs';
import { koushinDesc, koushinPageDesc } from '../describe.mjs';
import { SITE } from '../site.mjs';
import { bandHead, SAKUTTO_SEISOU, SAKUTTO_GENBA, yomiBackLi, yomiBack } from '../parts.mjs';
import { KOUSHIN_KANREN, relKey, relD, SAKUTTO_D, MAX_KANREN } from '../data/kanren.mjs';
import { SHIKAKU, SHIKAKU_CHECKED, NITTEI_CHECKED, KOUSHIN_PAGES, koushinPath } from '../data/shikaku.mjs';
import { fmtDate } from '../data/hourei.mjs';

const memoOf = (s) => `${s.rule.split('。')[0]}。再講習：${s.when}`;
const attrs = (s) =>
  `value="${s.key}" data-name="${esc(s.name)}" data-years="${s.years}" data-early="${s.early}"${s.count ? ` data-count="${s.count}"` : ''} data-memo="${esc(memoOf(s))}"`;

// 計算の紙。pick が true なら資格をえらぶ（入口）、ページでは hidden で1つ
const form = (path, { pick = true, fixed = null, paper = '修了証書', note = '' } = {}) => `<section class="sec paper ks" aria-labelledby="ks-h">
<h2 class="sec-h" id="ks-h">期限を出す</h2>
${pick
    ? `<fieldset class="ks-pick"><legend>資格</legend>
${SHIKAKU.map((s, i) => `<label for="k-${s.key}"><input type="radio" name="k" id="k-${s.key}" ${attrs(s)}${i ? '' : ' checked'}><span>${esc(s.name)}</span></label>`).join('\n')}
</fieldset>`
    : `<input type="hidden" name="k" ${attrs(fixed.s)} data-keys="${fixed.keys.join(' ')}">`}
<label class="ks-date" for="k-day">${esc(paper)}の日付<input type="date" id="k-day" min="2000-01-01" max="2099-12-31"></label>
<div class="ks-out" aria-live="polite" hidden>
<p class="ks-lim">期限 <b id="k-lim"></b></p>
<p class="ks-left" id="k-left"></p>
<p class="ks-re" id="k-re"></p>
<p class="ks-note">正確な期限は、${esc(paper)}の表示で確かめてください。</p>
<p class="ks-cal"><button type="button" class="ks-cal-b" id="k-cal" data-url="${SITE.url}${path}">カレンダーに入れる</button><span class="ks-note">期限・6か月前・1か月前の予定が入ります</span></p>
</div>
${note ? `<p class="ks-note">${esc(note)}</p>` : ''}
</section>`;

const srcBlock = (list, checked, tail) => `<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
<ol class="src">${list.map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol>
<p class="src-note">確認日 ${fmtDate(checked)}。${tail}</p>
</section>`;

// 再講習の日程・形・受講料（期限の計算のすぐ下。知識のページの表 .ktbl を使う）
const NT_ROWS = [['主催', 'shusai'], ['いつ', 'itsu'], ['どこで（形）', 'doko'], ['受講料', 'ryokin'], ['申し込み', 'moushikomi']];
const nitteiBlock = (n) => `<section class="sec paper" aria-labelledby="nt-h">
<h2 class="sec-h" id="nt-h">再講習の日程と受講料</h2>
<dl class="ktbl">${NT_ROWS.map(([k, f]) => `<div><dt>${k}</dt><dd>${esc(n[f])}</dd></div>`).join('')}<div><dt>出典</dt><dd>${n.src.map((s) => `<a class="law" href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a>`).join('')}</dd></div><div><dt>確認日</dt><dd>${fmtDate(n.checked)}</dd></div></dl>
</section>`;

const js = () => `${clientLib('ics')}\n${script('koushin')}`;

function entrance() {
  const path = '/shikaku/koushin/';
  const pages = KOUSHIN_PAGES;
  // 入口の決まりは資格ごとに2行まで。くわしい話は各ページだけに書く
  const table = `<section class="sec paper" aria-labelledby="rule-h">
<h2 class="sec-h" id="rule-h">更新の決まり</h2>
<dl class="ks-rules">${SHIKAKU.map((s) => `<dt><a href="${koushinPath(s.page)}">${esc(s.name)}</a><span>${esc(s.every)}</span></dt><dd><p>${esc(s.why)}。</p><p>${esc(s.rule.split('。')[0])}。</p></dd>`).join('')}</dl>
</section>`;
  const uniq = [...new Map(SHIKAKU.flatMap((s) => s.src).map((s) => [s.u, s])).values()];
  const body = `${bandHead('講習・資格', '清掃作業監督者などの更新の期限', '<p class="pg-lead">修了証書の日付から、次の期限が出ます</p>', 'shikaku')}
${form(path)}
<section class="sec paper" aria-labelledby="nt-h">
<h2 class="sec-h" id="nt-h">再講習の日程と受講料</h2>
<dl class="ktbl">${SHIKAKU.map((s) => `<div><dt><a href="${koushinPath(s.page)}">${esc(s.name)}</a></dt><dd>${esc(s.ichi)}</dd></div>`).join('')}</dl>
<p class="ks-note">確認日 ${fmtDate(NITTEI_CHECKED)}。出典は資格ごとのページに</p>
</section>
${table}
<section class="sec paper" aria-labelledby="memo-h">
<h2 class="sec-h" id="memo-h">資格ごとのページ</h2>
<p>運営者は、病院清掃受託責任者・清掃作業監督者・甲種防火管理者・防災管理者の4つとも持っています。講習を受けたときのことは、資格ごとのページに書きました。</p>
<ul class="krel">${pages.map((p) => `<li><a href="${koushinPath(p.page)}">${esc(p.h1)}</a></li>`).join('')}</ul>
</section>
<section class="sec paper" aria-labelledby="sr-h">
<h2 class="sec-h" id="sr-h">あわせて見る</h2>
<ul class="krel"><li><a href="/shikaku/kigen/">期限のある資格・ない資格</a></li><li><a href="/shikaku/tokubetsu/">特別教育の一覧</a></li><li><a href="/anzen/theme/oosouji/seisou/">清掃・ビルメンの年末の大掃除</a></li><li><a href="/anzen/theme/kansen/seisou/">清掃・ビルメンの冬の感染症（おう吐物の処理）</a></li><li>${SAKUTTO_SEISOU}</li><li>${SAKUTTO_GENBA}</li>${yomiBackLi(path)}</ul>
</section>
${srcBlock(uniq, SHIKAKU_CHECKED, '講習の日程と申し込みは、協会と消防本部の案内で確認してください。')}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `清掃作業監督者・病院清掃受託責任者の再講習｜期限・日程・受講料｜${SITE.name}`,
      description: koushinDesc(SHIKAKU, KOUSHIN_PAGES),
      path,
      corner: 'kyotsu',
      body,
      js: js(),
      crumbs: [{ name: '資格の更新の期限' }],
    }),
    lastmod: [SHIKAKU_CHECKED, NITTEI_CHECKED, ...pages.map((p) => p.checked)].sort().pop(),
  };
}

// あわせて見る（#100）：読みもの → 資格どうし・テーマ（src/data/kanren.mjs）→ related。どの行にも理由の1行・5本まで
export const koushinRel = (p) => {
  const all = [
    ...yomiBack(koushinPath(p.page)),
    ...(KOUSHIN_KANREN[p.page] || []),
    ...p.related.flatMap((r) => (r.sakutto
      ? [{ a: SAKUTTO_SEISOU, href: 'sakutto:seisou', d: SAKUTTO_D.seisou }, { a: SAKUTTO_GENBA, href: 'sakutto:genba', d: SAKUTTO_D.genba }]
      : [{ ...r, d: r.d || relD(r.href) }])),
  ];
  const seen = new Set([koushinPath(p.page)]);
  return all.filter((r) => {
    const key = relKey(r.href);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_KANREN);
};

function detail(p) {
  const path = koushinPath(p.page);
  const s = SHIKAKU.find((x) => x.key === p.calc);
  const keys = SHIKAKU.filter((x) => x.page === p.page).map((x) => x.key);
  const rules = `<section class="sec paper" aria-labelledby="rule-h">
<h2 class="sec-h" id="rule-h">更新の決まり</h2>
<dl class="ks-rules">${p.rules.map((r) => `<dt>${esc(r.h)}</dt><dd>${r.p.map((t) => `<p>${esc(t)}</p>`).join('')}</dd>`).join('')}</dl>
</section>`;
  const rel = koushinRel(p).map((r) => `<li>${r.a ? r.a.replace('</a>', `<span class="ym-d">${esc(r.d)}</span></a>`) : `<a href="${r.href}">${esc(r.t)}<span class="ym-d">${esc(r.d)}</span></a>`}</li>`).join('');
  const body = `${bandHead('講習・資格', p.h1, `<p class="pg-lead">${esc(p.lead)}</p>`, p.photo)}
${form(path, { pick: false, fixed: { s, keys }, paper: p.paper, note: p.note || '' })}
${nitteiBlock(p.nittei)}
${rules}
<section class="sec paper" aria-labelledby="kata-h">
<h2 class="sec-h" id="kata-h">再講習の形と申し込み</h2>
${p.kata.map((t) => `<p>${esc(t)}</p>`).join('\n')}
</section>
<section class="sec paper" aria-labelledby="memo-h">
<h2 class="sec-h" id="memo-h">運営者が受けたときのこと</h2>
${p.memo.map((t) => `<p>${esc(t)}</p>`).join('\n')}
</section>
<section class="sec paper" aria-labelledby="kf-h">
<h2 class="sec-h" id="kf-h">よくある質問</h2>
<dl class="faq">${p.faq.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>
</section>
<section class="sec paper" aria-labelledby="sr-h">
<h2 class="sec-h" id="sr-h">あわせて見る</h2>
<ul class="krel">${rel}</ul>
</section>
${srcBlock(p.src, p.checked, p.calc === 'kouhou' ? '時間と形は、建物のある地域の消防本部の案内で確認してください。' : '講習の日程と申し込みは、協会の公式ページで確認してください。')}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `${p.title}｜${SITE.name}`,
      description: koushinPageDesc(p, s),
      path,
      corner: 'kyotsu',
      body,
      js: js(),
      crumbs: [{ name: '資格の更新の期限', href: '/shikaku/koushin/' }, { name: p.h1 }],
    }),
    lastmod: [p.checked, p.nittei.checked].sort().pop(),
  };
}

export default function shikakuPages() {
  return [entrance(), ...KOUSHIN_PAGES.map(detail)];
}
