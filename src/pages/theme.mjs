// 毎月のテーマ（例 12月「年末の大掃除」）
//   /anzen/theme/<slug>/          テーマの入口：運動、業種ごとに多いけが、業種をえらぶ
//   /anzen/theme/<slug>/<業種>/   業種のページ：掲示・朝礼・やること・出典（1業種1ページ。検索と広告の審査で中身が1ページにまとまるように）
import { page, esc, script, adSlot, clientLib } from '../layout.mjs';

// 今月の実施（#43）：押した日を端末の中だけに残す（src/client/rec.mjs）。今ある「やること」のチェックは保存しないまま
const REC_ITEMS = ['掲示を貼った', '朝礼で話した', 'やることを済ませた'];
import { SITE } from '../site.mjs';
import { themePath, gyoshuPath, fuda, monthHead, titleHtml, undoLine, yomiBack } from '../parts.mjs';
import { ALL_THEMES } from '../data/themes.mjs';
import { qrSvg } from '../qr.mjs';
import { themeDesc, themeGyoshuDesc } from '../describe.mjs';
import { packLiMonth } from '../pack-line.mjs';
import { kauOfTheme, kauPath } from '../data/kau.mjs';
import { THEME_KANREN, relKey, relD, MAX_KANREN } from '../data/kanren.mjs';

const seo = (t) => t.seoName || t.title;
// 続けて準備する（C-027 案A「来月の準備へ」11/12 しょーくん）：来月のテーマ（同じ業種）・この月の号・法人パック（売っている号のとき）
const nextMonth = (m) => {
  for (let k = 1; k <= 12; k++) {
    const n = ((m - 1 + k) % 12) + 1;
    if (ALL_THEMES.some((x) => x.month === n)) return n;
  }
  return m;
};
export const nextLinks = (t, g) => {
  const n = nextMonth(t.month);
  const nx = ALL_THEMES.filter((x) => x.month === n).map((x) => ({
    t: g ? `${n}月 ${x.title}（${g.name}）` : `${n}月 ${x.title}`,
    d: g ? '来月の掲示と朝礼を先に用意する' : '来月のテーマ',
    href: g ? gyoshuPath(x, g) : themePath(x),
  }));
  return [...nx, { t: `${t.month}月号`, d: `${t.month}月のテーマ・暦・今月の1問・委員会で話すこと`, href: `/anzen/${t.month}/` }];
};
const nextHtml = (t, g) => `<section class="sec paper np" aria-labelledby="nx-h">
<h2 class="sec-h" id="nx-h">続けて準備する</h2>
<ul class="krel">${nextLinks(t, g).map((r) => `<li><a href="${r.href}">${esc(r.t)}<span class="ym-d">${esc(r.d)}</span></a></li>`).join('')}${packLiMonth(t.month)}</ul>
</section>`;

// あわせて見る（#100 このテーマを深く）：どの行にも理由の1行（.ym-d）。1ページ5本まで
//   読みもの（#98）→ 同じテーマのほかの月・道具と知識（src/data/kanren.mjs）→ そろえる物（#94）→ 同じ月のほかのテーマ → related（法改正など）
//   同じページ（テーマは業種をとわず slug）を2回出さない。5本をこえたら後ろから落とす
export const relLinks = (t, g) => {
  const sib = ALL_THEMES.filter((x) => x.month === t.month && x.slug !== t.slug).map((x) => ({ t: `${t.month}月 ${x.title}`, d: `同じ${t.month}月の掲示と朝礼`, href: g ? gyoshuPath(x, g) : themePath(x) }));
  const toG = (r) => {
    const m = g && r.href.match(/^\/anzen\/theme\/([^/]+)\/$/);
    const x = m && ALL_THEMES.find((y) => y.slug === m[1]);
    return x ? { ...r, href: gyoshuPath(x, g) } : r;
  };
  const k = kauOfTheme(t.slug);
  const all = [
    ...yomiBack(g ? gyoshuPath(t, g) : themePath(t)),
    ...(THEME_KANREN[t.slug] || []).map(toG),
    ...(k ? [{ t: `そろえる物：${k.t}`, d: '選ぶときに見る所と、そろえる理由', href: kauPath(k.key) }] : []),
    ...sib,
    ...(t.related || []).map((r) => toG({ ...r, d: r.d || relD(r.href) })),
  ];
  const seen = new Set([relKey(themePath(t))]);
  const uniq = all.filter((r) => {
    const key = relKey(r.href);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // そろえる物（#94）は5本をこえても落とさない：入らなければ5本めと入れかえる
  const top = uniq.slice(0, MAX_KANREN);
  const kau = uniq.find((r) => r.href.startsWith('/soroeru/'));
  if (kau && !top.includes(kau)) top[MAX_KANREN - 1] = kau;
  return top;
};
const links = (t, g) => {
  const all = relLinks(t, g);
  return all.length ? `<section class="sec paper np" aria-labelledby="rel-h">\n<h2 class="sec-h" id="rel-h">あわせて見る</h2>\n<ul class="krel">${all.map((r) => `<li><a href="${r.href}">${esc(r.t)}<span class="ym-d">${esc(r.d)}</span></a></li>`).join('')}</ul>\n</section>` : '';
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
${nextHtml(t)}
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
${nextHtml(t, g)}
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
