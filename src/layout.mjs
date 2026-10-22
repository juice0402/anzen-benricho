// ページの外側（head・ヘッダー・フッター）。CSS とスクリプトは各ページに埋め込む（読み込みは HTML の1回だけ）
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, CORNERS } from './site.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(SRC, p), 'utf8');

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
export const css = () => minCss(read('styles/base.css') + read('styles/board.css') + read('styles/print.css'));
export const script = (name) => minJs(read(`client/${name}.js`));

export function page({ title, description, path, corner, body, js = '', crumbs = [], ld = [], isHome = false }) {
  const base = '';
  const url = SITE.url + path;
  const noindex = !SITE.launched;
  const cornerName = corner ? CORNERS[corner].name : '';
  const logo = `<a class="logo" href="${base}/">${esc(SITE.name)}</a>`;
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
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#2b3238">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${css()}</style>
${lds}
</head>
<body${corner ? ` data-corner="${corner}"` : ''}>
<header class="bar"><div class="bar-in">${isHome ? `<h1 class="logo-h">${logo}</h1>` : logo}${cornerName ? `<span class="bar-corner">${esc(cornerName)}</span>` : ''}</div></header>
<main class="wrap">
${body}
</main>
<footer class="foot"><div class="foot-in">${crumbHtml}<p class="foot-name">${esc(SITE.name)}</p></div></footer>
${js ? `<script>${js}</script>` : ''}
</body>
</html>
`;
}
