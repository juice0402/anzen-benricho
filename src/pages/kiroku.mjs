// 1年の実施記録（A4 1枚）/anzen/kiroku/（10/31 連絡 C-016 案B・#43）
// 表は4月〜3月。テーマの名前はビルドで入れ、掲示・朝礼・やることの日付は端末の記録から入れる（src/client/rec.js。送らない）。
// 記録のない所は空欄（手で書ける）。印刷は紙（.psheet）だけ。ページには12か月のテーマの一覧（ページにしかない中身）
import { page, esc, clientLib, script } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { bandHead, themePath } from '../parts.mjs';
import { qrSvg } from '../qr.mjs';
import { REC_MONTHS, recFyOf } from '../client/rec.mjs';
import { todayJst } from '../data/hourei.mjs';

export default function kirokuPage(themes) {
  const path = '/anzen/kiroku/';
  const fy = recFyOf(todayJst());
  const of = (m) => themes.filter((t) => t.month === m);
  const names = Object.fromEntries(themes.map((t) => [t.slug, t.title]));
  const host = SITE.url.replace(/^https?:\/\//, '');
  const sheet = `<div class="psheet pg kr-sheet"><div class="ps-in">
<p class="ps-title">安全衛生の実施記録 <span class="kr-fyt">${fy}</span>年度</p>
<table class="pg-t kr-t" data-names="${esc(JSON.stringify(names))}"><thead><tr><th>月</th><th>テーマ</th><th>掲示</th><th>朝礼</th><th>やること</th><th>確認</th></tr></thead>
<tbody>${REC_MONTHS.map((m) => `<tr data-m="${m}"><th scope="row">${m}月</th><td class="kr-th">${of(m).map((t) => esc(t.title)).join('・')}</td><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
<p class="ps-note">日付は、このサイトの業種のページで押した日。空欄は手で書く。確認は担当者の印</p>
<p class="ps-foot"><span>${esc(SITE.name)}</span><span>${host}</span>${qrSvg(SITE.url + path)}</p>
</div></div>`;
  const body = `${bandHead('月ごとのテーマ', '1年の実施記録（A4）', '<p class="pg-lead">委員会や年度末の振り返りで使う1年の表</p>')}
<section class="sec sec-poster sec-sheet" aria-labelledby="ks-h">
<h2 class="sec-h" id="ks-h">用紙</h2>
${sheet}
<button class="btn print-btn" type="button">A4で印刷</button>
</section>
<section class="sec paper np" aria-labelledby="ky-th">
<h2 class="sec-h" id="ky-th">${fy}年度の12か月のテーマ</h2>
<ul class="krel kr-list">${REC_MONTHS.map((m) => `<li><b>${m}月</b>${of(m).map((t) => `<a href="${themePath(t)}">${esc(t.title)}</a>`).join('・')}</li>`).join('')}</ul>
<p class="u-note"><a href="/">トップの今年度の記録へ</a></p>
</section>`;
  return {
    path,
    html: page({
      title: `安全衛生の1年の実施記録（A4）｜掲示・朝礼・やることの実施表｜${SITE.name}`,
      description: `${fy}年度の4月〜3月の安全衛生テーマと、掲示・朝礼・担当者のやることを実施した日を1枚にまとめるA4の表。業種のページで押した日が入り、空欄は手で書ける。委員会や年度末の振り返りに。`,
      path,
      corner: 'anzen',
      body,
      js: `${clientLib('rec')}\n${script('rec')}\n${PRINT_JS}`,
      crumbs: [{ name: '月ごとのテーマ', href: '/anzen/' }, { name: '1年の実施記録' }],
    }),
  };
}

const PRINT_JS = "var pb=document.querySelector('.print-btn');if(pb)pb.addEventListener('click',function(){window.print();});";
