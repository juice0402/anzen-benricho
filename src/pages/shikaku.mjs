// 資格の更新の期限 /shikaku/koushin/：資格と修了した日をえらぶと、次の期限と再講習の時期が出る（計算はブラウザの中だけ）
import { page, esc, script, clientLib, adSlot } from '../layout.mjs';
import { koushinDesc } from '../describe.mjs';
import { SITE } from '../site.mjs';
import { bandHead, SAKUTTO_SEISOU } from '../parts.mjs';
import { SHIKAKU, SHIKAKU_CHECKED } from '../data/shikaku.mjs';
import { fmtDate } from '../data/hourei.mjs';

export default function shikakuPages() {
  const path = '/shikaku/koushin/';
  const form = `<section class="sec paper ks" aria-labelledby="ks-h">
<h2 class="sec-h" id="ks-h">期限を出す</h2>
<fieldset class="ks-pick"><legend>資格</legend>
${SHIKAKU.map((s, i) => `<label for="k-${s.key}"><input type="radio" name="k" id="k-${s.key}" value="${s.key}" data-years="${s.years}" data-early="${s.early}" data-memo="${esc(`${s.rule.split('。')[0]}。再講習：${s.when}`)}"${i ? '' : ' checked'}><span>${esc(s.name)}</span></label>`).join('\n')}
</fieldset>
<label class="ks-date" for="k-day">修了証書の日付<input type="date" id="k-day" min="2000-01-01" max="2099-12-31"></label>
<div class="ks-out" aria-live="polite" hidden>
<p class="ks-lim">期限 <b id="k-lim"></b></p>
<p class="ks-left" id="k-left"></p>
<p class="ks-re" id="k-re"></p>
<p class="ks-note">正確な期限は、修了証書の表示で確かめてください。</p>
<p class="ks-cal"><button type="button" class="ks-cal-b" id="k-cal" data-url="${SITE.url}${path}">カレンダーに入れる</button><span class="ks-note">期限・6か月前・1か月前の予定が入ります</span></p>
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
  const body = `${bandHead('講習・資格', '清掃作業監督者などの更新の期限', '<p class="pg-lead">修了証書の日付から、次の期限が出ます</p>', 'shikaku')}
${form}
${table}
<section class="sec paper" aria-labelledby="sr-h">
<h2 class="sec-h" id="sr-h">あわせて見る</h2>
<ul class="krel"><li><a href="/shikaku/kigen/">期限のある資格・ない資格</a></li><li><a href="/shikaku/tokubetsu/">特別教育の一覧</a></li><li><a href="/anzen/theme/oosouji/seisou/">清掃・ビルメンの年末の大掃除</a></li><li><a href="/anzen/theme/kansen/seisou/">清掃・ビルメンの冬の感染症（おう吐物の処理）</a></li><li>${SAKUTTO_SEISOU}</li></ul>
</section>
${src}
${adSlot('end')}`;
  return [
    {
      path,
      html: page({
        title: `清掃作業監督者・病院清掃受託責任者の更新の期限と再講習の時期｜${SITE.name}`,
        description: koushinDesc(SHIKAKU),
        path,
        corner: 'kyotsu',
        body,
        js: `${clientLib('ics')}\n${script('koushin')}`,
        crumbs: [{ name: '資格の更新の期限' }],
      }),
      lastmod: SHIKAKU_CHECKED,
    },
  ];
}
