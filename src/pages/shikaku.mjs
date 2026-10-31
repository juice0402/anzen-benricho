// 資格の更新の期限：入口 /shikaku/koushin/（資格をえらぶ）と、資格ごとのページ /shikaku/koushin/<page>/（えらばせない）
// 計算はブラウザの中だけ（src/client/koushin.js・ics.mjs）
import { page, esc, script, clientLib, adSlot } from '../layout.mjs';
import { koushinDesc, koushinPageDesc } from '../describe.mjs';
import { SITE } from '../site.mjs';
import { bandHead, SAKUTTO_SEISOU } from '../parts.mjs';
import { SHIKAKU, SHIKAKU_CHECKED, KOUSHIN_PAGES, koushinPath } from '../data/shikaku.mjs';
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
${table}
<section class="sec paper" aria-labelledby="memo-h">
<h2 class="sec-h" id="memo-h">資格ごとのページ</h2>
<p>運営者は、病院清掃受託責任者・清掃作業監督者・甲種防火管理者・防災管理者の4つとも持っています。講習を受けたときのことは、資格ごとのページに書きました。</p>
<ul class="krel">${pages.map((p) => `<li><a href="${koushinPath(p.page)}">${esc(p.h1)}</a></li>`).join('')}</ul>
</section>
<section class="sec paper" aria-labelledby="sr-h">
<h2 class="sec-h" id="sr-h">あわせて見る</h2>
<ul class="krel"><li><a href="/shikaku/kigen/">期限のある資格・ない資格</a></li><li><a href="/shikaku/tokubetsu/">特別教育の一覧</a></li><li><a href="/anzen/theme/oosouji/seisou/">清掃・ビルメンの年末の大掃除</a></li><li><a href="/anzen/theme/kansen/seisou/">清掃・ビルメンの冬の感染症（おう吐物の処理）</a></li><li>${SAKUTTO_SEISOU}</li></ul>
</section>
${srcBlock(uniq, SHIKAKU_CHECKED, '講習の日程と申し込みは、協会と消防本部の案内で確認してください。')}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `清掃作業監督者・病院清掃受託責任者の更新の期限と再講習の時期｜${SITE.name}`,
      description: koushinDesc(SHIKAKU),
      path,
      corner: 'kyotsu',
      body,
      js: js(),
      crumbs: [{ name: '資格の更新の期限' }],
    }),
    lastmod: [SHIKAKU_CHECKED, ...pages.map((p) => p.checked)].sort().pop(),
  };
}

function detail(p) {
  const path = koushinPath(p.page);
  const s = SHIKAKU.find((x) => x.key === p.calc);
  const keys = SHIKAKU.filter((x) => x.page === p.page).map((x) => x.key);
  const rules = `<section class="sec paper" aria-labelledby="rule-h">
<h2 class="sec-h" id="rule-h">更新の決まり</h2>
<dl class="ks-rules">${p.rules.map((r) => `<dt>${esc(r.h)}</dt><dd>${r.p.map((t) => `<p>${esc(t)}</p>`).join('')}</dd>`).join('')}</dl>
</section>`;
  const rel = p.related.map((r) => `<li>${r.sakutto ? SAKUTTO_SEISOU : `<a href="${r.href}">${esc(r.t)}</a>`}</li>`).join('');
  const body = `${bandHead('講習・資格', p.h1, `<p class="pg-lead">${esc(p.lead)}</p>`, p.photo)}
${form(path, { pick: false, fixed: { s, keys }, paper: p.paper, note: p.note || '' })}
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
    lastmod: p.checked,
  };
}

export default function shikakuPages() {
  return [entrance(), ...KOUSHIN_PAGES.map(detail)];
}
