// 月のページの「◯月の暦」と、カレンダーの購読（/calendar.ics）に入れる全国の運動の期間（10/31 連絡 C-016 案A・#42）
// 書き方：
//   span: ['MM-DD', 'MM-DD']  … 毎年同じ日付（出典が「毎年」「例年」と書くものだけ）
//   month: n                  … 毎年その月いっぱいの月間
//   dates: [['YYYY-MM-DD', 'YYYY-MM-DD']] と months … その年度の発表で確かめた日付。ほかの年は色をつけず「◯月中（日付は発表後）」
//   pref: '…' と months        … 期間が都道府県・労働局ごと。色をつけず凡例だけ
//   start: true               … 月の頭から始まる運動でも、初日に「運動開始」を出す
// 出典はテーマと nenkan.mjs にあるものだけ（tests/koyomi.test.mjs が見る）。
// 年度を差しかえるとき（見張りの C〜G）は、ここの dates もいっしょに直す
const JISHA = 'https://www.jisha.or.jp/info/campaign/musaigai/youryou.html';

export const KOYOMI = [
  { key: 'musaigai', name: '年末年始無災害運動', months: [12, 1], dates: [['2026-12-01', '2027-01-15']], start: true, src: JISHA },
  { key: 'koutsu-nenmatsu', name: '年末の交通安全運動', months: [12], pref: '期間は都道府県ごと', src: 'https://www8.cao.go.jp/koutu/keihatsu/undou/zenkoku.html' },
  { key: 'harassment', name: '職場のハラスメント撲滅月間', month: 12, src: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyoukintou/seisaku06/index.html' },
  { key: 'fuyu', name: '雪の多い地域の冬の運動', months: [1], pref: '名前と期間は労働局ごと', src: 'https://jsite.mhlw.go.jp/yamagata-roudoukyoku/roudoukyoku/gyoumu_naiyou/kijun/fuyu-rousaiunndou.html' },
  { key: 'kagaku', name: '化学物質管理強調月間', month: 2, src: 'https://jsite.mhlw.go.jp/tokushima-roudoukyoku/0802kagakubusshitsuweek_080203.html' },
  { key: 'jisatsu', name: '自殺対策強化月間', month: 3, src: 'https://www.mhlw.go.jp/stf/r7_jisatsutaisakugekkan.html' },
  { key: 'haru-koutsu', name: '春の全国交通安全運動', months: [4], dates: [['2026-04-06', '2026-04-15']], src: 'https://www.pref.hokkaido.lg.jp/ks/cak/koutsuu/koutsuuanzen/undou.html' },
  { key: 'cw-junbi', name: 'クールワークキャンペーンの準備期間', month: 4, src: 'https://www.mhlw.go.jp/content/11303000/001676129.pdf' },
  { key: 'coolwork', name: 'STOP!熱中症 クールワークキャンペーン', span: ['05-01', '09-30'], start: true, src: 'https://www.mhlw.go.jp/content/11303000/001676129.pdf' },
  { key: 'anzen-junbi', name: '全国安全週間の準備期間', span: ['06-01', '06-30'], src: 'https://www.mhlw.go.jp/stf/newpage_71713.html' },
  { key: 'anzen', name: '全国安全週間', span: ['07-01', '07-07'], start: true, src: 'https://www.mhlw.go.jp/stf/newpage_71713.html' },
  { key: 'cw-juten', name: 'クールワークキャンペーンの重点取組期間', month: 7, src: 'https://www.mhlw.go.jp/content/11303000/001676129.pdf' },
  { key: 'denki', name: '電気使用安全月間', month: 8, src: 'https://www.meti.go.jp/policy/safety_security/industrial_safety/oshirase/2026/07/20260701-1.pdf' },
  { key: 'eisei-junbi', name: '全国労働衛生週間の準備期間', span: ['09-01', '09-30'], src: 'https://www.mhlw.go.jp/stf/newpage_74929.html' },
  { key: 'kenshin', name: '職場の健康診断実施強化月間', month: 9, src: 'https://jsite.mhlw.go.jp/toyama-roudoukyoku/news_topics/houdou/R08_kenshinkyoukagekkan.html' },
  { key: 'aki-koutsu', name: '秋の全国交通安全運動', months: [9], dates: [['2026-09-21', '2026-09-30']], src: 'https://www8.cao.go.jp/koutu/keihatsu/index-ke.html' },
  { key: 'eisei', name: '全国労働衛生週間', span: ['10-01', '10-07'], start: true, src: 'https://www.mhlw.go.jp/stf/newpage_74929.html' },
  { key: 'karoushi', name: '過労死等防止啓発月間', month: 11, src: 'https://www.mhlw.go.jp/stf/newpage_76625.html' },
  { key: 'kajuu', name: '過重労働解消キャンペーン', months: [11], dates: [['2026-11-01', '2026-11-30']], src: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/roudoukijun/campaign_00004.html' },
  { key: 'kasai', name: '秋季全国火災予防運動', months: [11], dates: [['2026-11-09', '2026-11-15']], src: 'https://www.fdma.go.jp/laws/tutatsu/items/2026_09_07_yobo1.pdf' },
];
