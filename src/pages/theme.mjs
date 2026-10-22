// 毎月のテーマ（例 12月「年末の大掃除」）
//   /anzen/theme/<slug>/          テーマの入口：運動、業種ごとに多いけが、業種をえらぶ
//   /anzen/theme/<slug>/<業種>/   業種のページ：掲示・朝礼・やること・出典（1業種1ページ。検索と広告の審査で中身が1ページにまとまるように）
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { themePath, gyoshuPath, fuda, monthHead } from '../parts.mjs';

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
};
const head = (t, h, sub = '') => monthHead(t.month, h, t.title, sub, t.undo);

const srcList = (list) =>
  `<ol class="src">${list
    .map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a>${s.chk ? `<span class="chk">${esc(s.chk)}</span>` : ''}</li>`)
    .join('')}</ol>`;

const sheet = (t, g) => `<div class="sheet">
<div class="tora" aria-hidden="true"></div>
<div class="sheet-in">
<p class="s-kicker"><span>${t.month}月の安全</span><span>${esc(g.label)}</span></p>
<p class="s-title">${esc(t.title)}</p>
<ol class="rules">${g.rules.map(([a, b]) => `<li><div>${esc(a)}<span>${esc(b)}</span></div></li>`).join('')}</ol>
<table class="kakunin" aria-label="確認欄"><thead><tr><th>確認した日</th><th>名前</th><th>確認した日</th><th>名前</th></tr></thead><tbody>${'<tr><td></td><td></td><td></td><td></td></tr>'.repeat(5)}</tbody></table>
<p class="s-foot"><span>出典：厚生労働省・労働局ほか</span><span>今月の安全衛生　${SITE.url.replace('https://', '')}</span></p>
</div>
</div>`;

// テーマの入口
function overview(t) {
  const path = themePath(t);
  const body = `${head(t, 'h1')}
<p class="th-lead">業種をえらぶと、その業種の掲示と朝礼が出ます。</p>
${fuda((g) => gyoshuPath(t, g))}
<section class="sec sec-memo" aria-labelledby="memo-h">
<h2 class="sec-h" id="memo-h">業種ごとに多いけが</h2>
<dl class="memo">${t.gyoshu.map((g) => `<dt><a href="${gyoshuPath(t, g)}">${esc(g.name)}</a></dt><dd>${esc(g.memo)}</dd>`).join('')}</dl>
</section>
<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
${srcList([...t.common, ...t.gyoshu.map((g) => g.src[0])])}
<p class="src-note">確認日 ${fmtDate(t.checked)}。${esc(t.note)}</p>
</section>
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `${t.month}月の安全衛生テーマ ${t.title}の掲示と朝礼｜${SITE.name}`,
      description: `${t.month}月の安全衛生のテーマ「${t.title}」。事務所・店舗、飲食店、製造業、清掃・ビルメンの業種ごとに、印刷して貼れる掲示と1分で話せる朝礼の文を出典つきでまとめています。`,
      path,
      corner: 'anzen',
      body,
      js: script('remember'),
      crumbs: [{ name: `${t.month}月 ${t.title}` }],
    }),
  };
}

// 業種のページ
function gyoshuPage(t, g) {
  const path = gyoshuPath(t, g);
  const body = `${head(t, 'h1', g.label)}
${fuda((x) => gyoshuPath(t, x), g.key)}
<section class="sec sec-poster" aria-labelledby="poster-h">
<h2 class="sec-h" id="poster-h">掲示</h2>
${sheet(t, g)}
<button class="btn print-btn" type="button">A4で印刷</button>
</section>
<section class="sec sec-talk" aria-labelledby="talk-h">
<h2 class="sec-h" id="talk-h">朝礼</h2>
<div class="talk">${g.talk.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<button class="btn copy-btn" type="button">文章をコピー</button>
</section>
<section class="sec sec-todo" aria-labelledby="todo-h">
<h2 class="sec-h" id="todo-h">担当者のやること</h2>
<ul class="todo">${g.todo.map((s, j) => `<li><label for="c-${j}"><input type="checkbox" id="c-${j}"><span>${esc(s)}</span></label></li>`).join('')}</ul>
</section>
${adSlot('mid')}
<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
${srcList([...t.common, ...g.src])}
<p class="src-note">確認日 ${fmtDate(t.checked)}。${esc(t.note)}</p>
</section>`;
  return {
    path,
    html: page({
      title: `${g.name}の${t.title} 安全の掲示と朝礼（${t.month}月）｜${SITE.name}`,
      description: `${g.name}向けの${t.month}月の安全衛生テーマ「${t.title}」。「${g.rules[0][0]}」「${g.rules[1][0]}」などをA4の掲示にして、1分で話せる朝礼の文と出典もつけています。`,
      path,
      corner: 'anzen',
      body,
      js: script('gyoshu'),
      crumbs: [{ name: `${t.month}月 ${t.title}`, href: themePath(t) }, { name: g.label }],
    }),
  };
}

export default function theme(t) {
  return [overview(t), ...t.gyoshu.map((g) => gyoshuPage(t, g))];
}
