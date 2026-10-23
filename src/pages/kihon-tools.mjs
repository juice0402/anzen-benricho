// 知識のページの計算の道具（データの tool と toolData で出す）。計算はブラウザの中だけ（src/client/kihon.js）
import { esc } from '../layout.mjs';

const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const num = (id, label) => `<label for="${id}">${esc(label)}<input id="${id}" type="number" min="0" max="9999" inputmode="numeric"></label>`;
const date = (id, label) => `<label for="${id}">${esc(label)}<input id="${id}" type="date" min="2000-01-01" max="2099-12-31"></label>`;
const notes = (list) => (list && list.length ? `<ul class="kt-notes">${list.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '');

const TOOLS = {
  toilet: (d) => ({
    h: '便所の数を出す',
    body: `<div class="kt-in">${num('kt-m', d.input.m)}${num('kt-f', d.input.f)}${num('kt-k', d.input.k)}</div>
<p class="kt-def">独立個室型：${esc(d.kojitsuDef)}</p>`,
  }),
  shishobyo: (d) => ({
    h: '報告の様式と期限を出す',
    body: `<div class="kt-in">${date('kt-a', d.input.injured)}${date('kt-b', d.input.back)}<label class="kt-chk" for="kt-x"><input id="kt-x" type="checkbox">${esc(d.input.death)}</label></div>`,
  }),
  part: (d) => ({
    h: 'パート・アルバイトは健康診断の対象か',
    body: `<div class="kt-in"><fieldset class="kt-q"><legend>雇う期間</legend>${d.term.map((t, i) => `<label for="kt-t${i}"><input type="radio" name="kt-t" id="kt-t${i}" value="${i}">${esc(t.label)}</label>`).join('')}</fieldset>
<label class="kt-chk" for="kt-s"><input id="kt-s" type="checkbox">${esc(d.tokuteiLabel)}</label>
${num('kt-hr', 'この人の週の所定労働時間（時間）')}${num('kt-nr', '同じ仕事をする通常の労働者の週の所定労働時間（時間）')}</div>
<p class="kt-def">${esc(d.note)}</p>`,
  }),
};

export const tool = (p) => {
  if (!p.tool) return '';
  const t = TOOLS[p.tool](p.toolData);
  return `<section class="sec paper np ktool" data-tool="${p.tool}" aria-labelledby="ktool-h">
<h2 class="sec-h" id="ktool-h">${t.h}</h2>
${t.body}
<div class="kt-out" aria-live="polite" hidden></div>
${notes(p.toolData.notes)}
<script type="application/json" class="kt-d">${json(p.toolData)}</script>
</section>`;
};
