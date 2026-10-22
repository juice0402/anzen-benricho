// ビルドした dist/ の全ページを点検する（CI で毎回動く）。サクッと計算の点検をこのサイト用にしたもの
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { SITE } from '../src/site.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const count = (s, re) => (s.match(re) || []).length;
// 全角1・半角0.55で数える（スマホの幅 360px で1行に入るか）
const textWidth = (t) => [...t].reduce((w, c) => w + (/[\x20-\x7e]/.test(c) ? 0.55 : 1), 0);
const ONE_LINE = [['tm-ask', 22], ['src-note', 82]];

const resolves = (href) => {
  const p = href.split(/[?#]/)[0];
  if (p === '') return true;
  const target = join(DIST, p);
  return existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
};

for (const file of htmlFiles) {
  const rel = '/' + relative(DIST, file).replace(/index\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const noindex = html.includes('<meta name="robots" content="noindex">');
  if ((!SITE.launched || rel === '/404.html') && !noindex) fail(rel, '公開前か404なのに noindex がない');
  // 広告の枠には「広告」と書く
  if (html.includes('class="adsbygoogle"') && !html.includes('<p class="ad-label">広告</p>')) fail(rel, '広告の枠に「広告」の表示がない');

  if (!html.startsWith('<!doctype html>')) fail(rel, 'doctype がない');
  if (!/<html lang="ja"[ >]/.test(html)) fail(rel, 'lang="ja" がない');
  if (!html.includes('name="viewport"')) fail(rel, 'viewport がない');
  if (/user-scalable|maximum-scale/.test(html)) fail(rel, '指2本のズームを止めている');
  if (count(html, /<title>/g) !== 1) fail(rel, '<title> が1つではない');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!title.includes(SITE.name)) fail(rel, `title にサイト名がない: ${title}`);
  const desc = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '';
  if (desc.length < 30 || desc.length > 160) fail(rel, `description の長さが ${desc.length} 文字（30〜160）`);
  if (count(html, /<h1[ >]/g) !== 1) fail(rel, '<h1> が1つではない');
  if (!noindex) {
    const canon = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
    if (canon !== SITE.url + rel) fail(rel, `canonical がちがう: ${canon}`);
  }

  // 見える文字（スクリプト・スタイルの中は見ない）
  const shown = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
  const emoji = [...shown.matchAll(/\p{Extended_Pictographic}/gu)].map((m) => m[0]).filter((c) => !'©®™'.includes(c));
  if (emoji.length) fail(rel, `絵文字がある: ${[...new Set(emoji)].join(' ')}`);
  // AI がよく使う言い回しを使わない。サイト名の「便利帳」は名前なので数えない
  {
    const visible = shown.replace(/<[^>]+>/g, ' ').split(SITE.name).join(' ');
    const NG = ['しましょう', 'ぜひ', '便利', '簡単', '安心', 'おすすめ', 'ポイント', 'コツ', '——'];
    const hit = NG.filter((w) => visible.includes(w));
    if (hit.length) fail(rel, `使わない言葉がある: ${hit.join('・')}`);
  }
  for (const [cls, max] of ONE_LINE) {
    for (const m of html.matchAll(new RegExp(`<p class="${cls}"[^>]*>([\\s\\S]*?)</p>`, 'g'))) {
      const text = m[1].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '&');
      if (textWidth(text) > max) fail(rel, `.${cls} が長い（${textWidth(text).toFixed(1)}／${max}）: ${text}`);
    }
  }

  // タグの閉じ忘れ・入れ子のまちがい
  {
    const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
    const body = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    const stack = [];
    for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
      const [, close, rawName, selfClose] = m;
      const name = rawName.toLowerCase();
      if (VOID.has(name) || selfClose) continue;
      if (!close) { stack.push(name); continue; }
      const top = stack.pop();
      if (top !== name) { fail(rel, `タグの入れ子がおかしい: <${top || 'なし'}> の中で </${name}>`); break; }
    }
    if (stack.length) fail(rel, `閉じていないタグ: ${stack.join(', ')}`);
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(rel, `同じ id が2回以上ある: ${[...new Set(dup)].join(', ')}`);
  for (const m of html.matchAll(/(?:aria-controls|aria-labelledby|for)="([^"]+)"/g)) {
    if (!ids.includes(m[1])) fail(rel, `指している id がない: ${m[1]}`);
  }
  for (const bad of ['undefined', 'NaN', '[object Object]']) if (shown.includes(bad)) fail(rel, `「${bad}」が出ている`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail(rel, '構造化データの JSON が壊れている'); }
  }
  // スクリプトの文法
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    try { new vm.Script(m[1]); } catch (e) { fail(rel, `スクリプトの文法: ${e.message}`); }
  }
  // 外部のファイルを読み込まない（速さのため。広告を入れるときにここで例外を決める）
  // 例外は AdSense のコードだけ（SITE.adsense を入れたとき、広告のないページ以外）
  const ADSENSE = /^<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-\d+"/;
  for (const m of html.matchAll(/<(?:script|img|link|iframe)\b[^>]*\b(?:src|href)="(https?:)?\/\/[^"]*"/g)) {
    if (m[0].includes('rel="canonical"')) continue;
    if (SITE.adsense && ADSENSE.test(m[0])) continue;
    fail(rel, `外部のファイルを読み込んでいる: ${m[0].slice(0, 80)}`);
  }
  for (const m of html.matchAll(/\b(?:href|src)="(\/[^"]*)"/g)) {
    if (!resolves(m[1])) fail(rel, `リンク先がない: ${m[1]}`);
  }
  // 外のリンクは https だけ
  for (const m of html.matchAll(/<a\b[^>]*href="(http:[^"]*)"/g)) fail(rel, `http のリンク: ${m[1]}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n点検で ${errors.length} 件の問題`);
  process.exit(1);
}
console.log(`${htmlFiles.length} ページを点検しました。問題なし`);
