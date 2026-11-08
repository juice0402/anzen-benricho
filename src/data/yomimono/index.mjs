// 読みもの（/yomimono/）。1本1ファイル、ここに新しい順に並べる（目次とトップの「調べる」の本数はここから）
// 書き方とネタの山は docs/yomimono-neta.md。決まりは tests/yomimono.test.mjs
import kashitsukiTeire from './kashitsuki-teire.mjs';
import fuyuNeta from './fuyu-neta.mjs';

export const YOMIMONO = [kashitsukiTeire, fuyuNeta];
export const yomimonoPath = (y) => `/yomimono/${y.slug}/`;
