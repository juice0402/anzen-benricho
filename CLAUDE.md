# 安全衛生の便利帳 — Claude 向けの決まり

職場の安全衛生の担当者向けに、毎月そのまま使える掲示・朝礼・やることと、清掃・ビルメンの資料、講習・資格の更新の目安をまとめる静的サイト（https://anzen-benricho.com）。運営はしょーくん。
しょーくんはコードを書かず、ターミナルも使わず、スマホで確認する。開発・運用は Claude が担当する。
2026-10-22 に「今月の安全衛生」と「清掃・ビルメンのまとめ帳」を統合して始めた。設計はプロジェクトの資料 `claude/anzen-seisou-tougou-plan.md`、元の設計は `claude/kongetsu-anzen-spec.md`・`claude/seisou-matome-spec.md`、共通の原則は `claude/site-principles.md`。

## いまの状態
- デザインを3案（点検表 `tenken`・回覧板 `kairan`・掲示板 `keiji`）でくらべている。`src/site.mjs` の `designPhase: true` のあいだは、トップが3案の入口で、案ごとに `/design/<id>/` の下に同じページを作る
- 案が決まったら：`designPhase: false`、`scripts/build.mjs` でえらんだ案をトップに作る、ほかの案の CSS を消す、`page()` の `data-design` と `base` を整理する
- 公開まで `SITE.launched: false`（全ページ noindex）。公開の日に true にし、sitemap・IndexNow・Search Console を足す

## サイト作りの方針（しょーくんの方針・10/17）：迷ったら上から順に優先する
- 前提：中身が正しい・軽くて速い・利用者のデータを送らない・むだな通信をしない・SEO。公開前に高速化・デバッグ・SEO の点検
1. 直感で使いやすく、文字を少なく（大事な部分はスマホ1画面。目安 390×660px。説明は1行まで）
2. AIっぽさゼロ（見た目と言い回し。絵文字は使わない。`verify-dist.mjs` が点検）
3. GUI でビジュアル的に。ただし飾りで大事な部分を画面の外に押し出さない

## 中身の決まり
- 毎月の3点セット：掲示1枚（A4・白黒で読める。決まり3つ・確認欄・出典の1行）、朝礼1分（約300字まで・話し言葉）、担当者のやること3つ。`tests/data.test.mjs` が見張る
- 業種は 事務所・店舗／飲食／製造／清掃・ビルメン の4つ。業種の札で切り替え、えらんだ業種はブラウザに覚える（localStorage。送らない）
- 出典は公的なサイト（厚労省・労働局・e-Gov・中災防・職場のあんぜんサイト・都道府県）と、製品はメーカーのカタログとSDSだけ。出典URLと確認日を必ずデータに入れる。確認日から90日でテストが止まるので、公式を開いて確かめ直す
- 書き方：公式資料・実際の事例・現場の声の3種類で調べ、2つ以上で一致するものだけ使う。文章は写さない。仕上げに、下書きを見ていない別の Claude が現場の人になりきって確認する
- 職場の名前や具体的な情報、体験談は載せない
- 清掃の安全の決まり（脚立・洗剤をまぜない）は安全のコーナーに、道具と段取りは清掃のコーナーに書いて、おたがいにリンクする。サクッと計算と同じ計算は作らない
- 楽天は API を使わず、楽天アフィリエイトの画面で作ったリンクを置く（このリポジトリは公開なので、API で取った情報は入れない）

## しくみ
- 依存パッケージなしの Node だけのビルド（`scripts/build.mjs`）。コマンドは `npm run check`（テスト → ビルド → 全ページ点検）。PR 前に必ず緑にする
- CSS とスクリプトは各ページに埋め込む。外部のファイル・フォントは読まない
- 公開：GitHub Actions（`.github/workflows/deploy.yml`）が Cloudflare Pages へ Direct Upload。PR → プレビュー（PR に URL のコメント）／main → 本番。Secrets は `CLOUDFLARE_API_TOKEN`（Pages の編集だけ）・`CLOUDFLARE_ACCOUNT_ID`
- 流れ：ブランチ `claude/...` → PR → CI が緑・プレビューで確認 → しょーくんに知らせてから Merge。Cloudflare のビルド枠は使わないが、push はまとめて少なく

## ファイル
| 場所 | 中身 |
|---|---|
| `src/site.mjs` | サイト名・URL・コーナー・デザインの3案 |
| `src/data/*.mjs` | 毎月のテーマ（業種ごとの掲示・朝礼・やること・出典）と法改正 |
| `src/layout.mjs` | ページの外側（head・ヘッダー・フッター・パンくず） |
| `src/pages/*.mjs` | ページ（`home` 総合トップ、`theme` 毎月のテーマ、`compare` 3案の入口） |
| `src/client/*.js` | ブラウザ用のスクリプト（業種の札・印刷・コピー） |
| `src/styles/` | `base.css` 骨組みと掲示の紙、案ごとの色と飾り、`print.css` 掲示だけを A4 1枚に |
| `scripts/verify-dist.mjs` | 全ページ点検（noindex・title・description・h1・タグ・id・リンク切れ・外部読み込み・絵文字・使わない言葉） |
| `tests/` | `node --test` |
