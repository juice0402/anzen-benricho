// 毎月のテーマ（例 12月「年末の大掃除」）
//   /anzen/theme/<slug>/          テーマの入口：運動、業種ごとに多いけが、業種をえらぶ
//   /anzen/theme/<slug>/<業種>/   業種のページ：掲示・朝礼・やること・出典（1業種1ページ。検索と広告の審査で中身が1ページにまとまるように）
import { page, esc, script, adSlot, clientLib } from '../layout.mjs';

// 今月の実施（#43）：押した日を端末の中だけに残す（src/client/rec.mjs）。今ある「やること」のチェックは保存しないまま
const REC_ITEMS = ['掲示を貼った', '朝礼で話した', 'やることを済ませた'];
import { SITE } from '../site.mjs';
import { themePath, gyoshuPath, fuda, monthHead, titleHtml, undoLine } from '../parts.mjs';
import { ALL_THEMES } from '../data/themes.mjs';
import { qrSvg } from '../qr.mjs';
import { themeDesc, themeGyoshuDesc } from '../describe.mjs';

const seo = (t) => t.seoName || t.title;
// 同じ月のほかのテーマと、関係するページ（法改正・基本の決まり）
const links = (t, g) => {
  const sib = ALL_THEMES.filter((x) => x.month === t.month && x.slug !== t.slug).map((x) => ({ t: `${t.month}月 ${x.title}`, href: g ? gyoshuPath(x, g) : themePath(x) }));
  const all = [...sib, ...(t.related || [])];
  return all.length ? `<section class="sec paper np" aria-labelledby="rel-h">\n<h2 class="sec-h" id="rel-h">あわせて見る</h2>\n<ul class="krel">${all.map((r) => `<li><a href="${r.href}">${esc(r.t)}</a></li>`).join('')}</ul>\n</section>` : '';
};

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
};
const head = (t, h) => monthHead(t.month, h, titleHtml(t), '', t.undo, t.slug);

const srcList = (list) =>
  `<ol class="src">${list
    .map((s) => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a>${s.chk ? `<span class="chk">${esc(s.chk)}</span>` : ''}</li>`)
    .join('')}</ol>`;

// path を渡すと、すみにそのページの QR（印刷のときだけ出る）。トップの小さな紙には渡さない
export const sheet = (t, g, path) => `<div class="sheet">
<div class="tora" aria-hidden="true"></div>
<div class="sheet-in">
<p class="s-kicker"><span>${t.month}月の安全</span><span>${esc(g.label)}</span></p>
<p class="s-title">${titleHtml(t)}</p>
<ol class="rules">${g.rules.map(([a, b]) => `<li><div>${esc(a)}<span>${esc(b)}</span></div></li>`).join('')}</ol>
<table class="kakunin" aria-label="確認欄"><thead><tr><th>確認した日</th><th>名前</th><th>確認した日</th><th>名前</th></tr></thead><tbody>${'<tr><td></td><td></td><td></td><td></td></tr>'.repeat(5)}</tbody></table>
<p class="s-foot"><span>${esc(t.posterSrc || '出典：厚生労働省・労働局ほか')}</span><span>${esc(SITE.name)}　${SITE.url.replace('https://', '')}</span>${path ? qrSvg(SITE.url + path) : ''}</p>
</div>
</div>`;

// テーマの入口
function overview(t) {
  const path = themePath(t);
  const body = `${head(t, 'h1')}
<p class="th-lead">業種をえらぶと、その業種の掲示と朝礼が出ます。</p>
${fuda((g) => gyoshuPath(t, g))}
<section class="sec sec-memo" aria-labelledby="memo-h">
<h2 class="sec-h" id="memo-h">業種ごとに多いこと</h2>
<dl class="memo">${t.gyoshu.map((g) => `<dt><a href="${gyoshuPath(t, g)}">${esc(g.name)}</a></dt><dd>${esc(g.memo)}</dd>`).join('')}</dl>
</section>
<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
${srcList([...t.common, ...t.gyoshu.map((g) => g.src[0])])}
<p class="src-note">確認日 ${fmtDate(t.checked)}。${esc(t.note)}</p>
</section>
${links(t)}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `${t.month}月の安全衛生テーマ「${seo(t)}」朝礼ネタと掲示物（業種別）｜${SITE.name}`,
      description: themeDesc(t),
      path,
      corner: 'anzen',
      body,
      js: script('remember'),
      crumbs: [{ name: `${t.month}月の安全衛生`, href: `/anzen/${t.month}/` }, { name: t.title }],
    }),
    lastmod: t.checked,
  };
}

// 業種のページ
function gyoshuPage(t, g) {
  const path = gyoshuPath(t, g);
  const body = `${monthHead(t.month, 'h1', titleHtml(t), `${g.name}の`, null, t.slug)}
${fuda((x) => gyoshuPath(t, x), g.key)}
<nav class="toc np" aria-label="このページの中"><p class="toc-h">このページの中</p><ol><li><a href="#poster-h">掲示（A4で印刷）</a></li><li><a href="#talk-h">朝礼（1分の文）</a></li><li><a href="#todo-h">担当者のやること</a></li><li><a href="#rec-h">今月の実施</a></li><li><a href="#src-h">出典</a></li></ol></nav>
<section class="sec sec-poster" aria-labelledby="poster-h">
<h2 class="sec-h" id="poster-h">掲示</h2>
${sheet(t, g, path)}
<button class="btn print-btn" type="button">A4で印刷</button>
${g.poster ? `<p class="poster-pdf np"><a href="${g.poster}">ポスター（A4・PDF）</a></p>` : ''}
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
<section class="sec sec-rec np" aria-labelledby="rec-h">
<h2 class="sec-h" id="rec-h">今月の実施</h2>
<ul class="todo rec" data-m="${t.month}" data-t="${t.slug}" data-g="${g.key}">${REC_ITEMS.map((s, j) => `<li><label for="r-${j}"><input type="checkbox" id="r-${j}"><span>${s}</span><small></small></label></li>`).join('')}</ul>
<p class="u-note">押した日をこの端末に残し、トップの記録に丸がつく</p>
</section>
${adSlot('mid')}
<section class="sec sec-src" aria-labelledby="src-h">
<h2 class="sec-h" id="src-h">出典</h2>
${srcList([...t.common, ...g.src])}
${t.undo ? undoLine(t.month, t.undo).replace('class="th-undo"', 'class="th-undo src-note"') : ''}
<p class="src-note">確認日 ${fmtDate(t.checked)}。${esc(t.note)}</p>
</section>
${links(t, g)}`;
  return {
    path,
    html: page({
      title: `${g.name}の${seo(t)}｜${t.month}月の朝礼（1分の例文）と掲示｜${SITE.name}`,
      description: themeGyoshuDesc(t, g),
      path,
      corner: 'anzen',
      body,
      js: script('gyoshu') + '\n' + clientLib('rec') + '\n' + script('rec'),
      crumbs: [{ name: `${t.month}月の安全衛生`, href: `/anzen/${t.month}/` }, { name: t.title, href: themePath(t) }, { name: g.label }],
    }),
    lastmod: t.checked,
  };
}

export default function theme(t) {
  return [overview(t), ...t.gyoshu.map((g) => gyoshuPage(t, g))];
}
