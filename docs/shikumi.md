# コーナー・ページのくわしいこと（CLAUDE.md から移した。2026-11-09）

CLAUDE.md には要約だけを書き、くわしい仕様と経緯はここに書く。全部は読まず、さわる所の節だけ読む。

## 見た目（写真ふう）

- 見た目は「写真ふう」（10/27 しょーくん「普通のサイトの形に、Canva をフル活用して一新」→ 線画・イラスト・写真ふうの3案から決めた）：白い地に紺、上にロゴとコーナー（スマホはメニュー）、パンくず、見出し、16:9 の写真、本文。色は `src/styles/site.css`。写真は Canva の AI で作った写真ふうの絵（人・文字なし）で、名前と説明は `src/data/photos.mjs`、ファイルは `public/img/photo/<名前>-640.webp`・`-1200.webp`（`art/photo/webp.py` で取りこんだ JPG から作る。Canva のデザインは DAHZL87oR4A）。テーマを足したら写真も足す（`tests/photos.test.mjs` が見る）

## 資格の更新の期限

- 資格の更新の期限 `/shikaku/koushin/`（`src/data/shikaku.mjs`、計算は `src/client/koushin.js`。端末の中だけ）。入口でえらぶのは清掃作業監督者・病院清掃受託責任者・甲種防火管理者・防災管理者の4つ。資格ごとのページ `/shikaku/koushin/kantoku/`・`byouin/`・`bouka/`（10/31 夜 #50。中身は `KOUSHIN_PAGES`、資格はえらばせない。防火・防災は「修了した日以後の最初の4月1日から5年以内」で `count: 'april'`・`icsLimit`。テストは `tests/shikaku.test.mjs`。title の頭「清掃作業監督者・病院清掃受託責任者」は入口の順位のため変えない）。計算のすぐ下に「再講習の日程と受講料」の表（11/11 #86。資格ごとのページは `KOUSHIN_PAGES` の `nittei`：主催・いつ・どこで・受講料・申し込み・出典・確認日 `NITTEI_CHECKED`、入口は `SHIKAKU` の `ichi` を1行ずつ）。題と説明文のはじめは「いつ・どこで・いくら」（説明文は `nittei.desc`）。受講料は年度・主催でちがうので「2026年度の例」「例：大阪市消防局」と書く。期限の下の「カレンダーに入れる」で、期限・6か月前・1か月前の終日の予定（朝9時に通知、過ぎた日は入れない）の .ics を端末の中で作る（`src/client/ics.mjs`、テストは `tests/ics.test.mjs`。ページでは export を外して `clientLib('ics')` で埋め込む）。資格の期限の台帳（11/14 #102）：入口だけ、期限の下に呼び名の欄（なくてもよい・10字まで）と「台帳に残す」、計算のすぐ下に節「資格の期限の台帳」（期限の近い順の表・1行ずつ消せる・過ぎた行は「期限切れ」で残す）。記録は localStorage `anzen-shikaku-v1`（送らない。`koushin` のキーはそのまま）、同じ呼び名・同じ資格は上書き、呼び名が空の行は足して「1人目」「2人目」。部品は `src/client/daicho.mjs`（期限は icsLimit。ページでは export と import を外して ics のあとに入れる）と `daicho.js`、テストは `tests/shikaku.test.mjs`。印刷の紙と資格ごとのページへの足しは育てる山の次の項目

## 知識のページ

- 知識のページ（10/23。討論はプロジェクトの claude/anzen-chishiki-debate-2026-10-23.md）：`src/data/kihon/*.mjs`（1ページ1ファイル、並びは index.mjs）、部品は `src/pages/kihon.mjs`・道具は `kihon-tools.mjs` と `src/client/kihon.js`。目次 `/kihon/`。1ページ1つの問い、答えは40字まで、判定・道具・チェック・印刷のどれかが必ずある、条文を書くなら e-Gov を出典に（`tests/kihon.test.mjs`）。「法令の区分では」と書き、区分に迷う業種は「労働基準監督署に確認」。義務の区別（10/29）：表の行とやることに `kb`（g 法令の義務・d 努力義務・s 職場で決めること）。通達が「必要」「〜こと」と書くものは法令の義務で文の最後に「（国の通達）」、通達・指針の「望ましい」は職場で決めること。いまは推進者・人数・入社・特別教育・資格の期限・設備・保存期間・死傷病報告・1年・ヒヤリハット・KY・巡視・議事録。議事録（/kihon/gijiroku/。#80）の紙は画面で書いて印刷（送らない・残さない）、月のテーマをえらぶか月のページから `?t=<テーマ>` で来ると、そのテーマの gidai が議題に入る（gidai は1つ36字まで。テストが見る）。1年（/anzen/nenkan/）の年間計画の紙は、全国の運動（`YOTEI`）をいつも埋め、業種をえらぶとその月のテーマ（業種のページへのリンク）・掲示の決まりの1つ目・その年度に施行の法改正が入る（4業種の表をビルドで作り、えらんだものだけ見せる。`tests/nenkan.test.mjs`）

## 化学物質のコーナー

- 職場を測る記録帳 `/kihon/sokutei/`（11/10・#77）：測った二酸化炭素・気温・湿度・照度・WBGT を決まりとくらべる（事務所は事務所則、ほかの業種は照度が安衛則604条・空気と室温は事務所の数字を目安。WBGT は熱中症の報告の体制の対象かだけ）。数字は setsubi・kanki・hourei の necchusho と同じ（`tests/sokutei.test.mjs` が見る）。記録は localStorage `anzen-sokutei-v1`（1か月・1場所・1件で上書き。送らない）、部品は `src/client/sokutei.mjs`（ページでは export を外して入れる）と `sokutei.js`。A4 の測定記録表に今年度の記録が入る。「何で測る？」はそろえる物のページへ文字のリンクだけ
- 化学物質のコーナー `/kagaku/`（10/26）：まぜない（2つの洗剤の判定）・SDS の見方・化学物質管理者が要るか・リスクアセスメントの入口。知識のページと同じ部品（`src/data/kihon/` の mazenai・sds・kanrisha・risk）。次亜塩素酸ナトリウムは2027-04-01から対象物（10/27 厚労省の通達・神奈川局・メーカーのSDSで確かめ、法改正 `kagaku-2027` にも）。裾切値はラベル・SDSとも1%（厚労省の一覧の Excel と労働安全衛生総合研究所の一覧。Excel は Claude の環境から開けないので Actions で読んだ）。書かなかったこと：選任の届出の要否、対象物の数

## 読みもの

- 読みもの `/yomimono/`（11/4 夜 #59）：目次と記事 `/yomimono/<slug>/`。データは `src/data/yomimono/`（1本1ファイル・`index.mjs` の `YOMIMONO` に新しい順）、ページは `src/pages/yomimono.mjs`。書き方とネタの山は `docs/yomimono-neta.md`、決まりは `tests/yomimono.test.mjs`（ひな形の項目・本文900字以上・公的な出典2つ以上・つなぐ先1〜3・写真 `ym-<slug>`）。記事は90日のテストと見張りの C の対象外、毎週の出典の点検には入る。ヘッダー・フッター・トップの「調べる」から
- 戻るリンク（11/13 #98）：記事の `links` でつないだサイトの中のページ（パスがそのまま同じもの）の「あわせて見る」の最後に「読みもの：<h1>」（`src/parts.mjs` の `yomiBack`。新しい順に2本まで）。節のない月のページ・業種の入口は、読みものがあるときだけ同じ形の節を広告の枠の前に（`yomiBackSec`）。テーマ・知識・資格・法改正・月・業種の入口のページが対象で、ほかのページを links に入れたらテストが止まる

## そろえる物

- そろえる物 `/soroeru/`（目次）と `/soroeru/<key>/`（11/6 夜 #66。案1「別のページ」）：データは `src/data/kau.mjs`（`KAU`・月ごとの `KAU_MONTH`。points のある物だけページと月のリンクを出す。11/9 #75 で12の物すべて。測る道具の温湿度計・照度計は why の数字を知識のページ setsubi から）、ページは `src/pages/soroeru.mjs`。物のページは見出し → 1行「広告　楽天アフィリエイトを利用しています」→ なぜ今か → 選ぶときに見る所3つ（出典は名前と確認日だけ・リンクにしない）→ 楽天市場の商品3つ → 値段を見た日 → 楽天のクレジット → あわせて見る。AdSense なし（noAds）・楽天以外へのリンクなし。商品はビルドの前に `scripts/fetch-rakuten.mjs`（`src/rakuten.mjs`。machi の写し）が取り `data/rakuten/`（.gitignore）へ。Secrets のない PR・手元では商品の節を出さない。main と毎日5:41の作り直しで取れなければ止める。月のページ（3月と9月をのぞく月）に「今月そろえる物」（文字のリンクと1行だけ）、フッターに「そろえる物」。テストは `tests/kau.test.mjs`・`tests/rakuten.test.mjs`、点検は `verify-dist.mjs`

## ◯月号

- 月のページは「◯月号」（10/31 C-016 案A・#42）：業種ごとの memo・升目の暦（`src/koyomi.mjs`。運動の期間は `src/data/koyomi.mjs`、年度の日付は見張りの C〜G のときに直す）・今月の1問（テーマの `quiz`・`src/client/quiz.js`）・今月の委員会で話すこと（テーマの `gidai`）。カレンダーの購読 `/calendar.ics` をビルドで作る（毎月1日の◯月号・運動・法改正の施行日を12か月先まで。`tests/koyomi.test.mjs`）

## 今年度の記録

- 今年度の記録（10/31 C-016 案B・#43）：業種のページの「今月の実施」（掲示・朝礼・やることを押した日）を端末の中だけに残す（localStorage `anzen-rec-v1`。`src/client/rec.mjs`・`rec.js`、`tests/rec.test.mjs`）。トップの今月のテーマの下にスタンプ帳（4月〜3月）、`/anzen/kiroku/` に1年の実施記録の A4 の表

## 紙の QR とホーム画面に追加

- 紙の QR とホーム画面に追加（10/28）：サイトから印刷する紙（業種のページの掲示・知識のページの紙）のすみに、そのページの正規の URL の QR（`src/qr.mjs` でビルドのときに SVG。印刷のときだけ出る・一辺14mm・白い余白4マス。`tests/qr.test.mjs`）。Canva のポスター（public/poster/）には QR を入れない決まり。`/manifest.webmanifest`（display は browser のまま。アイコン 192・512 は `art/icon/render.py` で favicon.svg から）

## 共有されたときの画像

- 共有されたときの画像（10/27 連絡 C-004）：全ページ同じ `public/img/og.jpg`（しょーくんが3案から「掲示板にポスター4枚」に決めた。Canva の DAHZLrgYG6E の3ページ目、下地は `art/ogp/render.mjs`）。URL に中身の印（?v=）。Canva の絵は import.json の path を `img/<名前>.png`・`.jpg` にすると public/img/ に入る

## ポスター

- ポスター（10/26 連絡 C-004）：Canva Pro で A4 の印刷用 PDF。絵は自分たちで描く（`art/poster/<テーマ>/` の SVG・PNG。黒い太い線と赤1色、人は描かない）。文字はデータの掲示の決まりから。Canva へは raw.githubusercontent.com の PNG を取りこむ（シェルからは Canva に上げられない）。PDF は `art/poster/import.json` を claude/ のブランチに push すると `poster-import.yml` が public/poster/ に取りこむ。業種のデータの `poster` に置き場所を書くと「A4で印刷」の下にリンクが出る。10/27 時点で12月4テーマ・1月〜3月・4月2テーマ・5月〜11月・11月2テーマの68枚（11月は働きすぎを防ぐ・職場の火事に備える。12か月すべてにテーマがある）
  - 道具：絵は `art/poster/lib.mjs` の部品で描き `render.mjs` で PNG（`_sheet.png` で4枚を見る）。Canva は大掃除の本番を copy-design すると ID がそのままなので、`canva-ops.mjs <テーマ>` が `template-b.json`・`assets.json`・`alt.json` から edit-design の操作を作る（字の幅を測って1行に収める。1けたの月は字を寄せ、題が長いと業種を帯の上へ）。書き出しはページごと（pdf・a4・pro）、URL は約1時間で切れる
