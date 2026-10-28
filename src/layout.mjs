// ページの外側（head・ヘッダー・フッター）。CSS とスクリプトは各ページに埋め込む（読み込みは HTML の1回だけ）
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, CORNERS } from './site.mjs';
import { KIHON } from './data/kihon/index.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(SRC, p), 'utf8');
// アイコンの URL に中身から作った短い印をつける（?v=）。絵を変えると URL が変わるので、ブラウザは古いアイコンを使い続けずに読み直す
const iconV = (f) => createHash('sha256').update(readFileSync(join(SRC, '..', 'public', f))).digest('hex').slice(0, 8);
const ICON_V = { ico: iconV('favicon.ico'), svg: iconV('favicon.svg'), apple: iconV('apple-touch-icon.png'), manifest: iconV('manifest.webmanifest') };
// 共有されたときの画像（10/27 しょーくんが3案から「掲示板にポスター4枚」に決めた。Canva で作り public/img/og.jpg に取りこむ）
const OG_IMAGE = `${SITE.url}/img/og.jpg?v=${iconV('img/og.jpg')}`;

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 業種の名前は「・」のあとだけで折り返す（「事務所・店舗」が「店」と「舗」で分かれないように）
export const fudaLabel = (s) => esc(s).replace(/・/g, '・<wbr>');

// コメントと余分な空白を取る
const minCss = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const minJs = (js) =>
  js.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');

// 見た目は「職場の掲示板」（10/22 しょーくんが3案から決めた）
export const css = () => minCss(read('styles/base.css') + read('styles/site.css') + read('styles/print.css'));
export const script = (name) => minJs(read(`client/${name}.js`));
// テストでも使う部品（src/client/<名前>.mjs）を、export を外してページのスクリプトの前に入れる
export const clientLib = (name) => minJs(read(`client/${name}.mjs`).replace(/^export /gm, ''));

// 広告の枠：審査に通って広告ユニットのIDを入れるまでは何も出さない。出すときは「広告」と書き、ボタンや掲示から離した所に置く
export const adSlot = (name) => {
  const id = SITE.adsense && SITE.adSlots[name];
  if (!id) return '';
  return `<aside class="ad" aria-label="広告"><p class="ad-label">広告</p><ins class="adsbygoogle" style="display:block" data-ad-client="${SITE.adsense}" data-ad-slot="${id}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></aside>`;
};
const ADSENSE_TAG = () =>
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsense}" crossorigin="anonymous"></script>`;

// ロゴの左の印：アイコンと同じ掲示板の絵
const LOGO_MARK = read('../public/favicon.svg').replace('<svg ', '<svg class="logo-mk" aria-hidden="true" focusable="false" ');

// ヘッダー・フッターの文字のリンク（サイトの中の行き先）
const FOOT_NAV = [
  ['/anzen/', '月ごとのテーマ'],
  ...(KIHON.length ? [['/kihon/', '基本の決まり']] : []),
  ...(KIHON.some((p) => p.path.startsWith('/kagaku/')) ? [['/kagaku/', '化学物質']] : []),
  ['/hourei/', '法改正の一覧'],
  ['/shikaku/koushin/', '資格の更新の期限'],
];
const FOOT_LINKS = [
  ['/about/', 'このサイトについて'],
  ['/privacy/', 'プライバシーポリシー'],
  ['/disclaimer/', '免責事項'],
];

export function page({ title, description, path, corner, body, js = '', crumbs = [], ld = [], isHome = false, noAds = false, noindex: forceNoindex = false, ogTitle = '', wide = false }) {
  const base = '';
  const url = SITE.url + path;
  const noindex = !SITE.launched || forceNoindex;
  const ads = SITE.adsense && !noAds;
  const cornerName = corner ? CORNERS[corner].name : '';
  const logo = `<a class="logo" href="${base}/"${isHome ? ' aria-current="page"' : ''}>${LOGO_MARK}${esc(SITE.name)}</a>`;
  const crumbHtml = crumbs.length
    ? `<nav class="crumbs" aria-label="パンくず"><ol><li><a href="${base}/">ホーム</a></li>${crumbs
        .map((c) => (c.href ? `<li><a href="${base}${c.href}">${esc(c.name)}</a></li>` : `<li aria-current="page">${esc(c.name)}</li>`))
        .join('')}</ol></nav>`
    : '';
  const crumbLd = crumbs.length
    ? [{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{ name: 'ホーム', href: '/' }, ...crumbs].map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          ...(c.href ? { item: SITE.url + c.href } : {}),
        })),
      }]
    : [];
  const lds = [...ld, ...crumbLd].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('');
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:title" content="${esc(ogTitle || title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="ja_JP">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(SITE.name)}：緑の掲示板に、月ごとのポスター4枚">
<meta name="twitter:card" content="summary_large_image">
${noindex ? '' : `<meta property="og:url" content="${url}">\n`}${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/favicon.ico?v=${ICON_V.ico}" sizes="32x32">
<link rel="icon" href="/favicon.svg?v=${ICON_V.svg}" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${ICON_V.apple}">
<link rel="manifest" href="/manifest.webmanifest?v=${ICON_V.manifest}">
${ads ? ADSENSE_TAG() : ''}
<style>${css()}</style>
${lds}
</head>
<body${corner ? ` data-corner="${corner}"` : ''}>
<header class="bar"><div class="bar-in">${logo}
<nav class="gnav" aria-label="コーナー">${FOOT_NAV.map(([h, n]) => `<a href="${h}"${corner && CORNERS[corner].path === h ? ' aria-current="true"' : ''}>${n}</a>`).join('')}</nav>
<details class="menu"><summary>メニュー</summary><ul>${FOOT_NAV.map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></details></div></header>
<main class="wrap${wide ? ' wide' : ''}">
${crumbHtml}${body}
</main>
<footer class="foot"><div class="foot-in"><nav class="foot-nav" aria-label="サイトの中">${FOOT_NAV.map(([h, n]) => `<a href="${h}">${n}</a>`).join('')}</nav><p class="foot-links">${FOOT_LINKS.map(([h, n]) => `<a href="${h}">${n}</a>`).join('')}</p><p class="foot-name">${esc(SITE.name)}</p></div></footer>
${js ? `<script>${js}</script>` : ''}
</body>
</html>
`;
}
