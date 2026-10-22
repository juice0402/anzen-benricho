// Google の検索候補を集める（GitHub Actions で1回だけ動かす）。0.6秒以上あけて聞く
import { readFileSync, writeFileSync } from 'node:fs';
const seeds = readFileSync('survey/seeds.txt', 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const kana = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ'.split('');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = {};
let n = 0, fail = 0;
for (const seed of seeds) {
  out[seed] = {};
  for (const k of ['', ' ', ...kana.map((c) => ' ' + c)]) {
    const q = seed + k;
    let got = null;
    for (let i = 0; i < 4 && !got; i++) {
      try {
        const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&ie=utf-8&oe=utf-8&q=${encodeURIComponent(q)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (r.status === 200) got = (await r.json())[1];
        else await sleep(5000 * (i + 1));
      } catch { await sleep(5000 * (i + 1)); }
    }
    n++;
    if (!got) fail++;
    out[seed][k.trim()] = got || null;
    await sleep(600);
  }
  console.log(`${seed}: ${Object.values(out[seed]).flat().filter(Boolean).length}`);
}
writeFileSync('survey/suggest.json', JSON.stringify(out));
const all = new Set(Object.values(out).flatMap((o) => Object.values(o).flat()).filter(Boolean));
console.log(`聞いた回数 ${n}・失敗 ${fail}・候補 ${all.size} 種類`);
