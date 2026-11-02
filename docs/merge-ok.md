# マージの印（merge-ok.yml）

- 2026-11-02 司令塔：しょーくんが司令塔で「マージして」と言ったら、司令塔は PR にラベル `merge-ok` を付けるだけ。`.github/workflows/merge-ok.yml`・`scripts/merge-ok.mjs`（テストは `tests/merge-ok.test.mjs`）が点検（Build and Deploy・出典の点検）の合格を待って squash でマージし、公開（deploy.yml）を main で1回動かす。夜の作業・予約タスクはこのラベルを付けない
- 本文の「#12 の PR #34 のあとにマージ」などの順番を守る。点検が通らない・main とぶつかった → コメントして `merge-blocked`（司令塔が見る）。check-runs が1つもない PR は印から10分でマージ
- 試すときは Actions の「マージの印」を `dry_run` で動かす（`pr` を入れるとその PR だけ）。main とぶつかっている PR は GitHub の決まりで印を付けても動かないので、ほかの PR の点検が終わったときか手で動かしたときに見る。PR の点検の workflow の名前を変えたら merge-ok.yml の `workflows` も直す
