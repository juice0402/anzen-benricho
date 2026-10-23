// 知識のページ（基本の決まり）。1ページ＝1ファイル。ここに並べた順で目次に出る
// 形と決まりは tests/kihon.test.mjs が見張る（答えは40字まで・判定か印刷か計算かチェックが必ずある・法令の答えは e-Gov を出典に など）
export const BANDS = [
  { key: 'u10', label: '〜9人' },
  { key: 'm', label: '10〜49人' },
  { key: 'l', label: '50人以上' },
];
import suishinsha from './suishinsha.mjs';
import ninzu from './ninzu.mjs';
import setsubi from './setsubi.mjs';
import hozon from './hozon.mjs';
import shishobyo from './shishobyo.mjs';
import nenkan from './nenkan.mjs';
import hiyari from './hiyari.mjs';
import ky from './ky.mjs';

export const KIHON = [suishinsha, ninzu, setsubi, hozon, shishobyo, nenkan, hiyari, ky];
