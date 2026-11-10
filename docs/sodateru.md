# 育てる山（夜の作業が上から1つずつ取る）
しょーくんが OK したものだけ。順番は上から。2026-11-04 に5つ OK（プロジェクトの資料 claude/sodatsu-spec.md）、11/6 に「買う理由」（連絡 C-025・claude/site-principles.md の「買いに来る理由がある人を集める」）を OK し、同じ日に楽天を API に変えて3つに分けた。同じ日の夜、12月号がトップに出る 11/15 より前に出すため、そろえる物の1つ目を1月のポスターより上にした（1月のポスターは 12/15 までに）。
1つの項目は、そのまま夜の issue の本文になる（claude/night-rules.md の「issue の書き方」の形）。出典の URL は、夜も開けるように項目に書いてある。

## 山

### [x] 読みものの置き場所（/yomimono/）と最初の1本（#59）
- やること：読みもののコーナーを作り、1本目を書く。データ `src/data/yomimono/index.mjs`（`YOMIMONO`・新しい順）と `src/data/yomimono/fuyu-neta.mjs`、ページ `src/pages/yomimono.mjs`（目次 `/yomimono/` と記事 `/yomimono/<slug>/`）、`src/site.mjs` のコーナーに「読みもの」、トップの「調べる」に1行（「季節のネタ・法改正のまとめなど◯本」）、サイトマップ、出典の点検（`scripts/check-sources.mjs` に記事の src を足す）、`tests/yomimono.test.mjs`、CLAUDE.md（いまの状態とファイルの表に1行ずつ）。1本目は docs/yomimono-neta.md のネタの山の1番目「冬の安全衛生ネタ 12〜2月の朝礼で話せること」を、同じファイルの書き方で書き、ネタの行を `[x]` にする
- できあがりの条件：`npm run check` が緑。`/yomimono/` と `/yomimono/fuyu-neta/` が出る。テストが docs/yomimono-neta.md のひな形の項目（slug・h1・title・description・d・published・checked・photo・lead・sections・voice・links・src）と、本文900字以上・出典2つ以上・links 1〜3・photo が photos.mjs にあることを見る。スマホ（390×660）とパソコン（1280×800）のスクショを並べて1枚にし、claude/site-principles.md の「使わないもの」と照らす
- 決まったこと：コーナーの名前は「読みもの」。データの形は docs/yomimono-neta.md のひな形のとおり（読みもの書きの予約タスクがそれで書く）。見た目はいまの部品だけで、新しい形は作らない：記事の頭は知識のページ・資格のページと同じ（パンくず・見出し・16:9 の写真）、目次の1行はトップの「こんなときは」と同じ形（写真 96×54・下線の太字・灰色の1行 d）。記事の中の並びは、はじめの答え（lead）→ 節（h2.sec-h、表があれば表）→ 運営者のひとこと（voice があるときだけ。見出し「運営者のひとこと」）→ 職場で確かめる（links）→ 広告の枠 adSlot('end') → 出典（ol.src。公開日と「◯年◯月◯日に確かめた内容です」）。記事は確認日の90日のテストと見張り（mihari の C）の対象外、毎週の出典の点検には入れる。説明文はデータの description をそのまま。印刷は作らない。写真は1本1枚で `ym-<slug>`（ほかのページと同じ写真は使わない）。パソコンの右の柱は、いまの rail（このページの中）がそのまま出る
- 迷ったら：ヘッダーのコーナーに6つめが1行に入らない幅があれば、ヘッダーには足さず、フッターとトップの「調べる」だけにする（スクショで見る）。はじめの答えの段落に `.pg-lead` は使わない（全ページ点検の22字の決まりがあるため。別のクラスにする）。本文の字数は lead・節の段落・表・voice の合計（出典とリンクの字は数えない）。出典のドメインはテストで見る（go.jp・lg.jp・jaish.gr.jp・jisha.or.jp・j-bma.or.jp。足すときは理由をコメントに）
- 読むファイル：docs/yomimono-neta.md、CLAUDE.md、src/pages/kihon.mjs と src/pages/shikaku.mjs（記事の頭と部品）、src/pages/home.mjs（「こんなときは」の行）、src/rail.mjs、scripts/check-sources.mjs、tests/photos.test.mjs、プロジェクトの資料 claude/anzen-handoff.md の「写真の作り方」
- 画像：1枚 `ym-fuyu-neta`。冬の朝の会社の通用口の前に立てかけた雪かきのスコップと、まいた融雪剤（写真ふう・16:9・人と文字なし。1月の転倒の写真〔入口のマットと手すり〕と見分けがつく絵に）
- マージ：する

### [x] 1月の2つ目のテーマ「暖房と一酸化炭素」（#61）
- やること：テーマを1つ足す。`src/data/issanka.mjs`（4業種の掲示・朝礼・やること・出典・memo、quiz、gidai、note、related など、いまのテーマと同じ項目）と `src/data/themes.mjs` の `ALL_THEMES`（TENTOU の次）。写真1枚。ポスターは次の項目
- できあがりの条件：`npm run check` が緑（data・koyomi・photos のテスト）。`/anzen/theme/issanka/` と4業種のページが出て、1月の月のページと業種の入口に並ぶ。業種のページの印刷が A4 1枚（Playwright で PDF にして数える）。書いていない別の Claude 2人（業種2つずつ）が、出典と照らして現場の目線で点検し、直した。quiz と gidai も作っていない軽いモデルが点検した
- 決まったこと：テーマ名「暖房と一酸化炭素」、slug `issanka`、month 1。業種の切り口：事務所・店舗＝石油ストーブ・ファンヒーターを使う部屋の換気と給油／飲食＝客席の炭火・七輪と、冬に閉めきった店内の暖房／製造＝屋内や低温の倉庫でエンジン式の機械（フォークリフト・発電機）を使わない・換気する／清掃・ビルメン＝エンジン式の機械（高圧洗浄機・発電機）を屋内・地下で使わない。10月の空気と換気（`kanki.mjs`）の飲食は業務用の厨房の CO 中毒を書いているので、1月は厨房の換気扇の話をくり返さず、つなぐ（related）。言い方は kanki と同じ「呼吸器のない人は入らず119番」「換気→外から測る→基準の内か確かめる」「症状が出た人は火や窓に向かわず外へ出て知らせる」。屋内で換気が足りない所の内燃機関は、法令の区分では安衛則578条（法令の義務）。石油ストーブなどの火災予防条例の話は「法令の区分では」「消防署に確認」。症状は書いても、病名と手当の判断は書かない
- 迷ったら：業種ごとの CO 中毒の数字が見つからなければ、出典の全体の数字か事例の件数を memo の「数字の入った1文」にする（memo に数字がないと業種の入口の説明文が80字に足りない）。一酸化炭素の警報器は法令の義務と書かない（職場で決めること）。運動（undo）は null にする（CO の全国の運動は見つかっていない。冬の感染症 kansen.mjs と同じ形）
- 出典（11/4 にチャットで開いた）：東京労働局「一酸化炭素中毒を起こさないためにチェックしましょう」https://jsite.mhlw.go.jp/tokyo-roudoukyoku/var/rev0/0145/1247/cochuudoku.pdf （飲食店・パン菓子店の厨房、換気・警報器・点検）／厚労省「一酸化炭素による労働災害の防止について」平成23年 https://www.mhlw.go.jp/web/t_doc?dataId=00tb7875&dataType=1&pageNo=1 （安衛則578条、発電機の排気が流れこんだ事例）／職場のあんぜんサイト 災害事例 No.687 屋内でガソリンエンジン付き機械を使って中毒 https://anzeninfo.mhlw.go.jp/anzen_pg/SAI_DET.aspx?joho_no=000687 ／厚労省「一酸化炭素による中毒」平成19年 https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei10/11.html （低温倉庫のフォークリフトの排ガスの事例）／長野労働局「一酸化炭素中毒（CO中毒）を防ごう」令和3年 https://jsite.mhlw.go.jp/nagano-roudoukyoku/content/contents/co_tyuudoku-boushi20211118.pdf （炭火・練炭・石油ストーブ・エンジンの機械）／消防庁 消防研究センター「火気器具等の取扱いについて」https://nrifd.fdma.go.jp/news/caution/heat_generator/index.html ／消費者庁「携帯発電機・カセットこんろ・モバイルバッテリーの使用にご注意ください」令和4年 https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_063 ／厚労省 業務用厨房の CO 中毒の注意喚起 平成22年 https://www.mhlw.go.jp/web/t_doc?dataId=00tb6263&dataType=1&pageNo=1
- 読むファイル：CLAUDE.md、src/data/kanki.mjs（形と言い方）、src/data/tentou.mjs（1月の形）、tests/data.test.mjs・tests/koyomi.test.mjs、プロジェクトの資料 claude/anzen-handoff.md の「テーマの作り方のメモ」「写真の作り方」
- 画像：1枚 `issanka`。事務所のすみに置いた石油ファンヒーターと、少し開けた窓（写真ふう・16:9・人と文字なし）
- マージ：する

### [x] そろえる物のページと楽天の取得（買う理由・その1）（#66）
- やること：楽天API で商品を取り、物ごとの「そろえる物」のページに出すしくみを作り、12月・1月・2月の3つの物のページを中身つきで作る。月のページ（◯月号）には、物の名前・なぜ今かの1行・そのページへの文字のリンクだけを出す（楽天の商品は出さない）。作るもの：`src/data/kau.mjs`（下の形）、`src/rakuten.mjs` と `scripts/fetch-rakuten.mjs`（machi-shakaika の同じ名前のファイルを写して、この形に合わせる）、`.github/workflows/deploy.yml`（ビルドの前に取得・毎日1回の作り直しを足す）、`.gitignore` に `data/rakuten/`、ページ `src/pages/soroeru.mjs`（目次 `/soroeru/` と物のページ `/soroeru/<key>/`）、月のページの「今月そろえる物」、`scripts/verify-dist.mjs` の楽天のページの点検、テスト `tests/rakuten.test.mjs`・`tests/kau.test.mjs`、プライバシーポリシー、フッターに「そろえる物」、CLAUDE.md（いまの状態とファイルの表）
- できあがりの条件：`npm run check` が緑（Secrets がない手元では商品の節が出ないだけで通る）。PR の build-deploy で取得が動き、check-run の注記に「呼び出し◯回・物ごとの件数」だけが出る（商品名は出ない）。プレビューの `/soroeru/hakimono/`・`suberidome/`・`daisha/` に商品3つずつ・「広告」の表示・クレジットが出て、AdSense のコードがない。12月・1月・2月の月のページに「今月そろえる物」が出て、AdSense はそのまま。スマホ（390×660）とパソコン（1280×800）のスクショを並べて1枚にし、claude/site-principles.md の「使わないもの」と照らす。物のページの文は、書いていない別の Claude が出典と照らして点検した
- 決まったこと（11/6 しょーくん。楽天は API に変えた・置き方は見本2案から案1「別のページ」）
  - 楽天API のアプリは anzen 専用に1つ（楽天ウェブサービスの最後の枠。許可するサイトは anzen-benricho.com）。Secrets は `RAKUTEN_APPLICATION_ID`・`RAKUTEN_ACCESS_KEY`・`RAKUTEN_AFFILIATE_ID`（11/6 にしょーくんが入れた。アプリの有効期限は 2027-11-06）。呼び方は machi と同じ新方式（applicationId＋accessKey、Referer と Origin は `https://anzen-benricho.com`）。1.1秒以上あけて呼び、429・5xx は待って3回まで
  - このリポジトリは公開なので、取ったものは `data/rakuten/`（.gitignore）に置いて HTML にするだけ。コミット・Actions の成果物（artifact）・ログに商品名や URL を出さない（楽天ウェブサービス規約 第10条9号）。ログと注記は件数だけ
  - 取得はビルドの前に毎回（push・PR・毎月1日と15日・毎日1回。毎日の分は分をずらす）。main と毎日の作り直しで取れなければ止める（終了コード1。前の公開がそのまま残る）。物ごとに3件に届かない物は、その物の商品の節だけ出さずに公開する。3件以上の物が半分より少なければ止める（楽天の仕様が変わったと見る）。Secrets のない PR・手元では取らず、商品の節を出さずにビルドする
  - AdSense は楽天の商品を出すページ（`/soroeru/<key>/`）に置かない（layout の `noAds`）。目次 `/soroeru/` は商品を出さないので AdSense はそのまま。月のページと記録帳は文字のリンクだけなので AdSense はそのまま
  - 物のページの並び：パンくず → 見出し（小さな字「◯月にそろえる物」か「測る道具」）→ 1行「広告　楽天アフィリエイトを利用しています」（1画面めに入れる）→ なぜ今か → 選ぶときに見る所（3つ）→ 楽天市場の商品（3つ。画像 128px・商品名・値段の幅「2,000円台」・「楽天市場で見る」）→ 値段を見た日 → クレジット（楽天の文字版のスニペットをそのまま）→ あわせて見る（月のページ・記録帳。サイトの中だけ）。商品の節の中のリンクは楽天のドメインだけ、`rel="sponsored nofollow noopener" target="_blank"`。画像は楽天の URL のまま（保存し直さない）、width と height を書き、loading="lazy"。見た目は目次の行と同じ部品（写真の行の形）で、新しい形は作らない
  - 商品のえらび方：物ごとのさがす言葉で商品検索（レビューの多い順・買えるものだけ・画像あり）→ must の言葉が入り ng の言葉が入らない・レビュー10件以上・評価4.0以上（物ごとに kau.mjs の minReviews・minRating で変えられる。吐いた物の処理セットは3件以上・3.5以上＝11/7）→ 同じお店は1つまで → 値段がまん中の3倍をこえるものは外す → 上から3つ（3つに届かない物は出さない。kau.mjs の minShow で下げられる＝吐いた物の処理セットは2つでも出す・11/7）。商品名は【】や★の飾りと絵文字を外す（machi の cleanName）
  - なぜ今かの数字は、そのテーマのデータ（memo・多いけが・note）にある数字だけを使い、新しい数字を足さない。選ぶときに見る所は、公的な資料かメーカーのカタログ・取扱説明書で2つ以上一致したことだけ（出典と確認日を物のデータに）。機種の名前やくらべ・順位は書かない。言葉は「文章」の決まりのとおり（おすすめ・お得・最安・今すぐ を使わない、あおらない）
  - `src/data/kau.mjs` の形：`KAU` は key → `{ t: 物の名前, kw: [さがす言葉], must: [], ng: [], why, theme, month, points: [選ぶときに見る所×3], src: [{ t, url }], checked }`（測る道具は month と theme の代わりに `sokutei: true`、why は記録帳の言い方）。`KAU_MONTH` は月 → key。はじめの key とさがす言葉：hakimono 吐いた物の処理セット（嘔吐物処理セット）12月・kansen／suberidome 出入口のすべり止めマット（玄関マット 業務用 滑り止め）1月・tentou／daisha 台車（台車 業務用）2月・youtsu／dansa 階段の段を見やすくするテープ（階段 滑り止め テープ）4月・kourei／wbgt 暑さ指数（WBGT）計（WBGT 熱中症 計）5月・necchu／tebukuro 切れにくい手袋（耐切創 手袋）6月・te／horeizai 保冷剤とクーラーボックス（保冷剤 クーラーボックス）7月・necchu-taiou／konsento コンセントのほこりよけカバー（コンセント カバー ほこり）8月・kanden／co2 CO2モニター（CO2モニター 二酸化炭素濃度計）10月・kanki／shokaki 業務用の消火器（消火器 業務用）11月・kasai／ondo 温湿度計（温湿度計）測る道具／shodo 照度計（照度計）測る道具。3月と9月はなし
  - この項目で中身まで作るのは hakimono・suberidome・daisha の3つ。ほかの key は `kw`・`must`・`ng`・`t` だけ先に入れ、points がない物はページも月のリンクも出さない（次の項目で足す）
- 迷ったら：PR の build-deploy で取得がキーの誤りで止まったら、PR の本文に書いて止める（main で取得が止まると公開が止まるため。キーはしょーくんに入れ直してもらう）。さがす言葉で3件に届かないときは、言葉を1つ足すか must をゆるめて、PR に書く（商品名は書かない）。商品が合っているかは夜には見られないので、マージのあとにしょーくんが本番の物のページを見て、合わない商品があればこのサイトのチャットで must・ng を直す。吐いた物の処理セットは病気を防ぐ・治すと書かない（備えの道具として）
- 読むファイル：CLAUDE.md、machi-shakaika（公開リポジトリ。`git clone --depth 1 https://github.com/juice0402/machi-shakaika`）の `src/rakuten.mjs`・`scripts/fetch-rakuten.mjs`・`.github/workflows/deploy.yml`（楽天の部分）・`scripts/verify-dist.mjs`（楽天のページの点検）・`tests/rakuten.test.mjs`、src/layout.mjs（noAds）、src/pages/months.mjs（月のページ）、src/pages/info.mjs（プライバシーポリシー）、src/data/themes.mjs と各テーマのデータ、プロジェクトの資料 claude/oshi-techo-spec.md の「楽天API・アフィリエイトのルール」と claude/sakutto-tougou-plan.md の「外部読み込みの点検」
- マージ：する（PR の build-deploy で取得が通ってから）

### [x] 1月「暖房と一酸化炭素」のポスター4枚（#70）
- やること：4業種のポスター（A4 の PDF）を作り、業種のデータに `poster` を入れる。絵は `art/poster/issanka/art.mjs`、Canva は大掃除の本番 DAHZG1vSiIU を copy-design して `node art/poster/canva-ops.mjs issanka` の操作で組む
- 順番：「1月の2つ目のテーマ『暖房と一酸化炭素』」のあと（そちらがマージ待ちなら、そのブランチの上に積む）
- できあがりの条件：`public/poster/<年-月>/issanka-<業種>.pdf` が4つ入り、業種のページの「A4で印刷」の下にリンクが出る。pdftotext で掲示の決まりの文が入っていることを確かめ、pdftoppm で4枚を並べて目で見た。`npm run check` が緑
- 決まったこと：形は案B「月めくりの1枚」（いまの68枚と同じ）。デザイン名「1月 暖房と一酸化炭素 ポスター（4業種・案B）」。絵は黒い太い線と赤1色で、人も手も描かない（ストーブ・窓・換気扇・エンジンの機械など）。顔に見える配置にしない。QR は入れない。Canva の素材は入れない（自分たちの絵とサイトの文字だけ）
- 迷ったら：Canva の取りこみ結果の smart_tags で、別の物に見えていないか確かめる。書き出しの URL は約1時間で切れるので、すぐ import.json で取りこむ
- 読むファイル：CLAUDE.md（ポスターの2行）、art/poster/ の lib.mjs・render.mjs・canva-ops.mjs・template-b.json、プロジェクトの資料 claude/anzen-handoff.md の「ポスターの作り方」
- マージ：する

### [x] そろえる物のページの残り（買う理由・その2）（#75）
- やること：前の項目で中身を作らなかった物のページ9つ（dansa・wbgt・tebukuro・horeizai・konsento・co2・shokaki・ondo・shodo）に、なぜ今か・選ぶときに見る所・出典を足し、月のページ（4・5・6・7・8・10・11月）の「今月そろえる物」を出す
- 順番：「そろえる物のページと楽天の取得」のあと（そちらがマージ待ちなら、そのブランチの上に積む）
- できあがりの条件：`npm run check` が緑。9ページに商品3つずつが出る（3件に届かない物は商品の節がなく、PR に書く）。書いていない別の Claude が出典と照らして点検した
- 決まったこと：前の項目の「決まったこと」のとおり。WBGT計・CO2モニター・温湿度計・照度計は、記録帳（次の項目）からもつなぐので、why は月のテーマの数字と記録帳の言い方の両方に合う1行に。保冷剤は病気を防ぐ・治すと書かない。消火器の設置の決まりはなぜ今かに書かない（火事のテーマのページにある）
- 迷ったら：テーマの掲示の決まり・やること・朝礼に、その物とつながる行がない月は月のリンクを出さず、PR の本文に書く（つながりを作り話で書かない）
- 読むファイル：CLAUDE.md、src/data/kau.mjs、src/pages/soroeru.mjs、各テーマのデータ
- マージ：する

### [x] 職場を測る記録帳（買う理由・その3）（#77）
- やること：知識のページを1つ足す。`src/data/kihon/sokutei.mjs`（index.mjs の setsubi の次）・`/kihon/sokutei/`。問いは「測った空気・暑さ・明るさは基準の内か」。測った数字（二酸化炭素 ppm・温度・湿度・照度 ルクス・WBGT）を入れると、決まりの数字とくらべて内か外かを出す（業種で事務所衛生基準規則か労働安全衛生規則かを切りかえる）。入れた数字は日付・場所といっしょに端末の中だけに残す（localStorage の新しいキー `anzen-sokutei-v1`。送らない）。今年度（4月〜3月）の月ごとの記録の表と、A4 1枚の測定記録表（印刷・すみに QR）。「何で測る？」の節に、4つの測る道具（CO2モニター・温湿度計・照度計・WBGT計）を1行ずつ、そろえる物のページ（`/soroeru/co2/`・`ondo/`・`shodo/`・`wbgt/`）への文字のリンクで（楽天の商品はこのページに出さない）。設備のページ（/kihon/setsubi/）・10月の空気と換気・5月の熱中症から1行のリンク。プライバシーポリシーの「保存する情報」に1行
- 順番：「そろえる物のページの残り」のあと（測る道具のページを使うため。マージ待ちなら、そのブランチの上に積む）
- できあがりの条件：`npm run check` が緑（kihon のテストの決まり：答えは40字まで・判定と印刷がある・条文は e-Gov を出典に）。記録のテスト（キーの名前・送らない・年度の切りかえ）を足した。このページに AdSense のコードがあり、楽天の商品・クレジットはない。印刷が A4 1枚（Playwright で PDF にして数える）。書いていない別の Claude が出典と照らして点検した。スマホとパソコンのスクショを並べて1枚
- 決まったこと（11/6 しょーくん）：基準の数字は、いまのサイトのデータと同じ出典・同じ言い方にそろえる（setsubi.mjs の照度・温度・湿度、kanki.mjs の二酸化炭素 5000ppm 以下と、空調や機械換気の設備が送る空気は 1000ppm 以下、hourei.mjs の necchusho の「WBGT 28度以上か気温31度以上の場所で、1時間以上続くか、1日4時間をこえる作業」）。表の行に区分（法令の義務・努力義務・職場で決めること）をつける（温度18〜28℃・湿度40〜70%は努力義務）。WBGT は「熱中症の報告の体制と手順の対象になる暑さか」だけを判定し、作業の重さごとの基準値の判定はしない（5月の熱中症のテーマへつなぐ）。測る道具は、何をどこで測るかを自分たちの言葉で書いたあとに、そろえる物のページへの文字のリンクで置く。機種の名前やくらべは書かない
- 迷ったら：事務所でない作業場（店の売り場・厨房・工場）で法令の数字がちがう・ないものは、事務所の数字を「目安」として出し、「法令の区分では業種で変わるので、労働基準監督署に確認」。中央管理方式の空気調和設備の2か月ごとの測定（事務所衛生基準規則）を書くなら、条文と労働局の資料の2つで確かめてから（確かめられなければ書かない）。記録は1か月・1場所・1件（同じ月と場所は上書き）
- 読むファイル：CLAUDE.md、src/data/kihon/setsubi.mjs・hiyari.mjs（印刷する紙）、src/data/kanki.mjs、src/data/hourei.mjs（necchusho）、src/pages/kihon.mjs・kihon-tools.mjs、src/client/kihon.js、src/client/rec.mjs（端末の中の記録の形）、tests/kihon.test.mjs、src/data/kau.mjs
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

### [ ] 資格の期限を何人分も残す台帳（資格の更新）
- やること：資格の更新の期限 `/shikaku/koushin/` で出した期限を、職場の何人分でも端末の中に残せるようにする。期限の結果の下に「台帳に残す」のボタンと呼び名の欄（入れなくてもよい・`inputmode="text"`・`maxlength="10"`）。入口のページの計算の下に「資格の期限の台帳」の節を足し、呼び名・資格・修了日・期限・あと何日を期限の近い順の表に出す（1行ずつ消せる。期限が過ぎた行は「期限切れ」と出して残す）。A4 1枚の台帳の紙（印刷・すみにサイト名と QR）。資格ごとのページ（kantoku・byouin・bouka）には「台帳に残す」と、入口の台帳への1行のリンクだけ。記録は localStorage の新しいキー `anzen-shikaku-v1`（送らない。いまの `koushin` のキーはそのまま残す）。期限の計算はいまの koushin.js と `icsLimit`（ics.mjs）を使い、足す・消す・並べかえは新しい部品 `src/client/daicho.mjs`（sokutei.mjs と同じく、ページでは export を外して入れる）。プライバシーポリシーの「ブラウザに保存する情報」（info.mjs の `STORED`）に1行
- できあがりの条件：`npm run check` が緑。tests/shikaku.test.mjs にテストを足した（キーの名前・送らない〔fetch・sendBeacon・XMLHttpRequest がない〕・期限の近い順・同じ呼び名と資格は上書き・防火・防災の4月1日の数え方が台帳でも同じ）。計算の部分はいままでどおりスマホの1画面（390×660）に入る。印刷が A4 1枚（Playwright で PDF にして数える）。呼び名に `<b>` などを入れても HTML にならない（エスケープ）。スマホ（390×660）とパソコン（1280×800）のスクショを並べて1枚にし、claude/site-principles.md の「使わないもの」と照らした
- 決まったこと：連絡 C-026（11/6 しょーくん「読み物を拡充、答えに関する読み物とか、記事のボリューム、自分で計算できるなどの来る理由を継続していくことが大切」）の③「自分で計算できる・自分の数字が残る」を、いちばん表示の多い /shikaku/koushin/（claude/search-data-anzen.md の 11/6 の回で 61表示・7.8位・0クリック）に足す。計算と記録は端末の中だけで送らない（CLAUDE.md）。資格の更新には講座の広告を置かない（claude/anzen-handoff.md の「広告・アフィリエイト」）。title の頭「清掃作業監督者・病院清掃受託責任者」は変えない（docs/shikumi.md の「資格の更新の期限」）。印刷は A4 1枚で、紙のすみにサイト名と QR（CLAUDE.md・claude/anzen-handoff.md の「大事な決めごと」）
- 迷ったら：呼び名が空なら「1人目」「2人目」のように番号で出す（名前を入れさせない）。同じ呼び名・同じ資格は上書き（職場を測る記録帳の「同じ月と場所は上書き」と同じ考え。呼び名が空の行どうしは上書きせず足す）。A4 に入りきらない行は、期限の近い順に入るだけ入れ、紙の下に「ほかの◯件は画面の台帳で見る」の1行（職場を測る記録帳の紙と同じ形）。台帳から .ics をまとめて作る機能は作らない（1件ずつのいまの「カレンダーに入れる」のまま）。台帳が0件のときは節の見出しと1行だけにし、印刷のボタンを出さない。全ページ点検の1行の決まり（.u-note は26字など）にかかったら文を短くする。新しい見た目の形は作らず、いまの表（pg-t）と紙（.psheet）を使う
- 読むファイル：CLAUDE.md、docs/shikumi.md の「資格の更新の期限」、src/pages/shikaku.mjs、src/client/koushin.js・ics.mjs、src/data/shikaku.mjs、src/client/sokutei.mjs・sokutei.js（端末の中の記録と A4 の紙の形）、src/pages/kihon.mjs（印刷の紙）、src/pages/info.mjs（STORED）、tests/shikaku.test.mjs・tests/sokutei.test.mjs
- マージ：する
- 足した：育てる山の補充（自動・2026-11-10）

### [ ] 読みものの RSS
- やること：読みものの RSS `/yomimono/feed.xml` をビルドで作る（RSS 2.0。記事ごとに題・URL・説明文〔データの description〕・公開日〔published〕。新しい順・全部）。読みものの目次と記事のページ、トップの head に `<link rel="alternate" type="application/rss+xml">`（読みものが1本以上あるときだけ）。目次 /yomimono/ の下に「RSS で読む」の文字のリンクを1行。テストは tests/yomimono.test.mjs に足す。CLAUDE.md の「読みもの」の行と docs/shikumi.md の「読みもの」に RSS のことを短く
- できあがりの条件：`npm run check` が緑。テストで、feed.xml の件数が `YOMIMONO` と同じ・リンクが https://anzen-benricho.com/ から始まる・pages.dev が入らない・XML の特別な字（& < >）がエスケープされている、を見る。docs/yomimono-neta.md の書き方は変えずに、記事を足すと RSS にも入る
- 決まったこと：楽しさの「呼び戻せる入口：ホーム画面に追加・カレンダーの購読（.ics）・RSS」（claude/site-principles.md の「楽しさで、わざわざ来てもらう」）。ホーム画面に追加（/manifest.webmanifest）とカレンダーの購読（/calendar.ics）はもうあるので、まだの RSS を足す。形はサクッと計算の読みものの RSS（公開リポジトリ juice0402/sakutto-keisan の src/pages/yomimono.mjs の `FEED`・`feedXml`、src/layout.mjs の `feed`）に合わせる。外部のファイルは読まない（CLAUDE.md）
- 迷ったら：◯月号（月のページ）は入れず、読みものだけにする（サクッと計算と同じ。◯月号はカレンダーの購読が毎月1日に知らせている）。RSS の説明文はデータの description をそのまま使い、新しい文を書かない。サイトマップには入れない。ページの関数から xml を書き出す口がなければ、calendar.ics と同じく scripts/build.mjs で書き出す（全ページ点検は .html だけを見るので、xml は点検にかからない）
- 読むファイル：CLAUDE.md、docs/shikumi.md の「読みもの」、src/pages/yomimono.mjs、src/data/yomimono/index.mjs、src/layout.mjs（head）、scripts/build.mjs（calendar.ics の書き出し）、scripts/verify-dist.mjs、tests/yomimono.test.mjs、サクッと計算の src/pages/yomimono.mjs・src/layout.mjs（`git clone --depth 1 https://github.com/juice0402/sakutto-keisan`）
- マージ：する
- 足した：育てる山の補充（自動・2026-11-10）

### [ ] 1年の実施記録に、月ごとのそろえる物
- やること：1年の実施記録 `/anzen/kiroku/` の「◯年度の12か月のテーマ」の各月の行に、その月のそろえる物（`kauOfMonth`。ページのある物だけ）を「そろえる物：物の名前」の文字のリンクで足す。印刷の紙（.kr-sheet）には足さない。テストを足す（tests/kau.test.mjs か新しい tests/kiroku.test.mjs）
- できあがりの条件：`npm run check` が緑。テストで、記録帳のページに `KAU_MONTH` の月のうちページのある物すべてへのリンクがあり、紙（.kr-sheet）の中に /soroeru/ のリンクがない・楽天の商品とクレジットがない・AdSense のコードはある、を見る。スマホ（390×660）とパソコン（1280×800）のスクショを並べて1枚にし、claude/site-principles.md の「使わないもの」と照らした
- 決まったこと：月のページと記録帳は、そろえる物へ文字のリンクだけを出し、AdSense はそのまま（この山の「そろえる物のページと楽天の取得」の決まったこと・CLAUDE.md の「月のページ・記録帳からは文字のリンクだけ」）。楽天の商品はそろえる物のページだけ（CLAUDE.md）。物のページの「あわせて見る」はもう記録帳へリンクしている（src/pages/soroeru.mjs）ので、記録帳からも返す。二大テーマの両方に当たる（積み上がる記録と、季節の備えの買う理由。claude/site-principles.md の「買いに来る理由がある人を集める」）
- 迷ったら：そろえる物のない月（3月・9月）は何も足さない。物の名前は kau.mjs の `t` のまま、なぜ今か（why）は足さない（月のページにあるため）。いまの .krel のリンクは1行いっぱいの形なので、テーマのリンクの下にそろえる物のリンクが行として並ぶ形でよい（新しい形は作らない）。ページの description は変えない。測る道具（温湿度計・照度計）は月がないので足さない
- 読むファイル：CLAUDE.md、src/pages/kiroku.mjs、src/data/kau.mjs、src/pages/months.mjs（今月そろえる物の出し方）、src/pages/soroeru.mjs（あわせて見る）、scripts/verify-dist.mjs（楽天のページの点検）、tests/kau.test.mjs
- マージ：する
- 足した：育てる山の補充（自動・2026-11-10）
