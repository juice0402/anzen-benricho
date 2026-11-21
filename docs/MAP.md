# 地図（ファイルの役目）

コードを直すときは、ここ → 検索（grep -n）→ その範囲だけ読む → 変わる所だけ直す（claude/code-rules.md）。行の目安が大きくずれたら、ここを直す。

## ビルド・テスト・公開
- `npm run check`：テスト（`node --test tests/**/*.test.mjs`）→ ビルド（`scripts/build.mjs` が `dist/` を作る）→ 全ページ点検（`scripts/verify-dist.mjs`：noindex・title・description の長さと重なり・h1・タグ・id・リンク切れ・外部読み込み・絵文字・使わない言葉）
- 公開は `.github/workflows/deploy.yml`（Cloudflare Pages へ Direct Upload。PR → プレビュー／main → 本番、毎月1日・15日と毎日の作り直し）。ほかの workflow：`check-sources.yml`（出典の点検）・`mihari.yml`（見張り）・`merge-ok.yml`（マージの印）・`poster-import.yml`（Canva の PDF と絵の取りこみ）

## 自動で作るもの（読まない・手で直さない）
- `dist/`（ビルド。sitemap.xml・`/calendar.ics`・`/yomimono/feed.xml`・`_routes.json` もここ）
- `data/rakuten/`（楽天の商品。ビルドの前に `scripts/fetch-rakuten.mjs` が取る。.gitignore・コミットしない）
- `art/poster/*/_sheet.png`、`public/img/`・`public/poster/` の絵と PDF（中身は読まない）

## src（ページを作る）
| 場所 | 役目 |
|---|---|
| `site.mjs` | サイト名・URL・コーナー・`SITE`（launched・adsense・adSlots・contact） |
| `layout.mjs` | ページの外側（head・ヘッダー・フッター・パンくず） |
| `parts.mjs` | 共通部品（業種の名前の並び・月の見出し・URL・よくある質問の節 `faqSec`） |
| `rail.mjs` | パソコンの右の柱 |
| `describe.mjs` | 説明文（meta description） |
| `koyomi.mjs` | 月のページの暦と `/calendar.ics` |
| `qr.mjs` | 紙の QR（SVG） |
| `rakuten.mjs` | 楽天の商品のえらび方・値段の幅・クレジット |
| `pack-check.mjs`・`pack-line.mjs` | 法人パックの支払いの確かめ・パックへの1行 |
| `pages/*.mjs` | ページ：`home` トップ、`gyoshu` 業種の入口、`theme` テーマの入口と業種のページ、`months` 月の一覧・◯月号・問題集、`kihon` 知識のページと目次、`kihon-tools` 計算の道具、`hourei` 法改正、`shikaku` 資格の更新、`soroeru` そろえる物、`yomimono` 読みもの、`kiroku` 1年の実施記録、`pack` 法人パック、`info` about・プライバシー・免責・404 |
| `client/*.js`・`*.mjs` | ブラウザ用：`gyoshu` 印刷・コピー・業種を覚える、`remember` 覚えた業種、`hourei` うちの職場の印、`koushin`・`ics`・`daicho` 資格の期限・.ics・台帳、`kihon` 判定・道具・印刷、`sokutei` 測る記録帳、`quiz`・`quiz-shu` 今月の1問と問題集、`rec` 今年度の記録、`pack`・`pack-sale` 法人パック |
| `styles/` | `base.css` 骨組みと紙、`site.css` 色と飾り（写真ふう）、`print.css` A4 1枚、`pack.css` 法人パック |

## データ（src/data）
- テーマ：1テーマ1ファイル（`oosouji`・`koutsu`・`tentou`・`necchu` など。業種ごとの掲示・朝礼・やること・出典・多いけが）。一覧と月は `themes.mjs` の `ALL_THEMES`
- `gyoshu.mjs` 業種、`hourei.mjs` 法改正、`shikaku.mjs` 資格、`kau.mjs` そろえる物、`photos.mjs` 写真、`koyomi.mjs` 全国の運動の期間、`kanren.mjs` あわせて見る、`nayami.mjs` トップの「こんなときは」、`pack.mjs` 法人パック
- `kihon/*.mjs` 知識のページ（1ページ1ファイル。並びは `index.mjs`、`nenkan.mjs` の `YOTEI` はこれからの予定）
- `yomimono/*.mjs` 読みもの（1本1ファイル。並びは `index.mjs` の `YOMIMONO`）

## scripts・functions・public・tests
- `scripts/`：`build.mjs`・`verify-dist.mjs`・`fetch-rakuten.mjs`・`check-sources.mjs`・`indexnow.mjs`・`mihari.mjs`・`merge-ok.mjs`
- `functions/pack/_middleware.js`：Pages Functions はこれだけ（`/pack/` の下）
- `public/`：そのままコピー（アイコン・manifest・robots・IndexNow の鍵・`_headers`・写真・ポスター）
- `tests/*.test.mjs`：`node --test`（`data` 3点セット、`kihon` 知識のページ、`yomimono`、`photos`、`faq` テーマの入口のよくある質問 など）
- `art/poster/`：ポスターの絵を描く道具

## 300行より大きいファイル（見出しと行の目安）
- `scripts/mihari.mjs`（約520行）：日付 16〜／ページの文字 30〜／外のページ 57〜／C 確認日の期限 103〜／A・B1・D〜G 国の発表 150〜（`WATCHES` 214〜）／issue 274〜（`github` 298・`reporter` 336）／workflow_run 369〜（`judge` 413）／latest 445〜／毎朝 464〜（`runWatches` 474・`watch` 490）
- `src/pages/kihon.mjs`（約360行）：義務の区別 19〜／表・チェック 59〜／紙のすみ 83〜／年間計画 87〜／用紙 120〜（`formPapers` 153）／議事録 185〜／`sheetBlock` 217〜／道具・よくある質問・出典 275〜／目次のコーナー 309〜／`one` 315・`hub` 343
- `tests/mihari.test.mjs`（約340行）：日付 22／C 61／A 80／B1 103／D〜G 120〜161／issue 186／公開の失敗 217／判定 290
- `src/styles/base.css`（約325行）：月とテーマ 51／節 84／掲示 111／法改正 129／資格 145／知識のページ 182／A4 の紙 209／議事録 235／道具 276／記録 295〜／年間計画 316
