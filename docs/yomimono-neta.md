# 読みもののネタの山と書き方

予約タスク「読みもの書き（4サイト）」が、水曜と日曜に1本ずつ書く（プロジェクトの資料 claude/sodatsu-spec.md）。
このファイルと CLAUDE.md だけで1本書けるようにしてある。ネタの題は 2026-11-04 にしょーくんが OK した。

## 書き方

### 置く場所と作り方
- 置き場所がまだ main にないとき（`src/data/yomimono/index.mjs` がない）は書かずに終わり、報告ファイルに「- 読みもの：飛ばした（置き場所がまだ。docs/sodateru.md の1番目のマージ待ち）」と1行
- 1本1ファイル：`src/data/yomimono/<slug>.mjs`。URL は `/yomimono/<slug>/`。slug は半角の英小文字とハイフン（例 `fuyu-neta`）
- 並び：`src/data/yomimono/index.mjs` の `YOMIMONO` の先頭に足す（新しい順。目次 `/yomimono/` とトップの「調べる」の本数はここから出る）
- ひな形（項目の名前はこのとおり。`tests/yomimono.test.mjs` が見る）

```js
// 読みもの「<h1>」（<公開日>）。ネタの山の<番号>。出典で一致を確かめたこと・書かなかったことを1〜3行
export default {
  slug: 'fuyu-neta',
  h1: '冬の安全衛生ネタ 12〜2月の朝礼で話せること',
  title: '冬の安全衛生ネタ｜12月〜2月の朝礼と掲示で話せること', // 検索結果の題。全角32字くらいまで
  description: '…', // 全角80〜120字（半角は0.5）。その記事だけの数字を入れる
  d: '…', // 目次の灰色の1行。全角26字まで
  published: '2026-11-08',
  checked: '2026-11-08', // 出典を開いて確かめた日
  photo: 'ym-fuyu-neta', // src/data/photos.mjs の名前
  lead: '…', // はじめの答え。2〜3文・全角120字くらいまで
  sections: [
    { h: '…', p: ['段落', '段落'] },
    { h: '…', p: ['…'], table: { head: ['…', '…'], rows: [['…', '…']] } },
  ],
  voice: null, // 運営者のひとこと。ネタの行に「経験」があるときだけ1〜2文
  links: [{ href: '/anzen/12/', t: '12月の掲示と朝礼', d: '業種ごとの掲示をA4で印刷' }], // 職場で確かめる（1〜3）
  src: [{ t: '題（発行元・年）', url: 'https://…' }], // 2つ以上
};
```

- 写真：1本に1枚。名前は `ym-<slug>`。`src/data/photos.mjs` の `PHOTO` に説明を1行足し、ファイルは `public/img/photo/ym-<slug>-640.webp`・`-1200.webp`（作り方は下の「絵」）
- コマンド：`npm run check`（テスト → ビルド → 全ページ点検）が緑になるまで直す
- ブランチは `claude/yomimono-<slug>`。PR の題は「読みもの：<h1>」。本文にネタの行・出典の一致・点検で直したことを書く

### 中身
- 読む人：50人未満の職場で安全衛生をまかされた人（総務・店長・現場のリーダー）と、清掃・ビルメンの現場の人。業種は 事務所・店舗／飲食／製造／清掃・ビルメン
- 1本1つの問いに答える。はじめの答え（lead）で答えを言い切り、節（h2）を3〜5つ。節は、しくみ・数字・表・業種ごとのちがい・現場での例で書く
- 長さ：本文（lead・節・表・voice の自分の文）は全角900字以上、2,500字くらいまで。字数のための水増しはしない
- 出典：公的なサイトだけ（厚労省・労働局・e-Gov・職場のあんぜんサイト・中災防・安全衛生情報センター・消防庁・消費者庁・都道府県と市）。資格は講習をする団体（全国ビルメンテナンス協会など）、製品はメーカーのカタログ・SDS・取扱説明書。2つ以上で一致したことだけ書く。文章は写さない。出典の題は WebFetch で題名と発行年を確かめてから書く
- 確認日：`checked` に出典を開いた日。記事は90日のテストの対象外（記事に「◯年◯月◯日に確かめた内容」と出る）。URL は毎週月曜の出典の点検が見る
- 最後の「職場で確かめる」（links）：サイトの中の掲示・道具・印刷のページへ1〜3つ。ネタの行の「つなぐ先」を使う。サクッと計算（https://sakutto-keisan.com/）へのリンクはよい
- 言葉（CLAUDE.md と同じ）
  - 法令は「法令の区分では」。区分に迷う業種は「労働基準監督署に確認」、消防法と火災予防条例は「消防署に確認」
  - 義務は「法令の義務」「努力義務」「職場で決めること」の3つで分ける。通達・指針・ガイドラインの「望ましい」は職場で決めること。出典が勧めているだけのことは「呼びかけている」「すすめている」、法令の言い切りのときだけ「求めている」
  - 使わない言葉：しましょう・ぜひ・便利・簡単・安心・おすすめ・ポイント・コツ・ダッシュ（——）・絵文字。3つ並べの言い回し、「まず・さらに・また」の連続、キャッチコピーも書かない。太字と箇条書きを多用しない。かっこは1文に1つまで
  - 書かないもの：罰則（働きすぎ・防火）・相談ダイヤルの番号・#7119・医療の判断（病名を決める・薬）・熱中症の速報値（確定値だけ）・作り話の体験談・職場の名前や職場で起きたこと
- 運営者の経験：ネタの行の「経験」に書いてあることだけを、voice に短く書く（しょーくんから聞いたこと。言いかえて広げない）。書いてないネタは voice を null にする
- 点検：書いたら、書いていない軽いモデルに、現場の担当者になって読ませる（出典と合っているか・義務のように書いていないか・使わない言葉・わかりにくい所）。直してから PR

### 絵
- 1本に1枚、Canva の AI の写真ふうの絵（generate-image・LANDSCAPE_16_9）。プロンプトの頭に "Realistic photograph, natural daylight, bright and clean Japanese workplace, shallow depth of field, "、最後に ", no people, no hands, no faces, no text, no letters, no numbers, no logos, no watermark"。記事の場面の「もの」を1つ（例：休憩室の加湿器）
- 人・手・顔・にせの字・顔に見える配置・形のおかしい物があれば1回だけ作り直す。候補は1枚。全サイトで1回8枚まで
- 入れ物：Canva のデザイン DAHZL87oR4A（1600×900）にページを足して insert_fill → export-design（jpg・quality 80・1200×675）。書き出しの URL は約1時間で切れるので、すぐ取りこむ
- 取りこみ：`art/poster/import.json` を `[{ "url": "<書き出しのURL>", "path": "img/p-ym-<slug>.jpg" }]` にして claude/ のブランチに push → `poster-import.yml` が public/img/ にコミット → git fetch して重ね、`python3 art/photo/webp.py`（Pillow）で WebP 2つにして JPG は消える → photos.mjs に説明。import.json は元に戻す
- Canva が待ち時間（quota_cooldown）のときは待ちつづけない。絵のほかを push して PR を残し「とちゅう（絵だけ次の回）」。次の回が続きをする
- 配るもの（印刷・PDF）には Canva の絵を入れない。記事に印刷は作らない（印刷はつなぐ先のページにある）

### 公開
- squash でマージすると `deploy.yml`（Build and Deploy）が main への push で動く。workflow_dispatch はいらない。main の build-deploy の成功で公開を確かめる
- 報告ファイル claude/reports/anzen.md に「- 読みもの『<h1>』：公開（PR #◯）」
- ネタの行を `- [x] 題（PR #◯・2026-11-◯）` にする（同じ PR の中で）

### ネタの選び方（残りが5本を切ったら、同じ PR で10本足す）
- 選んでよい：上の「読む人」が仕事で探す問い。2〜3か月先の季節（全国の運動・季節のけが）、法改正（`src/data/hourei.mjs` のもの）、検索で見られている言葉（プロジェクトの資料 claude/search-data-anzen.md が読めれば）、清掃・ビルメンの現場の段取りと安全
- 選ばない：1行で答えが終わる問い（言葉の意味だけ）、知識のページ（`src/data/kihon/` の h1）・テーマのページと同じ問い、国の発表を待つもの、会社や講座をくらべて順位をつけるもの、医療の判断が要るもの、自殺や命に関わる深い話題（3月の心の健康のテーマにまかせる）、運営者の経験がないと書けないもの
- 重ねない：山にある題・書いた題と同じ問い。同じ季節のネタは続けて3本まで
- 1本ごとに、出典の URL を1〜3つ（WebSearch で見つけて WebFetch で開けたもの）と、つなぐ先（サイトの中のページ）をネタの行に書く

## ネタの山
書き方：`- [ ] 題 — だれの何に答えるか／出典の URL／つなぐ先／経験（あるときだけ）`。上から順に書く。出典が開けないネタは飛ばして、山のいちばん下へ回す

- [ ] 冬の安全衛生ネタ 12〜2月の朝礼で話せること — 「安全衛生 ネタ 冬」で探す担当者に、12〜2月のテーマと全国の運動を月ごとに（docs/sodateru.md の1番目の夜が、置き場所といっしょに書く）／出典 https://anzeninfo.mhlw.go.jp/yougo/yougo94_1.html ・ https://www.jisha.or.jp/info/campaign/musaigai/youryou.html ・サイトのデータ src/data/themes.mjs（12・1・2月）と src/data/koyomi.mjs／つなぐ先 /anzen/12/ ・ /anzen/1/ ・ /anzen/2/
- [ ] 年末年始無災害運動とは（12月1日〜1月15日）— どんな運動で、小さな職場は何をするか／出典 https://www.jisha.or.jp/info/campaign/musaigai/youryou.html ・ https://jsite.mhlw.go.jp/tochigi-roudoukyoku/content/contents/002475103.pdf ・ https://jsite.mhlw.go.jp/chiba-roudoukyoku/hourei_seido_tetsuzuki/anzen_eisei/musaigaiundou_nenmatunensi.html ／つなぐ先 /anzen/nenkan/ ・ /anzen/12/
- [ ] 加湿器の手入れとレジオネラ（冬の事務所）— 事務所の加湿器を毎日・毎週どう手入れするか／出典 https://www.mhlw.go.jp/content/10900000/001318584.pdf ・ https://www.city.machida.tokyo.jp/iryo/hokenjo/kankyou/gaityu/shitudo_fuyu.files/kashituki.pdf ／つなぐ先 /anzen/theme/kanki/ ・ /kihon/setsubi/
- [ ] 凍った床と雪の日の出入口（清掃・ビルメンの転倒）— 雪や凍結の朝、入口と通路をどう整えるか／出典 https://jsite.mhlw.go.jp/nagano-roudoukyoku/content/contents/touki_tentousaigaiboushi-leaflet202312.pdf ・ https://jsite.mhlw.go.jp/ishikawa-roudoukyoku/content/contents/002477015.pdf ・ https://anzeninfo.mhlw.go.jp/yougo/yougo94_1.html ／つなぐ先 /anzen/theme/tentou/seisou/
- [ ] インフルエンザで休ませるのは法令の決まり？ — 法令の区分では就業禁止（安衛則61条）に当たるか、休ませるかは職場で決めることか／出典 https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/kekkaku-kansenshou/infulenza/QA2026.html ・ https://www.mhlw.go.jp/bunya/kenkou/kekkaku-kansenshou04/21.html （平成21年の新型インフルエンザの Q&A。季節性と同じとは書かない）。61条の言い方は労働局の資料か安全衛生情報センターでもう1つ確かめ、2つで一致しなければ飛ばす／つなぐ先 /anzen/theme/kansen/
- [ ] 50人未満の職場の委員会の進め方 — 委員会の義務がない職場で、関係労働者の意見を聴く機会（安衛則23条の2）をどう回すか／出典 https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/faq/1.html ・ https://www.mhlw.go.jp/content/11303000/001576427.pdf ／つなぐ先 月のページの「今月の委員会で話すこと」（/anzen/<月>/）・ /kihon/ninzu/ ・ /kihon/hozon/ ／経験：運営者の職場（50人以下）では安全衛生推進委員会を毎月1回ひらき、運営者が毎月1テーマの資料を作って配り、説明している
- [ ] 指差し呼称とタッチ・アンド・コールは何のため？ — 2つの目的のちがい（指差呼称は確かめの誤りを減らす、タッチ・アンド・コールはチームの一体感）／出典 https://anzeninfo.mhlw.go.jp/yougo/yougo72_1.html ・ https://www.mhlw.go.jp/new-info/kobetu/roudou/gyousei/anzen/dl/shakai_e_Part2.pdf ／つなぐ先 /kihon/ky/
- [ ] ヒヤリハットが出てこないときに見直すこと — 報告が集まらない職場で、責めない取り決めや共有のしかたを見直す／出典 https://anzeninfo.mhlw.go.jp/yougo/yougo26_1.html ・ https://anzeninfo.mhlw.go.jp/hiyari/anrdh00.html ／つなぐ先 /kihon/hiyari/
- [ ] 2027年4月から変わる職場の決まり まとめ — 健診の項目（血清クレアチニン）・個人事業者等の安全衛生・ラベルとSDSの対象（次亜塩素酸ナトリウムなど）を1本で／出典 サイトのデータ src/data/hourei.mjs（kenshin-2027・kojin-sochi・kagaku-2027 の出典）・ https://jsite.mhlw.go.jp/okayama-roudoukyoku/newpage_02132.html ／つなぐ先 /hourei/ 。2028年4月のラベル・SDSの追加は別の回なので、混ぜない
- [ ] カスハラ対策の義務化 お店と飲食店がすること — 2026年10月1日から全事業主の義務になった措置を、小さな店の形で／出典 https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyoukintou/seisaku06/index.html ・ https://www.mhlw.go.jp/content/11900000/001699976.pdf ／つなぐ先 /hourei/kasuhara/ ・ /anzen/theme/harassment/
- [ ] 50人未満のストレスチェック義務化への準備 — 2028年4月1日からの義務に、今からできる準備（外部への委託・規程・面接指導の医師）／出典 https://www.mhlw.go.jp/stf/newpage_70761.html ・ https://www.mhlw.go.jp/content/11303000/001646587.pdf ／つなぐ先 /hourei/stress-check/
- [ ] 高年齢の人の転倒を減らす職場の見直し — 2026年4月からの努力義務と、エイジフレンドリーガイドラインの職場の見直し（段差・明るさ）／出典 https://www.mhlw.go.jp/stf/newpage_10178.html ・ https://jsite.mhlw.go.jp/fukushima-roudoukyoku/anzen_eisei_rousai_boushi_taisaku_00011.html ／つなぐ先 /hourei/koureisha/ ・ /anzen/theme/kourei/
- [ ] ビルクリーニング技能士と清掃作業監督者のちがい — 技能検定と講習、建築物清掃業の登録で要る人／出典 https://www.j-bma.or.jp/qualification-training/building-cleaning ・ https://www.j-bma.or.jp/qualification-training/kantoku ・ https://www.tmiph.metro.tokyo.lg.jp/files/k_kenchiku/touroku/shinsei/seisou/1-seisou-tourokukijun.pdf ／つなぐ先 /shikaku/koushin/kantoku/ ／経験：運営者は1級ビルクリーニング技能士と清掃作業監督者の両方を持っている。技能士は実技の試験がある。現場で役立つのは技能士だと感じている
- [ ] 病院清掃の感染対策（標準予防策と清掃の順番）— 病院の清掃で守ること／出典 https://www.mhlw.go.jp/content/10800000/000845013.pdf ・ https://www.j-bma.or.jp/qualification-training/hospital-cleaning ／つなぐ先 /shikaku/koushin/byouin/ ・ /anzen/theme/kansen/seisou/ ／経験：運営者（病院清掃受託責任者・感染対策アドバイザー）がいちばん気をつけているのは、きれいな所から汚れた所へ順に清掃すること。順番を書いた公的な資料は見つかっていないので、運営者の経験として voice に書く
- [ ] 労災が起きたその日にすること — 病院では健康保険を使わない・労災指定病院と様式第5号・そのあとの死傷病報告／出典 https://jsite.mhlw.go.jp/kagoshima-roudoukyoku/hourei_seido_tetsuzuki/rousai_hoken/rousai02.html ・ https://www.mhlw.go.jp/file/06-Seisakujouhou-11200000-Roudoukijunkyoku/0000163986.pdf ／つなぐ先 /kihon/shishobyo/
- [ ] 腰痛を防ぐ重さの目安（国の指針）— 人の力で持つ重さは、男性は体重のおおむね40%以下など／出典 https://www.mhlw.go.jp/content/11303000/001376471.pdf ・ https://www.mhlw.go.jp/content/11300000/000957787.pdf ／つなぐ先 /anzen/theme/youtsu/
- [ ] 小さな職場の安全衛生の年間計画の立て方 — 全国の運動と季節で月のテーマを決める／出典 https://jsite.mhlw.go.jp/kyoto-roudoukyoku/hourei_seido_tetsuzuki/anzen_eisei/newpage_01627.html ・ https://www.mhlw.go.jp/stf/newpage_71713.html ・ https://www.mhlw.go.jp/stf/newpage_74929.html ／つなぐ先 /anzen/nenkan/ ／経験：運営者は年間計画のテーマを季節で決めている（夏は熱中症、冬は転倒など）
- [ ] お店のバックヤードのカゴ車・台車のけが — ロールボックスパレットの使い方の決まりごと（押す向き・前が見える高さ・床）／出典 https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000098500.html ・ https://jsite.mhlw.go.jp/gunma-roudoukyoku/content/contents/001943839.pdf ／つなぐ先 /anzen/theme/youtsu/
- [ ] 厨房の床のすべりと靴 — 飲食店でいちばん多い転倒を、床の手入れと履き物で減らす／出典 https://www.mhlw.go.jp/file/06-Seisakujouhou-11300000-Roudoukijunkyokuanzeneiseibu/0000110452.pdf ・ https://jsite.mhlw.go.jp/tokyo-roudoukyoku/content/contents/002641639.pdf ・ https://www.mhlw.go.jp/file/06-Seisakujouhou-11300000-Roudoukijunkyokuanzeneiseibu/0000111161.pdf ／つなぐ先 /anzen/theme/tentou/inshoku/ 。出典の言葉は「滑りにくい履き物」なので、それに合わせる
- [ ] 機械の掃除や調整は止めてから — 安衛則107条（掃除・給油・検査・修理・調整のときは運転を止める）と、はさまれ・巻き込まれ／出典 https://jsite.mhlw.go.jp/shiga-roudoukyoku/content/contents/002554091.pdf ・ https://jsite.mhlw.go.jp/osaka-roudoukyoku/content/contents/202604161202.pdf ／つなぐ先 /anzen/theme/te/seizo/ 。「詰まり取り」は出典の例に出てくるときだけ書く
