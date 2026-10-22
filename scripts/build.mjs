// データからページを作って dist/ に書き出す（依存パッケージなし）
import { rmSync, mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OOSOUJI, KAISEI_NEXT } from '../src/data/oosouji.mjs';
import home from '../src/pages/home.mjs';
import theme from '../src/pages/theme.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const write = (path, html) => {
  const file = join(DIST, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

const ctx = { data: OOSOUJI, kaisei: KAISEI_NEXT };
const pages = [home(ctx), theme(ctx)];

for (const p of pages) write(p.path, p.html);
if (existsSync(join(ROOT, 'public'))) cpSync(join(ROOT, 'public'), DIST, { recursive: true });

console.log(`${pages.length} ページを作りました`);
