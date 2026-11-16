# CLAUDE.md の前の行（経緯）

2026-11-16（#115）に CLAUDE.md を5,000字くらいに短くしたとき、書きかえたり外したりした行を、前の文のまま残す。
いまの決まりは CLAUDE.md と docs/ の役目ごとのファイル（`shikumi.md`・`MAP.md` など）が正。ここはふだんは読まない。

## 経緯
- 2026-10-22 に「今月の安全衛生」と「清掃・ビルメンのまとめ帳」を統合して始めた。同じ日に公開（https://anzen-benricho.com、`SITE.launched: true`）
- パソコンの右の柱は 10/31 連絡 C-017 の案A。ページの形（テーマの入口と1業種1ページ）は 10/22
- アイコンは 10/23 にしょーくんが3案から「掲示板」に決めた
- 楽天のアプリは 11/6 にしょーくんが作り、Secrets の3つを入れた。延長の予定は 10/23 にカレンダーへ
- 2026-11-16（#115）：CLAUDE.md を約5,000字に短くし、ファイルの表は docs/MAP.md へ移した

## 前の CLAUDE.md の行（2026-11-16 まで・文のまま）
2026-10-22 に「今月の安全衛生」と「清掃・ビルメンのまとめ帳」を統合して始めた。設計はプロジェクトの資料 `claude/anzen-seisou-tougou-plan.md`、元の設計は `claude/kongetsu-anzen-spec.md`・`claude/seisou-matome-spec.md`、共通の原則は `claude/site-principles.md`。
くわしいことは docs/ の `shikumi.md`（コーナー・ページごと）・`mihari.md`（見張り）・`merge-ok.md`（マージの印）・`yomimono-neta.md`（読みもの）・`sodateru.md`（育てる山）（全部は読まず、さわる所の節・行だけ読む）。
CLAUDE.md は1万字以内に保つ。経緯・くわしいことは docs/ へ書く。
## いまの状態
- 見た目は「写真ふう」（白い地に紺・16:9 の写真。色は `src/styles/site.css`、写真は `src/data/photos.mjs` と `public/img/photo/`）。テーマを足したら写真も足す（`tests/photos.test.mjs` が見る）。くわしくは docs/shikumi.md の「見た目（写真ふう）」
- パソコン（1100px 以上）は、トップ（wide）以外のページを本文 660px＋右の柱（`src/rail.mjs`：このページの中・今月のテーマ・これからの予定。広告は置かない・印刷に出さない）にした（10/31 C-017 案A）。1099px まではいままでどおり1列
- 業種の切りかえは文字の並びで、えらんだ業種に紺の下線（四角いボタンにしない）。業種のページには「このページの中」（掲示・朝礼・やること・出典へ）。掲示（A4の紙）は今までどおり白黒の紙で、印刷は A4 1枚
- トップ：いちばん上は「◯月の掲示と朝礼」・1行・業種4つ。その下に今月のテーマ・これからの予定・調べる。リンクは下線、リンクでない字は紺にしない。押せる所は44pxくらい。くわしくは docs/shikumi.md の「トップ」
- テーマは `src/data/themes.mjs` の `ALL_THEMES`（月は各テーマの `month`）。トップと業種の入口の「今月」は作り直した日で決まる（15日からは翌月、テーマのない月はとばす）。業種は `src/data/gyoshu.mjs`（どのテーマもこの4つ・この順。テストが見る）
- 法改正 `/hourei/`（施行日の順。うちの職場の印で絞る）と `/hourei/<改正>/`。データは `src/data/hourei.mjs`（義務か努力義務か・対象・出典が必須。罰則 `bassoku`・届出 `todokede` は2つ以上の公的な資料で確かめたものだけ）。トップの「次の改正」は作り直しの日に、まだ施行されていないいちばん近いものを出す
- 資格の更新の期限 `/shikaku/koushin/` と資格ごとのページ（`src/data/shikaku.mjs`、計算は `src/client/koushin.js`・.ics は `src/client/ics.mjs`。端末の中だけ）。くわしくは docs/shikumi.md の「資格の更新の期限」
- 知識のページ `/kihon/`（`src/data/kihon/*.mjs`。1ページ1つの問い・答えは40字まで・判定か道具かチェックか印刷が必ずある・条文は e-Gov を出典に。`tests/kihon.test.mjs`）。義務の区別 `kb`（g 法令の義務・d 努力義務・s 職場で決めること）。1年 `/anzen/nenkan/`。くわしくは docs/shikumi.md の「知識のページ」
- 化学物質のコーナー `/kagaku/`（知識のページと同じ部品）。くわしくは docs/shikumi.md の「化学物質のコーナー」
- 読みもの `/yomimono/`（`src/data/yomimono/`・`src/pages/yomimono.mjs`。書き方とネタの山は `docs/yomimono-neta.md`、決まりは `tests/yomimono.test.mjs`）。RSS `/yomimono/feed.xml` をビルドで作る。くわしくは docs/shikumi.md の「読みもの」
- そろえる物 `/soroeru/`（`src/data/kau.mjs`・`src/pages/soroeru.mjs`）。楽天の商品はこのページだけ・AdSense なし・楽天以外へのリンクなし。商品はビルドの前に `scripts/fetch-rakuten.mjs` が取り `data/rakuten/`（.gitignore）へ。くわしくは docs/shikumi.md の「そろえる物」
- 月ごとのテーマ `/anzen/`（一覧）と `/anzen/<月>/`（運動・テーマごとの業種の入口・その月の法改正）
- 月のページは「◯月号」（暦 `src/koyomi.mjs`・今月の1問・委員会で話すこと）と今月の1問の問題集 `/anzen/quiz/`。カレンダーの購読 `/calendar.ics` をビルドで作る。くわしくは docs/shikumi.md の「◯月号」
- 今年度の記録（端末の中だけ。localStorage `anzen-rec-v1`）と `/anzen/kiroku/`。くわしくは docs/shikumi.md の「今年度の記録」
- 印刷は A4 1枚。知識のページは紙（.psheet）だけ、ほかは np で印刷に出さない。印刷が1枚に収まるかは Playwright で PDF にして数える（長い掲示は print.css ですき間をつめている）
- 紙の QR（`src/qr.mjs`。印刷のときだけ出る）とホーム画面に追加（`/manifest.webmanifest`）。Canva のポスターには QR を入れない。くわしくは docs/shikumi.md の「紙の QR とホーム画面に追加」
- 業種の入口 `/anzen/gyoshu/<業種>/`（トップの業種の名前から）：その業種の今月のテーマと掲示の決まり
- ページの形（10/22）：テーマの入口 `/anzen/theme/<slug>/`（運動・業種ごとに多いけが・業種をえらぶ）と、1業種1ページ `/anzen/theme/<slug>/<業種>/`（掲示・朝礼・やること・出典）。業種の名前は各ページへのリンクで、いまのページの業種に紺の下線。えらんだ業種はブラウザに覚え、トップの業種の名前を太い下線で目立たせる
- 広告：AdSense は `SITE.adsense`・枠は `adSlot()`。広告のないページ（`noAds`：about・プライバシー・免責・404）、掲示・業種の名前・ボタンのそば、印刷には置かない。枠には「広告」と書く。自動広告は使わない。空のページ・「準備中」は出さない。A8.net の文字の広告は知識のページのデータの `a8`（コードとリンクの文字は書きかえない・1ページ1つ）。お問い合わせは `SITE.contact`。くわしくは docs/shikumi.md の「広告とお問い合わせ」
- 2026-10-22 公開（https://anzen-benricho.com、`SITE.launched: true`）。AdSense は審査待ち。通ったら自動広告がオフか確かめ、広告ユニット3つの番号を `SITE.adSlots` に入れる。くわしくは docs/shikumi.md の「広告とお問い合わせ」
- 検索エンジンへのお知らせ：sitemap.xml（ビルドで作る）と、本番の公開のたびに変わったページを IndexNow で知らせる（`scripts/indexnow.mjs`。Bing など。鍵は `public/<鍵>.txt`、前に知らせた記録は Actions の cache）。Google は Search Console とサイトマップ
- 検索結果での見え方：説明文はページのデータから `src/describe.mjs` で作る（全角80〜120文字）。`verify-dist.mjs` が長さ・同じ説明文・使わない言葉などを見張る。くわしくは docs/shikumi.md の「検索結果での見え方」
- 共有されたときの画像は全ページ同じ `public/img/og.jpg`（URL に中身の印 ?v=）。くわしくは docs/shikumi.md の「共有されたときの画像」
- ポスター（Canva Pro で A4 の印刷用 PDF を public/poster/ に。絵は自分たちで描く `art/poster/`。業種のデータの `poster` でリンク）。くわしくは docs/shikumi.md の「ポスター」
- 自動：毎月1日と15日 9:10 と毎日 5:41（楽天の商品の取りなおし）に本番を作り直す（`deploy.yml` の schedule）。毎週月曜 7:23 に出典のURLと確認日を点検し、問題があれば Issue「出典の点検」（`check-sources.yml`・`scripts/check-sources.mjs`。テーマ・法改正・資格・知識のページ）。`src/data` を変える PR でも同じ点検が動き、結果は check-run の注記に出る。WebFetch で開けても GitHub からは 404 の出典があるので、出典を足したら PR の注記で確かめる
- 見張り（`mihari.yml`・`scripts/mihari.mjs`）：公開・作り直し・出典の点検の失敗（終わるたびと3時間ごと。マージの印が動かした公開は終わっても知らせが来ないため）と、毎朝の確認日の期限・国の発表（A〜G）を issue（mihari・night）にする。詳しくは `docs/mihari.md`
- マージの印（`merge-ok.yml`・`scripts/merge-ok.mjs`）：司令塔が PR にラベル merge-ok を付けると、点検が通ったら squash でマージして公開を動かす。詳しくは `docs/merge-ok.md`
- 法人パック（1か月分500円）：`/pack/`・`/pack/<YYYY-MM>/`（買った人だけ）・`/tokushoho/`。Stripe の鍵は Cloudflare の秘密の設定だけ。くわしくは docs/pack.md
- 自動で育つしくみ：予約タスク「読みもの書き」（`docs/yomimono-neta.md`）と、夜のまとめ作業が取る育てる山（`docs/sodateru.md`）。どちらもしょーくんが OK したものだけ。くわしくは docs/shikumi.md の「自動で育つしくみ」
- 楽天は楽天API（anzen 専用のアプリ1つ・11/6 にしょーくんが作り Secrets の3つを入れた。有効期限 2027-11-06、10/23 に延長の予定をカレンダーに）：ビルドの中で取って HTML にするだけで、取ったものはコミット・Actions の成果物・ログに残さない（このリポジトリは公開。楽天ウェブサービス規約 第10条9号）。商品はそろえる物のページ（`/soroeru/<物>/`）だけに出し、そのページには AdSense を置かない。月のページ・記録帳からは文字のリンクだけ（docs/sodateru.md の「そろえる物」）
- アイコン（10/23 しょーくんが3案から「掲示板」に決めた）は `public/` の favicon.svg・favicon.ico・apple-touch-icon.png。head の URL に中身から作った印（?v=）がつくので、ファイルを差しかえるだけで古いアイコンが読み直される
## ファイル
| 場所 | 中身 |
|---|---|
| `src/site.mjs` | サイト名・URL・コーナー |
| `src/data/*.mjs` | 毎月のテーマ（`oosouji`・`koutsu`：業種ごとの掲示・朝礼・やること・出典・多いけが）、今月のテーマの一覧 `themes`、業種 `gyoshu`、法改正、そろえる物 `kau` |
| `src/rakuten.mjs`・`scripts/fetch-rakuten.mjs` | 楽天の商品の取り方（えらび方・値段の幅・クレジット）と取得（Actions だけ。件数だけログに出す） |
| `src/layout.mjs` | ページの外側（head・ヘッダー・フッター・パンくず） |
| `src/parts.mjs` | 共通部品（業種の名前の並び・月の見出し・URL） |
| `src/pages/*.mjs` | ページ（`home` 総合トップ、`gyoshu` 業種の入口、`theme` 毎月のテーマの入口と業種のページ、`months` 月ごとのテーマの一覧と月のページ、`kihon` 知識のページと目次・`kihon-tools` 計算の道具、`hourei` 法改正、`shikaku` 資格の更新、`soroeru` そろえる物、`info` このサイトについて・プライバシーポリシー・免責事項・404） |
| `src/data/yomimono/*.mjs`・`src/pages/yomimono.mjs` | 読みもの（1本1ファイル。並びは `index.mjs` の `YOMIMONO`） |
| `src/data/kihon/*.mjs` | 知識のページ（1ページ1ファイル。並びと人数の帯は `index.mjs`。`nenkan.mjs` の `YOTEI` はトップのこれからの予定） |
| `src/client/*.js` | ブラウザ用のスクリプト（`gyoshu` 業種のページの印刷・コピー・業種を覚える、`remember` 覚えた業種に丸、`hourei` うちの職場の印、`koushin` 資格の期限の計算、`kihon` 知識のページの判定・道具・印刷） |
| `src/styles/` | `base.css` 骨組みと掲示の紙、`site.css` 色と飾り（写真ふう）、`print.css` 掲示だけを A4 1枚に |
| `scripts/verify-dist.mjs` | 全ページ点検（noindex・title・description・h1・タグ・id・リンク切れ・外部読み込み・絵文字・使わない言葉） |
| `tests/` | `node --test`（`kihon.test.mjs` は知識のページの決まり） |
