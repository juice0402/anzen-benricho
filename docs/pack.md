# 安全衛生の法人パック（#82）

1か月分 500円（税込）・1回払い。買った人だけ開ける、その月のパックのページを、会社名入りで A4 に印刷する（PDF はブラウザの印刷から）。
決めたこと：issue #82・プロジェクトの資料 `claude/anzen-pack-plan.md`。

## ファイル
| 場所 | 中身 |
|---|---|
| `src/data/pack.mjs` | `PACK`（値段・支払いリンクの URL と ID `plink_…`・テストの URL と ID・最初の号 `first`）。鍵は書かない |
| `src/pages/pack.mjs` | `/pack/`（売るページ）と `/pack/<YYYY-MM>/`（月のページ）。売る号 `sellMonth`・作る号 `packMonths` |
| `src/pack-check.mjs` | Stripe のセッションの確かめ方 `checkPack`（fetch を渡す）と `PACK_ROUTES`（dist/_routes.json） |
| `functions/pack/_middleware.js` | Pages Functions はこれだけ。`/pack/open/` と `/pack/<月>/` で `checkPack` |
| `src/client/pack.js`・`pack-sale.js` | 会社名を紙に入れる・業種・印刷、`?e=1` の1行 |
| `src/styles/pack.css` | パックのページだけに入る CSS（`page({ moreCss })`） |
| `src/pages/info.mjs` | `/tokushoho/`（特定商取引法に基づく表記）とプライバシーポリシーの「法人パックのお支払い」 |
| `tests/pack.test.mjs` | 確かめ方（支払い済み・未払い・金額・リンク・月・テストと本番・鍵なし・Stripe のエラー）と号 |

## 出し方（PACK の値で変わる）
- `link` も `testLink` も null：`/pack/` も月のページも作らない（「準備中」を出さない）。`/tokushoho/` はいつもある（フッター）
- `testLink` だけ：`/pack/` を作るが noindex・サイトマップに入れない・どこからもリンクしない（しょーくんがテストの支払いで流れを試す）
- `link` が入ったら：`/pack/` はふつうのページ（サイトマップ・フッターに「法人パック」）
- `link` と `linkId`、`testLink` と `testLinkId` はそろえて入れる（テストが見る）
- 月のページはいつも noindex・サイトマップに入れない・`<meta name="referrer" content="no-referrer">`・サイトの QR なし。広告（AdSense・A8・楽天）は /pack/・月のページ・表記に置かない（`noAds`。verify-dist が見る）

## 売る号と作る号
- 売る号はトップの「今月」と同じ（15日からは翌月）。最初の号 `first` より前なら `first`。買うボタンは `<link>?client_reference_id=pack-<YYYY-MM>`（作り直しの日で変わる）
- 月のページは `first` から売る号の11か月先まで作る（前の号は売らないが、買った人はずっと開ける）

## 開け方（Functions）
- Stripe の支払いリンクの「支払いのあとのリダイレクト先」：`https://anzen-benricho.com/pack/open/?s={CHECKOUT_SESSION_ID}`
- `/pack/open/?s=` → 確かめて `/pack/<月>/?s=<ID>` へ。`/pack/<月>/?s=` は毎回 Stripe に確かめ、よければ静的なページを `Cache-Control: private, no-store` で返す。だめなら `/pack/?e=1`
- 確かめる中身：`status === 'complete'`・`payment_status === 'paid'`・`currency === 'jpy'`・`amount_total === 500`・`payment_link` が linkId（テストは testLinkId）・`client_reference_id === 'pack-<月>'`（ページの月と同じ）・`livemode` が ID の live/test と同じ
- 鍵：`cs_live_` は `STRIPE_KEY`、`cs_test_` は `STRIPE_TEST_KEY`（Cloudflare の Pages の秘密の設定。制限付きキーで Checkout Sessions の読み取りだけ）。鍵がないときは開けない
- `dist/_routes.json`（ビルドで書く）：include `/pack/*`・exclude `/pack/`。ほかのページは Functions を通らない（無料枠を使わない）。`npx wrangler@4 pages dev dist` で確かめた
- こちらは何も残さない：メール・会社名・セッションは保存しない。会社名はページの中で紙に入れるだけ（localStorage にも残さない。業種だけはほかのページと同じ `gyoshu`）

## 紙（月のページ）
- 掲示（テーマごとに1枚・業種のページの紙と同じ形・上に会社名）／朝礼の文（話した日・話した人の欄）／委員会の資料（memo・gidai・todo・quiz。答えは紙の下）／議事録（議題に gidai）／実施記録表
- 新しい事実の文は書かない。テーマのデータといまの紙の部品だけで組む。4業種ぶんをビルドで作り、えらんだ業種だけ見せる
- 1枚に入らないときは字を小さくしすぎず（本文 10.5pt＝約2cqw まで）、テーマで分ける（`TALK_MAX`・`IINKAI_MAX` の字数のめやす）。テーマのデータを変えたら、Playwright で12か月×4業種を PDF にして、紙の数とページの数が同じか・はみ出しがないかを見る
