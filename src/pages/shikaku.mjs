// 資格の更新の期限 /shikaku/koushin/：資格と修了した日をえらぶと、次の期限と再講習の時期が出る（計算はブラウザの中だけ）
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { bandHead } from '../parts.mjs';
import { SHIKAKU, SHIKAKU_CHECKED } from '../data/shikaku.mjs';
import { fmtDate } from '../data/hourei.mjs';

export default function shikakuPages() {
  const path = '/shikaku/koushin/';
  const form = `<section class="sec paper ks" aria-labelledby="ks-h">
<h2 class="sec-h" id="ks-h">修了した日から期限を出す</h2>
<fieldset class="ks-pick"><legend>資格</legend>
${SHIKAKU.map((s, i) => `<label for="k-${s.key}"><input type="radio" name="k" id="k-${s.key}" value="${s.key}" data-years="${s.years}" data-early="${s.early}"${i ? '' : ' checked'}><span>${esc(s.name)}</span></label>`).join('\n')}
</fieldset>
<label class="ks-date" for="k-day">修了した日<input type="date" id="k-day" min="2000-01-01" max="2099-12-31"></label>
<div class="ks-out" aria-live="polite" hidden>
<p class="ks-lim">期限 <b id="k-lim"></b></p>
<p class="ks-left" id="k-left"></p>
<p class="ks-re" id="k-re"></p>
<p class="ks-note">正確な期限は、修了証書の表示で確かめてください。</p>
</div>
</section>`;
  const table = `<section class="sec paper" aria-labelledby="rule-h">
<h2 class="sec-h" id="rule-h">更新の決まり</h2>
<dl class="ks-rules">${SHIKAKU.map((s) => `<dt>${esc(s.name)}<span>${s.years}年ごと</span></dt><dd><p>${esc(s.why)}</p><p>${esc(s.rule)}</p><p>再講習：${esc(s.when)}</p></dd>`).join('')}</dl>
</section>`;
  const src = `<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
<ol class="src">${SHIKAKU.flatMap((s) => s.src).map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol>
<p class="src-note">確認日 ${fmtDate(SHIKAKU_CHECKED)}。講習の日程と申し込みは、協会の公式ページで確認してください。</p>
</section>`;
  const body = `${bandHead('講習・資格', '資格の更新の期限', '<p class="pg-lead">修了した日から、次の期限が出ます</p>')}
${form}
${table}
${src}
${adSlot('end')}`;
  return [
    {
      path,
      html: page({
        title: `清掃作業監督者・病院清掃受託責任者の更新の期限と再講習の時期｜${SITE.name}`,
        description: '清掃作業監督者（6年ごと）と病院清掃受託責任者（4年ごと）の修了した日を入れると、次の期限と、再講習を受ける時期が出ます。入れた日付はこの端末の中だけで計算し、送りません。',
        path,
        corner: 'kyotsu',
        body,
        js: script('koushin'),
        crumbs: [{ name: '資格の更新の期限' }],
      }),
    },
  ];
}
