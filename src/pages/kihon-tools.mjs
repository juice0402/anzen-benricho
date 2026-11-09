// 知識のページの計算の道具（データの tool と toolData で出す）。計算はブラウザの中だけ（src/client/kihon.js）
import { esc } from '../layout.mjs';

const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const num = (id, label) => `<label for="${id}">${esc(label)}<input id="${id}" type="number" min="0" max="9999" inputmode="numeric"></label>`;
const date = (id, label) => `<label for="${id}">${esc(label)}<input id="${id}" type="date" min="2000-01-01" max="2099-12-31"></label>`;
const pick = (id, label, items) =>
  `<label for="${id}">${esc(label)}<select id="${id}"><option value="">えらぶ</option>${items.map((t) => `<option value="${esc(t.k)}">${esc(t.t)}</option>`).join('')}</select></label>`;
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
  // 洗剤を「まぜない」：2つの種類をえらぶと、まぜると危ないかが出る
  mazenai: (d) => ({
    h: '2つの洗剤の種類をえらぶ',
    body: `<div class="kt-in">${pick('kt-a', d.input.a, d.types)}${pick('kt-b', d.input.b, d.types)}</div>`,
  }),
  // 化学物質管理者・保護具着用管理責任者が要るか
  kanrisha: (d) => ({
    h: 'うちに要るかを確かめる',
    body: `<div class="kt-in"><fieldset class="kt-q"><legend>${esc(d.q)}</legend>${d.kinds.map((t, i) => `<label for="kt-k${i}"><input type="radio" name="kt-k" id="kt-k${i}" value="${i}">${esc(t.label)}</label>`).join('')}</fieldset>
<label class="kt-chk" for="kt-mk"><input id="kt-mk" type="checkbox">${esc(d.makeLabel)}</label>
<label class="kt-chk" for="kt-pp"><input id="kt-pp" type="checkbox">${esc(d.ppeLabel)}</label></div>`,
  }),
  // 職場を測る記録帳（#77）：測った数字を決まりとくらべ、端末の中だけに月ごとに残す（src/client/sokutei.js）
  sokutei: (d) => {
    const dec = (id, label, max) => `<label for="${id}">${esc(label)}<input id="${id}" type="number" min="0" max="${max}" step="any" inputmode="decimal"></label>`;
    return {
      h: '測った数字を入れる',
      body: `<div class="kt-in sk-in">${date('sk-d', d.input.d)}<label for="sk-p">${esc(d.input.p)}<input id="sk-p" type="text" maxlength="20" autocomplete="off" placeholder="例：2階事務室"></label>
${dec('sk-co2', d.input.co2, 99999)}${dec('sk-temp', d.input.temp, 60)}${dec('sk-hum', d.input.hum, 100)}${dec('sk-lux', d.input.lux, 200000)}${dec('sk-wbgt', d.input.wbgt, 50)}</div>`,
      after: `<button type="button" class="ks-cal-b sk-save" hidden>この月・この場所の記録にする</button>
<p class="ks-hint sk-msg" aria-live="polite"></p>
<h3 class="sk-h">今年度の記録<span class="sk-fy"></span></h3>
<div class="sk-wrap"><table class="sk-t"><thead><tr><th>月</th><th>場所</th><th>CO2</th><th>気温</th><th>湿度</th><th>照度</th><th>WBGT</th><th></th></tr></thead><tbody class="sk-body"></tbody></table></div>
<p class="ks-hint sk-none">まだ記録はありません</p>`,
    };
  },
};

export const tool = (p) => {
  if (!p.tool) return '';
  const t = TOOLS[p.tool](p.toolData);
  return `<section class="sec paper np ktool" data-tool="${p.tool}" aria-labelledby="ktool-h">
<h2 class="sec-h" id="ktool-h">${t.h}</h2>
${t.body}
<div class="kt-out" aria-live="polite" hidden></div>
${t.after || ''}
${notes(p.toolData.notes)}
<script type="application/json" class="kt-d">${json(p.toolData)}</script>
</section>`;
};
