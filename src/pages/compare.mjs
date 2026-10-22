// デザインをくらべる間だけのトップ：3案の入口
import { page, esc } from '../layout.mjs';
import { SITE, DESIGNS } from '../site.mjs';

export default function compare({ data: t }) {
  const body = `<h1 class="cmp-h">デザインの3案</h1>
<p class="cmp-lead">同じ中身を3つの見た目で作りました。</p>
<ol class="cmp-list">${DESIGNS.map(
    (d, i) => `<li class="cmp-item" data-d="${d.id}"><p class="cmp-name"><b>${i + 1}</b>${esc(d.name)}<small>${esc(d.note)}</small></p>
<p class="cmp-links"><a href="/design/${d.id}/">トップ</a><a href="/design/${d.id}/anzen/theme/${t.slug}/">${t.month}月 ${esc(t.title)}</a></p></li>`,
  ).join('')}</ol>`;
  return {
    path: '/',
    html: page({
      title: `デザインの3案｜${SITE.name}`,
      description: '安全衛生の便利帳のデザインを、点検表・回覧板・掲示板の3つの見た目でくらべるためのページです。公開前の確認用で、検索には出しません。',
      path: '/',
      base: '',
      design: 'compare',
      body,
    }),
  };
}
