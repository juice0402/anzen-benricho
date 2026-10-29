// トップの「こんなときは」：担当者の困りごとから、答えのあるページへ（10/29 しょーくん。安全衛生ずかん・現場TECH を見て）
// 文は場面だけ短く。下の1行は行き先で何がわかるか。行き先はサイトの中のページだけ
// ph は写真の名前（src/data/photos.mjs）。ほかのページと同じ写真は使わない（tests/photos.test.mjs）
export const NAYAMI = [
  { t: '安全衛生の担当になった', d: '10〜49人の職場で選ぶ人と、名前の掲示', href: '/kihon/suishinsha/', ph: 'ny-tantou' },
  { t: '人が増えて10人・50人をこえる', d: '人数で増える選任・委員会・報告', href: '/kihon/ninzu/', ph: 'ny-ninzu' },
  { t: '新しい人が入る', d: '入社のときの教育と健康診断', href: '/kihon/nyusha/', ph: 'ny-nyusha' },
  { t: 'けが人が出た', d: '死傷病報告の期限と様式', href: '/kihon/shishobyo/', ph: 'ny-kega' },
  { t: '洗剤や薬品を使っている', d: 'まぜると危ない組み合わせとSDSの見方', href: '/kagaku/', ph: 'ny-kagaku' },
  { t: '講習の期限が近い', d: '職長教育・特別教育の期限の早見', href: '/shikaku/kigen/', ph: 'ny-kigen' },
  { t: '1年の予定を立てたい', d: '全国の運動と、年間計画の紙', href: '/anzen/nenkan/', ph: 'ny-nenkan' },
  { t: '書類をいつまで残すか迷う', d: '議事録・健診・教育の記録の保存年数', href: '/kihon/hozon/', ph: 'ny-hozon' },
];
