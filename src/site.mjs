// サイトの名前・URL・コーナー
export const SITE = {
  name: '安全衛生の便利帳',
  url: 'https://anzen-benricho.com',
  // 公開前は全ページ noindex（検索に出さない）。公開の日に true にする
  launched: true,
  // 公開した日（about・プライバシーポリシーの制定日）。公開の日に入れる
  established: '2026-10-22',
  // Google AdSense の運営者ID（ca-pub-…）。入れると、広告のないページ（noAds）をのぞく全ページの head に AdSense のコードが入り、/ads.txt ができる
  adsense: 'ca-pub-7891863499821813',
  // 審査に通ったあとに作る広告ユニットのID。空のあいだは広告の枠を出さない（空の枠を見せない）
  adSlots: { home: '', mid: '', end: '' },
  // お問い合わせ：全サイト共通の Google フォームの、サイト名を入れた事前入力の URL（連絡 C-020。短縮 URL は名前が入らないので使わない）
  // 入れると /contact/ ができ、フッター・このサイトについて・プライバシーポリシーに出る
  contact: 'https://docs.google.com/forms/d/e/1FAIpQLSdAYN3cjrLkbbFywxHmCS7bqLFtDN0VmlO3NuTVPqKpaFj6Dg/viewform?usp=pp_url&entry.1872798598=%E5%AE%89%E5%85%A8%E8%A1%9B%E7%94%9F%E3%81%AE%E4%BE%BF%E5%88%A9%E5%B8%B3',
};

// コーナー。色はデザインのCSSで決め、ここでは名前と場所だけ
export const CORNERS = {
  anzen: { name: '月ごとのテーマ', path: '/anzen/' },
  seisou: { name: '清掃・ビルメン', path: '/seisou/' },
  kyotsu: { name: '講習・法令', path: '/hourei/' },
  kihon: { name: '基本の決まり', path: '/kihon/' },
  kagaku: { name: '化学物質', path: '/kagaku/' },
};
