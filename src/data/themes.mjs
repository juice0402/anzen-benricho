// 毎月のテーマ。新しいテーマは ALL_THEMES に足す（月は各テーマの month）
// トップと業種の入口に出す「今月」は、作り直した日で決める：15日からは翌月（前の月の中旬から準備する人に向けて）。
// その月のテーマがまだなければ、テーマのある次の月を出す。作り直しは毎月1日と15日（deploy.yml）
import { OOSOUJI } from './oosouji.mjs';
import { KOUTSU } from './koutsu.mjs';
import { KANSEN } from './kansen.mjs';
import { HARASSMENT } from './harassment.mjs';
import { TENTOU } from './tentou.mjs';
import { todayJst } from './hourei.mjs';

export const ALL_THEMES = [OOSOUJI, KOUTSU, HARASSMENT, KANSEN, TENTOU];

export const monthFor = (iso = todayJst(), themes = ALL_THEMES) => {
  const [, m, d] = iso.split('-').map(Number);
  const has = (mm) => themes.some((t) => t.month === mm);
  const at = (base, k) => ((base - 1 + k + 1200) % 12) + 1;
  const start = d >= 15 ? at(m, 1) : m;
  // 先の月は2か月先まで。なければ今の月、それもなければ近い過去の月
  for (let i = 0; i < 3; i++) if (has(at(start, i))) return at(start, i);
  for (let i = 0; i < 12; i++) if (has(at(m, -i))) return at(m, -i);
  return start;
};

export const MONTH = monthFor();
export const THEMES = ALL_THEMES.filter((t) => t.month === MONTH);
// 目次の順：今月から先の月の順
export const themesInOrder = () => [...ALL_THEMES].sort((a, b) => ((a.month - MONTH + 12) % 12) - ((b.month - MONTH + 12) % 12));
