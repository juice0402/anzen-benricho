// 毎週の出典の点検：データにある出典のURLを開けるか、確認日が90日に近づいていないか
// 問題があれば Markdown を出して終了コード1（ワークフローが Issue にする）。Claude の使用量は使わない
import { ALL_THEMES as THEMES } from '../src/data/themes.mjs';
import { HOUREI, HOUREI_CHECKED } from '../src/data/hourei.mjs';
import { SHIKAKU, SHIKAKU_CHECKED } from '../src/data/shikaku.mjs';

const list = new Map();
const add = (s, where) => list.set(s.u, list.get(s.u) || { ...s, where });
for (const t of THEMES) {
  for (const s of t.common) add(s, t.title);
  for (const g of t.gyoshu) for (const s of g.src) add(s, `${t.title}・${g.label}`);
}
for (const h of HOUREI) for (const s of h.src) add(s, `法改正・${h.title}`);
for (const k of SHIKAKU) for (const s of k.src) add(s, `資格・${k.name}`);

const UA = 'Mozilla/5.0 (compatible; anzen-benricho-linkcheck; +https://anzen-benricho.com/about/)';
const open = async (u) => {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(u, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
      await r.body?.cancel();
      if (r.status < 400) return '';
      if (i) return `返事 ${r.status}`;
    } catch (e) {
      if (i) return `つながらない（${e.cause?.code || e.name}）`;
    }
    await new Promise((ok) => setTimeout(ok, 5000));
  }
};

const bad = [];
for (const s of list.values()) {
  const why = await open(s.u);
  if (why) bad.push(`- [${s.t}](${s.u})（${s.where}）：${why}`);
}
const days = (iso) => Math.floor((Date.now() - Date.parse(iso + 'T00:00:00+09:00')) / 86400000);
const old = [
  ...THEMES.map((t) => [t.title, t.checked]),
  ['法改正', HOUREI_CHECKED],
  ['資格の更新の期限', SHIKAKU_CHECKED],
].filter(([, d]) => days(d) >= 76).map(([n, d]) => `- ${n}：確認日 ${d} から ${days(d)} 日（90日でテストが止まり、公開できなくなる）`);

console.log(`出典 ${list.size} 件を点検しました。`);
if (!bad.length && !old.length) process.exit(0);
if (bad.length) console.log(`\n### 開けない出典（${bad.length}件）\n${bad.join('\n')}\n\n公式のページが移っていないか確かめ、データの出典を直してください。`);
if (old.length) console.log(`\n### 確認日が古くなる\n${old.join('\n')}\n\n公式を開いて中身を確かめ直し、確認日を直してください。`);
process.exit(1);
