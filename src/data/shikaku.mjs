// 資格の更新の期限（修了した日から次の期限を出す）。2026-10-22 に講習をしている協会と東京都の資料で確かめたもの
// years：修了から期限までの年数。early：期限の何か月前から再講習を受けると、期限から years 年のびるか（0 は決まりなし）

export const SHIKAKU_CHECKED = '2026-10-22';

export const SHIKAKU = [
  {
    key: 'kantoku',
    name: '清掃作業監督者',
    years: 6,
    early: 6,
    why: '建築物清掃業の登録に必要',
    rule: '期限の6か月前から再講習を受けられ、受けると期限から6年のびる。6か月より前に受けると、修了した日から6年になる。期限が切れたあとも再講習でよい',
    when: '毎月（講義はオンライン）',
    src: [
      { t: '全国ビルメンテナンス協会 清掃作業監督者講習（再講習の時期と期限）', u: 'https://www.j-bma.or.jp/qualification-training/kantoku' },
      { t: '東京都健康安全研究センター 建築物清掃業登録基準（清掃作業監督者は6年ごとに再講習）', u: 'https://www.tmiph.metro.tokyo.lg.jp/files/k_kenchiku/touroku/shinsei/seisou/1-seisou-tourokukijun.pdf' },
    ],
  },
  {
    key: 'byouin',
    name: '病院清掃受託責任者',
    years: 4,
    early: 0,
    why: '病院の清掃を受託するときの受託責任者（医療法施行規則）',
    rule: '修了証書の期限は4年。期限が切れる年に開かれる再講習を受けて更新する',
    when: '年1回。日程は協会の案内で',
    src: [
      { t: '全国ビルメンテナンス協会 病院清掃に関する情報（受託責任者講習は4年更新）', u: 'https://www.j-bma.or.jp/qualification-training/hospital-cleaning-2' },
      { t: '全国ビルメンテナンス協会 病院清掃受託責任者講習 講習案内（修了証書の有効期限・再講習）', u: 'https://cdn.j-bma.or.jp/wp-content/uploads/2024/04/01_%E5%8F%97%E8%AC%9B%E6%A1%88%E5%86%85_%E6%96%B0%E8%A6%8F_merged.pdf' },
    ],
  },
];
