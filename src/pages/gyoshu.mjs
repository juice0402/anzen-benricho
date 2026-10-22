// 業種の入口 /anzen/gyoshu/<業種>/：その業種の今月のテーマと、それぞれの掲示の決まり
// トップの業種の名前から来る。月が増えたら、1年の重点もここに足す
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { gyoshuPath, entrancePath, fuda, monthHead, titleHtml } from '../parts.mjs';

function entrance(month, themes, g) {
  const path = entrancePath(g);
  const items = themes.map((t) => {
    const tg = t.gyoshu.find((x) => x.key === g.key);
    return `<section class="sec sec-pick" aria-labelledby="h-${t.slug}">
<h2 class="sec-h" id="h-${t.slug}"><a href="${gyoshuPath(t, tg)}">${titleHtml(t)}</a></h2>
<ol class="pick-rules">${tg.rules.map(([a]) => `<li>${esc(a)}</li>`).join('')}</ol>
<p class="pick-go"><a href="${gyoshuPath(t, tg)}">掲示と朝礼の文</a></p>
</section>`;
  });
  const body = `${monthHead(month, 'h1', esc(`${g.name}の安全衛生`))}
${fuda(entrancePath, g.key)}
${items.join('\n')}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `${g.name}の${month}月の安全衛生 掲示と朝礼のテーマ｜${SITE.name}`,
      description: `${g.name}の職場向けに、${month}月の安全衛生のテーマ（${themes.map((t) => t.title).join('・')}）の掲示の決まりと朝礼の文をまとめています。A4で印刷して職場に貼れます。`,
      path,
      corner: 'anzen',
      body,
      js: script('gyoshu'),
      crumbs: [{ name: `${g.name}の安全衛生` }],
    }),
  };
}

export default function gyoshuPages({ month, themes }) {
  return GYOSHU.map((g) => entrance(month, themes, g));
}
