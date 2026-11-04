# 育てる山（夜の作業が上から1つずつ取る）
しょーくんが OK したものだけ。順番は上から。2026-11-04 に5つ OK（プロジェクトの資料 claude/sodatsu-spec.md）。
1つの項目は、そのまま夜の issue の本文になる（claude/night-rules.md の「issue の書き方」の形）。出典の URL は、夜も開けるように項目に書いてある。

## 山

### [ ] 読みものの置き場所（/yomimono/）と最初の1本
- やること：読みもののコーナーを作り、1本目を書く。データ `src/data/yomimono/index.mjs`（`YOMIMONO`・新しい順）と `src/data/yomimono/fuyu-neta.mjs`、ページ `src/pages/yomimono.mjs`（目次 `/yomimono/` と記事 `/yomimono/<slug>/`）、`src/site.mjs` のコーナーに「読みもの」、トップの「調べる」に1行（「季節のネタ・法改正のまとめなど◯本」）、サイトマップ、出典の点検（`scripts/check-sources.mjs` に記事の src を足す）、`tests/yomimono.test.mjs`、CLAUDE.md（いまの状態とファイルの表に1行ずつ）。1本目は docs/yomimono-neta.md のネタの山の1番目「冬の安全衛生ネタ 12〜2月の朝礼で話せること」を、同じファイルの書き方で書き、ネタの行を `[x]` にする
- できあがりの条件：`npm run check` が緑。`/yomimono/` と `/yomimono/fuyu-neta/` が出る。テストが docs/yomimono-neta.md のひな形の項目（slug・h1・title・description・d・published・checked・photo・lead・sections・voice・links・src）と、本文900字以上・出典2つ以上・links 1〜3・photo が photos.mjs にあることを見る。スマホ（390×660）とパソコン（1280×800）のスクショを並べて1枚にし、claude/site-principles.md の「使わないもの」と照らす
- 決まったこと：コーナーの名前は「読みもの」。データの形は docs/yomimono-neta.md のひな形のとおり（読みもの書きの予約タスクがそれで書く）。見た目はいまの部品だけで、新しい形は作らない：記事の頭は知識のページ・資格のページと同じ（パンくず・見出し・16:9 の写真）、目次の1行はトップの「こんなときは」と同じ形（写真 96×54・下線の太字・灰色の1行 d）。記事の中の並びは、はじめの答え（lead）→ 節（h2.sec-h、表があれば表）→ 運営者のひとこと（voice があるときだけ。見出し「運営者のひとこと」）→ 職場で確かめる（links）→ 広告の枠 adSlot('end') → 出典（ol.src。公開日と「◯年◯月◯日に確かめた内容です」）。記事は確認日の90日のテストと見張り（mihari の C）の対象外、毎週の出典の点検には入れる。説明文はデータの description をそのまま。印刷は作らない。写真は1本1枚で `ym-<slug>`（ほかのページと同じ写真は使わない）。パソコンの右の柱は、いまの rail（このページの中）がそのまま出る
- 迷ったら：ヘッダーのコーナーに6つめが1行に入らない幅があれば、ヘッダーには足さず、フッターとトップの「調べる」だけにする（スクショで見る）。はじめの答えの段落に `.pg-lead` は使わない（全ページ点検の22字の決まりがあるため。別のクラスにする）。本文の字数は lead・節の段落・表・voice の合計（出典とリンクの字は数えない）。出典のドメインはテストで見る（go.jp・lg.jp・jaish.gr.jp・jisha.or.jp・j-bma.or.jp。足すときは理由をコメントに）
- 読むファイル：docs/yomimono-neta.md、CLAUDE.md、src/pages/kihon.mjs と src/pages/shikaku.mjs（記事の頭と部品）、src/pages/home.mjs（「こんなときは」の行）、src/rail.mjs、scripts/check-sources.mjs、tests/photos.test.mjs、プロジェクトの資料 claude/anzen-handoff.md の「写真の作り方」
- 画像：1枚 `ym-fuyu-neta`。冬の朝の会社の通用口の前に立てかけた雪かきのスコップと、まいた融雪剤（写真ふう・16:9・人と文字なし。1月の転倒の写真〔入口のマットと手すり〕と見分けがつく絵に）
- マージ：する

### [ ] 1月の2つ目のテーマ「暖房と一酸化炭素」
- やること：テーマを1つ足す。`src/data/issanka.mjs`（4業種の掲示・朝礼・やること・出典・memo、quiz、gidai、note、related など、いまのテーマと同じ項目）と `src/data/themes.mjs` の `ALL_THEMES`（TENTOU の次）。写真1枚。ポスターは次の項目
- できあがりの条件：`npm run check` が緑（data・koyomi・photos のテスト）。`/anzen/theme/issanka/` と4業種のページが出て、1月の月のページと業種の入口に並ぶ。業種のページの印刷が A4 1枚（Playwright で PDF にして数える）。書いていない別の Claude 2人（業種2つずつ）が、出典と照らして現場の目線で点検し、直した。quiz と gidai も作っていない軽いモデルが点検した
- 決まったこと：テーマ名「暖房と一酸化炭素」、slug `issanka`、month 1。業種の切り口：事務所・店舗＝石油ストーブ・ファンヒーターを使う部屋の換気と給油／飲食＝客席の炭火・七輪と、冬に閉めきった店内の暖房／製造＝屋内や低温の倉庫でエンジン式の機械（フォークリフト・発電機）を使わない・換気する／清掃・ビルメン＝エンジン式の機械（高圧洗浄機・発電機）を屋内・地下で使わない。10月の空気と換気（`kanki.mjs`）の飲食は業務用の厨房の CO 中毒を書いているので、1月は厨房の換気扇の話をくり返さず、つなぐ（related）。言い方は kanki と同じ「呼吸器のない人は入らず119番」「換気→外から測る→基準の内か確かめる」「症状が出た人は火や窓に向かわず外へ出て知らせる」。屋内で換気が足りない所の内燃機関は、法令の区分では安衛則578条（法令の義務）。石油ストーブなどの火災予防条例の話は「法令の区分では」「消防署に確認」。症状は書いても、病名と手当の判断は書かない
- 迷ったら：業種ごとの CO 中毒の数字が見つからなければ、出典の全体の数字か事例の件数を memo の「数字の入った1文」にする（memo に数字がないと業種の入口の説明文が80字に足りない）。一酸化炭素の警報器は法令の義務と書かない（職場で決めること）。運動（undo）は null にする（CO の全国の運動は見つかっていない。冬の感染症 kansen.mjs と同じ形）
- 出典（11/4 にチャットで開いた）：東京労働局「一酸化炭素中毒を起こさないためにチェックしましょう」https://jsite.mhlw.go.jp/tokyo-roudoukyoku/var/rev0/0145/1247/cochuudoku.pdf （飲食店・パン菓子店の厨房、換気・警報器・点検）／厚労省「一酸化炭素による労働災害の防止について」平成23年 https://www.mhlw.go.jp/web/t_doc?dataId=00tb7875&dataType=1&pageNo=1 （安衛則578条、発電機の排気が流れこんだ事例）／職場のあんぜんサイト 災害事例 No.687 屋内でガソリンエンジン付き機械を使って中毒 https://anzeninfo.mhlw.go.jp/anzen_pg/SAI_DET.aspx?joho_no=000687 ／厚労省「一酸化炭素による中毒」平成19年 https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei10/11.html （低温倉庫のフォークリフトの排ガスの事例）／長野労働局「一酸化炭素中毒（CO中毒）を防ごう」令和3年 https://jsite.mhlw.go.jp/nagano-roudoukyoku/content/contents/co_tyuudoku-boushi20211118.pdf （炭火・練炭・石油ストーブ・エンジンの機械）／消防庁 消防研究センター「火気器具等の取扱いについて」https://nrifd.fdma.go.jp/news/caution/heat_generator/index.html ／消費者庁「携帯発電機・カセットこんろ・モバイルバッテリーの使用にご注意ください」令和4年 https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_063 ／厚労省 業務用厨房の CO 中毒の注意喚起 平成22年 https://www.mhlw.go.jp/web/t_doc?dataId=00tb6263&dataType=1&pageNo=1
- 読むファイル：CLAUDE.md、src/data/kanki.mjs（形と言い方）、src/data/tentou.mjs（1月の形）、tests/data.test.mjs・tests/koyomi.test.mjs、プロジェクトの資料 claude/anzen-handoff.md の「テーマの作り方のメモ」「写真の作り方」
- 画像：1枚 `issanka`。事務所のすみに置いた石油ファンヒーターと、少し開けた窓（写真ふう・16:9・人と文字なし）
- マージ：する

### [ ] 1月「暖房と一酸化炭素」のポスター4枚
- やること：4業種のポスター（A4 の PDF）を作り、業種のデータに `poster` を入れる。絵は `art/poster/issanka/art.mjs`、Canva は大掃除の本番 DAHZG1vSiIU を copy-design して `node art/poster/canva-ops.mjs issanka` の操作で組む
- 順番：「1月の2つ目のテーマ『暖房と一酸化炭素』」のあと（そちらがマージ待ちなら、そのブランチの上に積む）
- できあがりの条件：`public/poster/<年-月>/issanka-<業種>.pdf` が4つ入り、業種のページの「A4で印刷」の下にリンクが出る。pdftotext で掲示の決まりの文が入っていることを確かめ、pdftoppm で4枚を並べて目で見た。`npm run check` が緑
- 決まったこと：形は案B「月めくりの1枚」（いまの68枚と同じ）。デザイン名「1月 暖房と一酸化炭素 ポスター（4業種・案B）」。絵は黒い太い線と赤1色で、人も手も描かない（ストーブ・窓・換気扇・エンジンの機械など）。顔に見える配置にしない。QR は入れない。Canva の素材は入れない（自分たちの絵とサイトの文字だけ）
- 迷ったら：Canva の取りこみ結果の smart_tags で、別の物に見えていないか確かめる。書き出しの URL は約1時間で切れるので、すぐ import.json で取りこむ
- 読むファイル：CLAUDE.md（ポスターの2行）、art/poster/ の lib.mjs・render.mjs・canva-ops.mjs・template-b.json、プロジェクトの資料 claude/anzen-handoff.md の「ポスターの作り方」
- マージ：する

### [ ] 委員会の議事録の紙
- やること：知識のページを1つ足す。`src/data/kihon/gijiroku.mjs`（index.mjs の junshi の次）・`/kihon/gijiroku/`。問いは「安全衛生の委員会の議事録は何を書き、何年残す？」。人数をえらぶ判定、決まりの表、A4 1枚の議事録の紙（日時・場所・出席者・議題・話したこと・決めたこと〔担当・いつまで〕・次の回・確認欄）。紙は画面で書いてそのまま印刷（入力した字は送らない・保存しない。ヒヤリハットの紙と同じ）。月をえらぶと、そのテーマの gidai（今月の委員会で話すこと）が議題に入る。月のページの「今月の委員会で話すこと」の下に、その月の議題が入った紙へのリンク
- できあがりの条件：`npm run check` が緑（kihon のテストの決まり：答えは40字まで・判定と印刷がある・条文は e-Gov を出典に）。印刷が A4 1枚（Playwright で数える）。書いていない別の Claude が出典と照らして点検した
- 決まったこと：URL `/kihon/gijiroku/`。50人以上の委員会の議事録は3年保存（安衛則23条）。50人未満は委員会の義務はなく、関係労働者の意見を聴くための機会を設ける（安衛則23条の2）。写真は付けない（ほかの知識のページと同じ）
- 迷ったら：23条の2 の区分は、厚労省の資料の言い方に合わせる。資料が義務と言い切っていなければ、表の行は区分（kb）を付けず条文の言い方を書き、「労働基準監督署に確認」。50人未満の議事録の残し方は「職場で決めること」。「議事の概要の周知」など出典で確かめられないことは書かない。e-Gov の安衛則の URL は、ほかの知識のページ（hozon.mjs など）と同じものを使う
- 出典（11/4 にチャットで開いた）：厚労省 FAQ「安全委員会、衛生委員会について教えてください。」https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/faq/1.html （記録の3年保存、50人未満は意見を聴く機会）／厚労省「安衛則第23条の2に基づく関係労働者の意見を聴く機会の活用について」令和7年10月10日 https://www.mhlw.go.jp/content/11303000/001576427.pdf （朝礼・ミーティングなどの活用の例）／滋賀労働局「職場の安全衛生管理 小規模事業場における労働安全衛生関係法令のポイント」2022年 https://jsite.mhlw.go.jp/shiga-roudoukyoku/content/contents/001157032.pdf
- 読むファイル：CLAUDE.md、src/data/kihon/hiyari.mjs（画面で書いて印刷する紙）・hozon.mjs、src/pages/kihon.mjs・kihon-tools.mjs、src/client/kihon.js、tests/kihon.test.mjs、src/pages/months.mjs（月のページの議題）
- マージ：する

### [ ] 今月の1問の問題集
- やること：全テーマの今月の1問（テーマの `quiz`）を、1ページでまとめて解けるようにする。`/anzen/quiz/`。月の順に並べ、答えると今月の1問と同じ赤ペンの丸（`src/client/quiz.js` の部品）。正解した問いを端末の中だけに覚え（localStorage の新しいキー `anzen-quiz-v1`。送らない）、上に「◯問中◯問正解」と、12か月のスタンプ（今年度の記録のスタンプ帳と同じ形）。月のページの今月の1問の下と、`/anzen/`（月ごとのテーマの一覧）から1行のリンク。プライバシーポリシーの「保存する情報」に1行
- できあがりの条件：`npm run check` が緑。テスト（全テーマの quiz が出る・キーの名前・送らない）を足した。スマホとパソコンのスクショで「使わないもの」と照らした
- 決まったこと：楽しさの「積み上がる」（claude/site-principles.md）。新しい形は作らず、1問の部品とスタンプ帳の部品を使う。写真は付けない。広告の枠は置かない。答えの解説（why）と出典は、いまの1問と同じに出す
- 迷ったら：1ページが長くなりすぎるとき（スマホで20画面より長い）は、月ごとに折りたたむ（details）。テーマが2つある月は、スタンプは両方正解で1つ
- 読むファイル：CLAUDE.md、src/client/quiz.js、src/client/rec.mjs・rec.js（スタンプ帳）、src/pages/months.mjs、src/pages/home.mjs、src/pages/info.mjs（プライバシーポリシー）、tests/koyomi.test.mjs・tests/rec.test.mjs
- マージ：する
