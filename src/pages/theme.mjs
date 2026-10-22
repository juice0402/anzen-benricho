// テーマのページ（12月「年末の大掃除」）：業種の札で、掲示・朝礼・やること・出典が入れ替わる
// 4業種の中身は全部 HTML に書いておき（検索にも見える）、札で表示を切りかえる
import { page, esc, script, fudaLabel } from '../layout.mjs';
import { SITE } from '../site.mjs';

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
};

const sheet = (t, g) => `<div class="sheet">
<div class="tora" aria-hidden="true"></div>
<div class="sheet-in">
<p class="s-kicker"><span>${t.month}月の安全</span><span>${esc(g.label)}</span></p>
<p class="s-title">${esc(t.title)}</p>
<ol class="rules">${g.rules.map(([a, b]) => `<li><div>${esc(a)}<span>${esc(b)}</span></div></li>`).join('')}</ol>
<table class="kakunin" aria-label="確認欄"><thead><tr><th>確認した日</th><th>名前</th><th>確認した日</th><th>名前</th></tr></thead><tbody>${'<tr><td></td><td></td><td></td><td></td></tr>'.repeat(5)}</tbody></table>
<p class="s-foot"><span>出典：厚生労働省・都道府県労働局ほか</span><span>今月の安全衛生　${SITE.url.replace('https://', '')}</span></p>
</div>
</div>`;

const panel = (t, g, i) => {
  const talkLen = g.talk.join('').length;
  return `<div class="panel" id="p-${g.key}" role="tabpanel" aria-labelledby="t-${g.key}"${i ? ' hidden' : ''}>
<section class="sec sec-poster">
<h2 class="sec-h">掲示<small>A4・白黒で印刷できます</small></h2>
${sheet(t, g)}
<button class="btn print-btn" type="button">掲示を印刷</button>
</section>
<section class="sec sec-talk">
<h2 class="sec-h">朝礼<small>約${Math.round(talkLen / 10) * 10}字・1分ほど</small></h2>
<div class="talk">${g.talk.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<button class="btn copy-btn" type="button">文章をコピー</button>
</section>
<section class="sec sec-todo">
<h2 class="sec-h">担当者のやること</h2>
<ul class="todo">${g.todo.map((s, j) => `<li><label for="c-${g.key}-${j}"><input type="checkbox" id="c-${g.key}-${j}"><span>${esc(s)}</span></label></li>`).join('')}</ul>
</section>
<section class="sec sec-src">
<h2 class="sec-h">出典<small>確認日 ${fmtDate(t.checked)}</small></h2>
<ol class="src">${[...t.common, ...g.src]
    .map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a>${s.chk ? `<span class="chk">${esc(s.chk)}</span>` : ''}</li>`)
    .join('')}</ol>
<p class="src-note">${esc(t.note)}</p>
</section>
</div>`;
};

export default function theme({ data: t }) {
  const path = `/anzen/theme/${t.slug}/`;
  const body = `<header class="th-head">
<div class="th-month"><b class="mon">${t.month}<small>月</small></b><h1 class="th-title">${esc(t.title)}</h1></div>
<p class="th-undo">今月の運動 <span>${esc(t.undo.name)}</span> <span class="nw">${esc(t.undo.span)}</span></p>
</header>
<div class="fuda" role="tablist" aria-label="業種">${t.gyoshu
    .map((g, i) => `<button class="fuda-b" type="button" role="tab" id="t-${g.key}" data-k="${g.key}" aria-controls="p-${g.key}" aria-selected="${i ? 'false' : 'true'}"${i ? ' tabindex="-1"' : ''}>${fudaLabel(g.label)}</button>`)
    .join('')}</div>
${t.gyoshu.map((g, i) => panel(t, g, i)).join('\n')}`;
  return {
    path,
    html: page({
      title: `${t.month}月の安全衛生テーマ ${t.title}の掲示と朝礼｜${SITE.name}`,
      description: `${t.month}月の安全衛生のテーマ「${t.title}」。事務所・飲食・製造・清掃の業種ごとに、A4の掲示1枚、1分の朝礼、担当者のやること3つを出典つきでまとめています。`,
      path,
      corner: 'anzen',
      body,
      js: script('theme'),
      crumbs: [{ name: `${t.month}月 ${t.title}` }],
    }),
  };
}
