// サイトの名前・URL・コーナー
export const SITE = {
  name: '安全衛生の便利帳',
  url: 'https://anzen-benricho.com',
  // 公開前は全ページ noindex（検索に出さない）。公開の日に true にする
  launched: false,
};

// コーナー。色はデザインのCSSで決め、ここでは名前と場所だけ
export const CORNERS = {
  anzen: { name: '今月の安全衛生', path: '/anzen/' },
  seisou: { name: '清掃・ビルメン', path: '/seisou/' },
  kyotsu: { name: '講習・法令', path: '/' },
};
