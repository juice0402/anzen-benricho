// 法人パックへの1行（11/11 しょーくん「案A 1行の文字リンク」。司令塔の検索の数字の頼み①）
// PACK.link（本番の支払いリンク）が入っていて、売っている号と同じ月のときだけ出す。testLink だけのときは出さない
// 月のページ：「今月の委員会で話すこと」の説明のすぐ下／読みもの：PACK_READINGS の記事の「職場で確かめる」の最後
// 1行だけで、ページの作りは変えない（AdSense の審査中のため）。見本つきの枠（案B）は使わない
import { PACK } from './data/pack.mjs';
import { sellMonth } from './pages/pack.mjs';
import { todayJst } from './data/hourei.mjs';

// 読みもの（slug）→ その記事が話している月。売っている号がこの月のときだけ出す
export const PACK_READINGS = { 'fuyu-neta': [12, 1, 2] };

const yen = () => `${PACK.price.toLocaleString('ja-JP')}円`;
const nowMonth = (iso) => (PACK.link ? Number(sellMonth(iso).slice(5, 7)) : 0);

export const packLineMonth = (m, iso = todayJst()) =>
  nowMonth(iso) === m
    ? `<p class="pk-one">この月の掲示・朝礼・委員会の資料・記録表を、会社名入りでまとめて印刷：<a href="/pack/">法人パック ${m}月号（${yen()}）</a></p>`
    : '';

export const packLineReading = (slug, iso = todayJst()) => {
  const m = nowMonth(iso);
  if (!m || !(PACK_READINGS[slug] || []).includes(m)) return '';
  return `<li><a href="/pack/">法人パック ${m}月号（${yen()}）<span class="ym-d">${m}月の掲示・朝礼・委員会の資料・記録表を会社名入りでまとめて印刷</span></a></li>`;
};

// 掲示のページ（業種のページ・テーマの入口）の「続けて準備する」の最後の行。月のページと同じく、売っている号の月だけ
export const packLiMonth = (m, iso = todayJst()) =>
  nowMonth(iso) === m
    ? `<li><a href="/pack/">法人パック ${m}月号（${yen()}）<span class="ym-d">${m}月の掲示・朝礼・委員会の資料・記録表を会社名入りでまとめて印刷</span></a></li>`
    : '';
