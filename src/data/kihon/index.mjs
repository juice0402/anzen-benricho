// 知識のページ（基本の決まり）。1ページ＝1ファイル。ここに並べた順で目次に出る
// 形と決まりは tests/kihon.test.mjs が見張る（答えは40字まで・判定か印刷か計算かチェックが必ずある・法令の答えは e-Gov を出典に など）
export const BANDS = [
  { key: 'u10', label: '〜9人' },
  { key: 'm', label: '10〜49人' },
  { key: 'l', label: '50人以上' },
];
import suishinsha from './suishinsha.mjs';
import ninzu from './ninzu.mjs';
import nyusha from './nyusha.mjs';
import tokubetsu from './tokubetsu.mjs';
import kigen from './kigen.mjs';
import setsubi from './setsubi.mjs';
import hozon from './hozon.mjs';
import shishobyo from './shishobyo.mjs';
import nenkan from './nenkan.mjs';
import hiyari from './hiyari.mjs';
import ky from './ky.mjs';
import junshi from './junshi.mjs';
// 化学物質のコーナー /kagaku/（2026-10-26）
import mazenai from './mazenai.mjs';
import sds from './sds.mjs';
import kanrisha from './kanrisha.mjs';
import risk from './risk.mjs';

export const KIHON = [suishinsha, ninzu, nyusha, tokubetsu, kigen, setsubi, hozon, shishobyo, nenkan, hiyari, ky, junshi, mazenai, sds, kanrisha, risk];
