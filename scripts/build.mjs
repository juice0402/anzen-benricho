// データからページを作って dist/ に書き出す（依存パッケージなし）
import { rmSync, mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MONTH, THEMES } from '../src/data/themes.mjs';
import { nextKaisei } from '../src/data/hourei.mjs';
import home from '../src/pages/home.mjs';
import theme from '../src/pages/theme.mjs';
import gyoshuPages from '../src/pages/gyoshu.mjs';
import infoPages from '../src/pages/info.mjs';
import houreiPages from '../src/pages/hourei.mjs';
import shikakuPages from '../src/pages/shikaku.mjs';
import { SITE } from '../src/site.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const write = (path, html, name) => {
  const file = name ? join(DIST, name) : join(DIST, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

const ctx = { month: MONTH, themes: THEMES, kaisei: nextKaisei() };
const pages = [home(ctx), ...gyoshuPages(ctx), ...THEMES.flatMap(theme), ...houreiPages(), ...shikakuPages(), ...infoPages()];

for (const p of pages) write(p.path, p.html, p.file);
// AdSense の運営者IDを入れたら ads.txt を置く（Google の決まった書き方）
if (SITE.adsense) writeFileSync(join(DIST, 'ads.txt'), `google.com, ${SITE.adsense.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
if (existsSync(join(ROOT, 'public'))) cpSync(join(ROOT, 'public'), DIST, { recursive: true });
// 公開したら sitemap.xml（404 はのぞく）。lastmod は作り直した日
if (SITE.launched) {
  const day = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const urls = pages.filter((p) => !p.file).map((p) => `<url><loc>${SITE.url}${p.path}</loc><lastmod>${day}</lastmod></url>`);
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
}

console.log(`${pages.length} ページを作りました`);
