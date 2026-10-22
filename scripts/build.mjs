// データからページを作って dist/ に書き出す（依存パッケージなし）
import { rmSync, mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, DESIGNS } from '../src/site.mjs';
import { OOSOUJI, KAISEI_NEXT } from '../src/data/oosouji.mjs';
import home from '../src/pages/home.mjs';
import theme from '../src/pages/theme.mjs';
import compare from '../src/pages/compare.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const write = (path, html) => {
  const file = join(DIST, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

const pages = [];
const add = (base, p) => pages.push({ path: base + p.path, html: p.html });

if (SITE.designPhase) {
  // くらべる間：トップは3案の入口、案ごとに /design/<id>/ の下に同じページを作る
  add('', compare({ data: OOSOUJI }));
  for (const d of DESIGNS) {
    const base = `/design/${d.id}`;
    const ctx = { base, design: d.id, data: OOSOUJI, kaisei: KAISEI_NEXT };
    add(base, home(ctx));
    add(base, theme(ctx));
  }
} else {
  throw new Error('デザインが決まったら、ここで1つの案をトップに作る');
}

for (const p of pages) write(p.path, p.html);
if (existsSync(join(ROOT, 'public'))) cpSync(join(ROOT, 'public'), DIST, { recursive: true });

console.log(`${pages.length} ページを作りました`);
