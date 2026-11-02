// 検索結果に出る説明文（meta description）を、ページのデータから作る（2026-10-26 全サイト共通の決まり）
// - そのページにしかない数字（けがの人数・割合、テーマの本数、施行日、出典の件数、確かめた月）を入れる
// - 全角で80〜120文字くらい（半角は0.5文字）。長すぎるときは、うしろの文から順に外す
// - キャッチコピーにしない。使わない言葉は verify-dist.mjs が見張る
import { GYOSHU } from './data/gyoshu.mjs';
import { YOTEI } from './data/kihon/nenkan.mjs';

export const descLen = (s) => [...s].reduce((n, c) => n + (c.charCodeAt(0) < 128 ? 0.5 : 1), 0);
export const DESC_MIN = 80;
export const DESC_MAX = 120;

// 候補をくわしい順に並べ、80〜120文字に入る最初のものを使う（なければ120文字までのいちばん長いもの）
const fit = (...cands) => {
  const list = cands.map((c) => c.filter(Boolean).join(''));
  const ok = list.find((s) => descLen(s) >= DESC_MIN && descLen(s) <= DESC_MAX);
  if (ok) return ok;
  const under = list.filter((s) => descLen(s) <= DESC_MAX).sort((a, b) => descLen(b) - descLen(a));
  return under[0] || list[list.length - 1];
};

const ym = (iso) => `${Number(iso.slice(0, 4))}年${Number(iso.slice(5, 7))}月`;
const end = (s) => (s.endsWith('。') ? s : `${s}。`);
// メモの中から数字の入った1文をとる（なければ最初の1文）
const fact = (memo = '') => {
  const ss = memo.split('。').map((s) => s.trim()).filter(Boolean);
  const s = ss.find((x) => /\d/.test(x)) || ss[0];
  return s ? end(s) : '';
};
const seo = (t) => t.seoName || t.title;
const srcCount = (t, g) => t.common.length + (g ? g.src.length : t.gyoshu.reduce((n, x) => n + x.src.length, 0));

// 業種のページ：/anzen/theme/<テーマ>/<業種>/
export const themeGyoshuDesc = (t, g) => {
  const head = `${g.name}向けの${t.month}月の安全衛生テーマ「${seo(t)}」。`;
  const body = `「${g.rules[0][0]}」などをA4の掲示1枚と、1分の朝礼の文に。`;
  const src = `出典${srcCount(t, g)}件、${ym(t.checked)}に確認。`;
  return fit([head, fact(g.memo), body, src], [head, fact(g.memo), body], [head, body, src]);
};

// テーマの入口：/anzen/theme/<テーマ>/
export const themeDesc = (t) => {
  const head = `${t.month}月の安全衛生テーマ「${seo(t)}」を、${GYOSHU.length}つの業種別の掲示と1分の朝礼の文に。`;
  const undo = t.undo ? `${t.undo.name}（${t.undo.span}）。` : '';
  const facts = t.gyoshu.map((g) => fact(g.memo)).filter((s) => /\d/.test(s));
  const f = facts.sort((a, b) => descLen(a) - descLen(b))[0] || '';
  const src = `出典${srcCount(t)}件、${ym(t.checked)}に確認。`;
  return fit([head, undo, f, src], [head, f, src], [head, undo, src], [head, src]);
};

// 月のページ：/anzen/<月>/
export const monthDesc = (m, ts, laws) => {
  const head = `${m}月の安全衛生テーマ${ts.length}本（${ts.map((t) => t.title).join('・')}）を、${GYOSHU.length}つの業種別の掲示と1分の朝礼の文に。`;
  const ev = YOTEI[m] ? `全国の運動は${YOTEI[m]}。` : '';
  const law = laws.length ? `${m}月に施行の法改正「${laws[0].title}」${laws.length > 1 ? `ほか${laws.length - 1}件` : ''}も。` : '';
  const short = `${m}月の安全衛生テーマ${ts.length}本を、${GYOSHU.length}つの業種別の掲示と1分の朝礼の文に。`;
  const f = ts.flatMap((t) => t.gyoshu.map((g) => fact(g.memo))).filter((s) => /\d/.test(s)).sort((a, b) => descLen(a) - descLen(b))[0] || '';
  return fit([head, ev, law, f], [head, ev, law], [head, ev, f], [head, law, f], [head, ev], [short, ev, f], [short, ev]);
};

// 月ごとのテーマの一覧：/anzen/
export const monthsDesc = (ms, themes) =>
  fit([
    `月ごとの安全衛生テーマの一覧。いまは${ms.map((m) => `${m}月`).join('・')}の${themes.length}本で、${GYOSHU.length}つの業種別に掲示と朝礼の文が${themes.length * GYOSHU.length}組。`,
    `全国の運動は${ms.filter((m) => YOTEI[m]).map((m) => `${m}月の${YOTEI[m]}`).join('、')}。`,
  ], [
    `月ごとの安全衛生テーマの一覧。いまは${ms.map((m) => `${m}月`).join('・')}の${themes.length}本で、${GYOSHU.length}つの業種別に掲示と朝礼の文が${themes.length * GYOSHU.length}組。`,
    `どのテーマも、A4の掲示1枚と1分で話せる朝礼の文、出典をつけています。`,
  ]);

// 業種の入口：/anzen/gyoshu/<業種>/
export const gyoshuDesc = (g, month, themes, others) => {
  const head = `${g.name}の職場向けに、${month}月の安全衛生テーマ${themes.length}本（${themes.map((t) => t.title).join('・')}）の掲示と朝礼の文。`;
  const f = themes.map((t) => fact(t.gyoshu.find((x) => x.key === g.key).memo)).filter((s) => /\d/.test(s)).sort((a, b) => descLen(a) - descLen(b))[0] || '';
  const more = others.length ? `ほかの月のテーマ${others.length}本も。` : '';
  const short = `${g.name}の職場向けに、${month}月の安全衛生テーマ${themes.length}本の掲示と朝礼の文。`;
  return fit([head, f, more], [head, more], [short, f, more], [short, f], [short, more]);
};

// トップ
export const homeDesc = ({ allThemes, kihon, hourei, kaisei, fmtDate }) => {
  const ms = [...new Set(allThemes.map((t) => t.month))];
  const head = `職場の安全衛生の担当者向け。${ms.map((m) => `${m}月`).join('・')}のテーマ${allThemes.length}本を事務所・飲食店・製造業・清掃の${GYOSHU.length}業種別の掲示と朝礼の文に。`;
  const rest = `推進者の選び方など安全衛生の決まり${kihon}ページ、法改正${hourei}件も出典つきで。`;
  const next = kaisei ? `次の改正は${fmtDate(kaisei.date)}。` : '';
  return fit([head, rest, next], [head, rest]);
};

// 法改正の一覧：/hourei/
export const houreiListDesc = (list, next, fmtDate) => {
  const gimu = list.filter((h) => h.kind === '義務').length;
  const head = `安全衛生にかかわる法改正${list.length}件を施行日の順に（義務${gimu}件・努力義務${list.length - gimu}件）。`;
  const n = next ? `次は${fmtDate(next.date)}施行の「${next.title}」。` : '';
  const tail = 'うちの職場にあてはまる改正だけに絞りこめ、どれも出典つき。';
  return fit([head, n, tail], [head, n], [head, tail]);
};

// 法改正のページ：/hourei/<改正>/
export const houreiDesc = (h, done, fmtDate) => {
  const head = `${fmtDate(h.date)}${done ? 'から' : 'から施行。'}${h.whoShort}の${h.kind}${done ? 'になった' : 'になる'}「${h.title}」。`;
  const tail = `職場ですること${h.todo.length}つと出典${h.src.length}件。`;
  return fit(...h.change.map((c) => [head, end(c.split('。')[0]), tail]), [head, tail]);
};

// 基本の決まりの目次：/kihon/
export const kihonHubDesc = (list) => {
  const sheets = list.filter((p) => p.sheet).length;
  const tools = list.filter((p) => p.tool || p.pick).length;
  return fit([
    `10〜49人の職場の安全衛生の担当者向けに、決まりを1ページ1問で${list.length}ページ。`,
    `推進者の選び方や記録の保存期間など、${tools}ページは業種・人数・日付を入れると答えが出て、A4の用紙${sheets}種類を印刷できます。`,
  ]);
};

// 化学物質の目次：/kagaku/
export const kagakuHubDesc = (list) => {
  const sheets = list.filter((p) => p.sheet).length;
  const src = new Set(list.flatMap((p) => p.src.map((s) => s.u))).size;
  return fit(
    [
      `化学物質と洗剤の安全を${list.length}ページに。まぜると危ない洗剤の判定、SDSの見る所、化学物質管理者が要るかの判定、リスクアセスメントの入口。`,
      `A4の掲示と用紙${sheets}種類、公的な出典${src}件。`,
    ],
    [`化学物質と洗剤の安全を${list.length}ページに。まぜると危ない洗剤の判定、SDSの見る所、化学物質管理者が要るかの判定など。`, `A4の掲示と用紙${sheets}種類。`],
  );
};

// 資格の更新の期限：/shikaku/koushin/（入口。資格の名前と年数）
export const koushinDesc = (list) =>
  fit(
    [
      `${list.map((s) => s.name).join('・')}の修了した日を入れると、次の期限と再講習を受ける時期が出ます。`,
      `期限は${[...new Set(list.map((s) => s.years))].join('年・')}年ごと。入れた日付はこの端末の中だけで計算し、送りません。`,
    ],
    [`${list.map((s) => s.name).join('・')}の修了した日を入れると、次の期限と再講習を受ける時期が出ます。`, '入れた日付は送りません。'],
  );

// 資格ごとのページ：/shikaku/koushin/<page>/（期限の数え方・再講習の時期・出典の件数）
export const koushinPageDesc = (p, s) => {
  const head = `${p.name}の再講習の期限を、${p.paper}の日付から計算します。`;
  const rule = s.count === 'april' ? `期限は修了した日以後の最初の4月1日から${s.years}年以内です。` : `期限は${s.years}年ごとです。`;
  const when = `再講習は${s.when.split('。')[0]}です。`;
  // 清掃の2つは、のびる決まりか、要る理由を1文足す（です・ます調で）
  const more = s.count ? '' : s.early ? `期限の${s.early}か月前から期限までに修了すると、期限から${s.years}年のびます。` : '修了証書は医療法施行規則の受託責任者の知識の証明に使われます。';
  const src = `公的な出典${p.src.length}件を${ym(p.checked)}に確認しました。`;
  return fit([head, rule, more, when, src], [head, rule, when, src], [head, rule, more, when], [head, rule, when]);
};

// このサイトについて
export const aboutDesc = ({ themes, kihon, hourei }) =>
  fit([
    `職場の安全衛生の担当者向けのサイトです。いまは月ごとのテーマ${themes}本、安全衛生の決まり${kihon}ページ、法改正${hourei}件。`,
    '厚生労働省・労働局・e-Govなど公的な資料だけを出典にし、確認日から90日で確かめ直します。広告の扱いも。',
  ]);
