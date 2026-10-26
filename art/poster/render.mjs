// SVG を Canva に入れる PNG（1200×900・透明な背景）にする。Playwright が要る（このリポジトリの依存には入れない）
// 使い方：node art/poster/render.mjs art/poster/koutsu [ほかのフォルダ…]
// 確かめ用に、フォルダごとの4枚を並べた 1 枚を <フォルダ>/_sheet.png に書き出す（コミットしない）
import { readdirSync, readFileSync } from 'node:fs';
const pw = await import(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright/index.mjs');
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
for (const dir of process.argv.slice(2)) {
  const svgs = readdirSync(dir).filter((f) => f.endsWith('.svg')).sort();
  for (const f of svgs) {
    const s = readFileSync(`${dir}/${f}`, 'utf8').replace('width="400" height="300"', 'width="1200" height="900"');
    await page.setContent(`<html><body style="margin:0;background:transparent">${s}</body></html>`);
    await page.screenshot({ path: `${dir}/${f.replace('.svg', '.png')}`, omitBackground: true, clip: { x: 0, y: 0, width: 1200, height: 900 } });
  }
  const cells = svgs.map((f) => `<div style="border:1px solid #ccc;width:400px;height:300px">${readFileSync(`${dir}/${f}`, 'utf8')}</div>`).join('');
  await page.setViewportSize({ width: 820, height: 620 });
  await page.setContent(`<html><body style="margin:0;background:#fff;display:grid;grid-template-columns:400px 400px;gap:8px;padding:6px">${cells}</body></html>`);
  await page.screenshot({ path: `${dir}/_sheet.png` });
  await page.setViewportSize({ width: 1200, height: 900 });
  console.log(dir, svgs.length);
}
await browser.close();
