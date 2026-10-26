// 案B（月めくりの1枚）の Canva の操作を、テーマのデータから作る。
// 大掃除の本番（template-b.json の source）を copy-design で写すと ID はそのままなので、edit-design にこの操作を渡す。
// 使い方：node art/poster/canva-ops.mjs <テーマ> → ページごとの operations（page_index つき）を JSON で出す
// 文字の幅は Playwright（Noto Sans CJK JP）で測り、1行に入らないときだけ字を小さくする。Playwright が要る
import { readFileSync } from 'node:fs';
import { ALL_THEMES } from '../../src/data/themes.mjs';

const slug = process.argv[2];
const t = ALL_THEMES.find((x) => x.slug === slug);
const read = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const tpl = read('./template-b.json');
const assets = read('./assets.json')[slug];
const alt = read('./alt.json')[slug];
const G = tpl.geometry;

const pw = await import(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright/index.mjs');
const browser = await pw.chromium.launch();
const page = await browser.newPage();
const width = (text, px, bold) =>
  page.evaluate(([s, p, b]) => {
    const c = document.createElement('canvas').getContext('2d');
    c.font = `${b ? 'bold ' : ''}${p}px "Noto Sans CJK JP", sans-serif`;
    return c.measureText(s).width;
  }, [text, px, bold]);
// Canva の字は少し広いので 6% のゆとり
const w = async (s, p, b) => (await width(s, p, b)) * 1.06;
const fit = async (text, px, bold, box) => {
  let p = px;
  while (p > 18 && (await w(text, p, bold)) > box) p -= 1;
  return p;
};

const undoLine = t.undo ? `${t.undo.name}　${t.undo.span}` : t.posterSrc || '出典：厚生労働省・労働局ほか';
const out = [];
for (const [i, g] of t.gyoshu.entries()) {
  const P = tpl.pages[i];
  const L = (id) => `${P.page}-${id}`;
  const ops = [];
  const rep = (id, text) => ops.push({ type: 'replace_text', locator_id: L(id), text });
  const size = (id, px) => ops.push({ type: 'format_text', locator_id: L(id), formatting: { font_size: px } });
  rep(P.num, String(t.month));
  rep(P.title, `月　${t.title}`);
  rep(P.label, g.label);
  // 1けたの月は、テーマの字を数字に寄せる
  const left = Math.round(G.num.left + (await w(String(t.month), 92, true)) + 16);
  if (left < G.title.left) ops.push({ type: 'position_element', locator_id: L(P.title), top: G.title.top, left });
  const titleLeft = Math.min(left, G.title.left);
  // テーマと業種が重なるときは、業種を帯の上の方へ
  const tw = await w(`月　${t.title}`, 38, true);
  const lw = await w(g.label, 26, false);
  const right = G.label.left + G.label.width;
  if (titleLeft + tw + 10 > right - lw) {
    ops.push({ type: 'resize_element', locator_id: L(P.title), width: right - titleLeft });
    ops.push({ type: 'position_element', locator_id: L(P.label), top: 56, left: G.label.left });
  } else if (titleLeft + tw > titleLeft + G.title.width) {
    ops.push({ type: 'resize_element', locator_id: L(P.title), width: Math.ceil(tw) + 12 });
  }
  for (let k = 0; k < 3; k++) {
    const [a, b] = g.rules[k];
    const rt = `${k + 1}　${a}`;
    rep(P.r[k], rt);
    rep(P.s[k], b);
    const p = await fit(rt, G.rule[k + 1], true, G.rule[0]);
    if (p !== G.rule[k + 1]) size(P.r[k], p);
    const q = await fit(b, G.sub[k + 1], false, G.sub[0]);
    if (q !== G.sub[k + 1]) size(P.s[k], q);
  }
  rep(P.undo, undoLine);
  ops.push({ type: 'update_fill', locator_id: L(P.img), asset_type: 'image', asset_id: assets[g.key], alt_text: alt[g.key] });
  out.push({ page_index: i + 1, gyoshu: g.key, operations: ops });
}
await browser.close();
console.log(JSON.stringify({ title: `${t.month}月 ${t.title} ポスター（4業種・案B）`, pages: out }));
