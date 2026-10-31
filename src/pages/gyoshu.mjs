// 業種の入口 /anzen/gyoshu/<業種>/：その業種の今月のテーマと、それぞれの掲示の決まり
// トップの業種の名前から来る。月が増えたら、1年の重点もここに足す
import { page, esc, script, adSlot } from '../layout.mjs';
import { SITE } from '../site.mjs';
import { GYOSHU } from '../data/gyoshu.mjs';
import { gyoshuPath, entrancePath, fuda, monthHead, titleHtml, photo, SAKUTTO_SEISOU } from '../parts.mjs';
import { gyoshuDesc } from '../describe.mjs';

function entrance(month, themes, g, allThemes) {
  const others = allThemes.filter((t) => t.month !== month);
  const path = entrancePath(g);
  const items = themes.map((t) => {
    const tg = t.gyoshu.find((x) => x.key === g.key);
    return `<section class="sec sec-pick" aria-labelledby="h-${t.slug}">
<a class="pick-ph" href="${gyoshuPath(t, tg)}" tabindex="-1" aria-hidden="true">${photo(t.slug)}</a>
<h2 class="sec-h" id="h-${t.slug}"><a href="${gyoshuPath(t, tg)}">${titleHtml(t)}</a></h2>
<ol class="pick-rules">${tg.rules.map(([a]) => `<li>${esc(a)}</li>`).join('')}</ol>
<p class="pick-go"><a href="${gyoshuPath(t, tg)}">掲示と朝礼の文</a></p>
</section>`;
  });
  const body = `${monthHead(month, 'h1', esc(`${g.name}の安全衛生`), '', null, `g-${g.key}`)}
${fuda(entrancePath, g.key)}
${items.join('\n')}
${others.length ? `<section class="sec paper" aria-labelledby="oth-h">\n<h2 class="sec-h" id="oth-h">ほかの月のテーマ</h2>\n<ul class="krel">${others.map((t) => `<li><a href="${gyoshuPath(t, g)}">${t.month}月 ${esc(t.title)}</a></li>`).join('')}</ul>\n</section>` : ''}
${g.key === 'seisou' ? `<section class="sec paper" aria-labelledby="rel-h">\n<h2 class="sec-h" id="rel-h">あわせて見る</h2>\n<ul class="krel"><li><a href="/shikaku/koushin/">清掃作業監督者などの更新の期限</a></li><li>${SAKUTTO_SEISOU}</li></ul>\n</section>` : ''}
${adSlot('end')}`;
  return {
    path,
    html: page({
      title: `${g.name}の${month}月の安全衛生 掲示と朝礼のテーマ｜${SITE.name}`,
      description: gyoshuDesc(g, month, themes, others),
      path,
      corner: 'anzen',
      body,
      js: script('gyoshu'),
      crumbs: [{ name: `${g.name}の安全衛生` }],
    }),
  };
}

export default function gyoshuPages({ month, themes, allThemes }) {
  return GYOSHU.map((g) => entrance(month, themes, g, allThemes));
}
