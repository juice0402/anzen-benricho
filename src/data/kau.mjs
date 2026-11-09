// そろえる物（買う理由・その1。#66）：物ごとのページ /soroeru/<key>/ と、月のページの「今月そろえる物」
// 楽天市場の商品は物のページだけに出す（取り方は src/rakuten.mjs・scripts/fetch-rakuten.mjs）
// 形：key → { t: 物の名前, kw: [さがす言葉], must: [商品名にどれかが入る], ng: [入っていたら外す], why, theme, month, points: [選ぶときに見る所×3], src: [{ t, url }], checked }
//   測る道具は month と theme の代わりに sokutei: true（why は記録帳の言い方）
//   points がない物は、ページも月のリンクも出さない（11/9 #75 で12の物すべてに中身を足した）
// 決まり：why の数字は、そのテーマのデータ（memo・多いけが・note）にある数字だけ。points は公的な資料かメーカーの取扱説明書・カタログで2つ以上一致したことだけ
//   機種の名前・くらべ・順位は書かない。おすすめ・お得・最安・今すぐ を使わない。吐いた物の処理セットは病気を防ぐ・治すと書かない（備えの道具）
// 2026-11-06：台車は2社の取扱説明書（耐荷重をこえない・偏らせない・はみ出さない・腰の高さ以上に積まない）、
//   すべり止めマットは新見署・彦根署・広島北署・亀戸署・茨城局の資料、吐いた物の処理セットは川崎市・大阪府・厚労省の資料（12月のテーマと同じ）で書いた
// 2026-11-09（#75）：残りの9つ。見る所はどれも2つ以上の資料（公的な資料・メーカーの取扱説明書やカタログ）で一致したことだけ。
//   測る道具（温湿度計・照度計）の why の数字は知識のページ setsubi（事務所則）の数字。CO2モニターは10月の掲示・朝礼・やることに
//   つながる行がないので、月のページにリンクを出さない（monthLink: false）。保冷剤は体を冷やす物として書き、防ぐ・治すと書かない。
//   消火器は設置の決まりを書かない（11月の火事のテーマにある）

export const KAU = {
  hakimono: {
    t: '吐いた物の処理セット',
    // 11/6 PR #67：1つ目の言葉だけでは条件に合うものが1件だったので、言葉を1つ足し、must に「吐物」を足した
    kw: ['嘔吐物処理セット', '汚物処理キット', 'ノロウイルス 処理セット'],
    must: ['嘔吐', 'おう吐', '吐物', '汚物処理'],
    // 人とペットの両方に使える処理セットが多いので、ペットは外す言葉に入れない（11/6 PR #67）
    ng: ['詰め替え', '詰替', 'ペット用', '犬用', '猫用'],
    // 業務用の処理セットはレビューが少ないので、レビュー3件以上・評価3.5以上にゆるめる（11/7 しょーくん）
    minReviews: 3,
    minRating: 3.5,
    // 条件に合うお店が2つしかないので、2件でも商品の節を出す（11/7 しょーくん「2件でもいい」）
    minShow: 2,
    why: 'ノロウイルスは12月〜1月に多く、おう吐物は乾くと舞い上がる。見つけた所ですぐ処理できるよう、現場ごとに置く',
    theme: 'kansen',
    month: 12,
    points: [
      '使い捨ての手袋・マスク・エプロンがそろっているか。処理する人が着けてから始める',
      'ふき取るペーパーと、口をしばって二重にできるビニール袋が入っているか',
      '塩素系の消毒液か、0.1%の液を作れる物と作り方が入っているか。酸性の洗剤とはまぜない',
    ],
    src: [
      { t: '川崎市 防ごう！ノロウイルスによる二次感染（おう吐物の処理の手順・使う物）', url: 'https://www.city.kawasaki.jp/350/cmsfiles/contents/0000017/17436/2019noro.pdf' },
      { t: '大阪府 ノロウイルスの感染を広げないために（消毒液の濃さと作り方）', url: 'https://www.pref.osaka.lg.jp/documents/3759/noroleaflet.pdf' },
      { t: '厚生労働省 ノロウイルスに関するQ&A（12月〜1月に多い・おう吐物の処理）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/syokuchu/kanren/yobou/040204-1.html' },
    ],
    checked: '2026-10-23',
  },
  suberidome: {
    t: '出入口のすべり止めマット',
    kw: ['玄関マット 業務用 滑り止め'],
    must: ['マット'],
    ng: ['バスマット', 'キッチンマット', 'トイレ', 'ヨガ', 'ペット', '車用', 'カー用品', 'ラグ', 'チェアマット', 'デスク'],
    why: '小売業のけがでいちばん多いのが転倒（令和7年 6,132人）。冬は雨や雪でぬれた入口の床で転ぶ',
    theme: 'tentou',
    month: 1,
    points: [
      '靴の裏についた雨や雪の水を取る、吸水のマットか',
      '出入口に敷く、すべりにくい（防滑の）マットか',
      '凍りやすい屋外の通路には、入口のマットとは別に融雪マットなどを考える',
    ],
    src: [
      { t: '新見労働基準監督署 雨天時等における滑り転倒予防について（出入口に転倒防止用のマット・凍結しやすい所に融雪マット）', url: 'https://jsite.mhlw.go.jp/okayama-roudoukyoku/content/contents/001507681.pdf' },
      { t: '彦根労働基準監督署 転倒災害防止対策の好事例集（出入口に滑り止めマット・靴裏の水を吸着するマット）', url: 'https://jsite.mhlw.go.jp/shiga-roudoukyoku/content/contents/001567301.pdf' },
      { t: '広島北労働基準監督署 小売業における労働災害が増加しています（建物の入口に雪や水を取るマット）', url: 'https://jsite.mhlw.go.jp/hiroshima-roudoukyoku/content/contents/002459196.pdf' },
      { t: '亀戸労働基準監督署 転倒災害防止の好事例集（手洗い場のまわりに吸水マット）', url: 'https://jsite.mhlw.go.jp/tokyo-roudoukyoku/content/contents/000956358.pdf' },
      { t: '茨城労働局 「つまずき」「滑り」による転倒災害の原因と対策（凍結しやすい箇所に融雪マット）', url: 'https://jsite.mhlw.go.jp/ibaraki-roudoukyoku/content/contents/rousai_press_R050530_s09.pdf' },
    ],
    checked: '2026-10-26',
  },
  daisha: {
    t: '台車',
    kw: ['台車 業務用'],
    must: ['台車', '運搬車'],
    ng: ['キャスター単品', '交換用', '部品', 'パーツ', 'カバー', 'ミニチュア', 'おもちゃ'],
    why: '小売業では、重い物を持つなどの無理な動作のけがが令和7年に2,815人。重い物は台車で運ぶのが2月の掲示の決まり',
    theme: 'youtsu',
    month: 2,
    points: [
      '最大積載荷重（耐荷重）が、運ぶ物の重さより大きいか。こえる重さは載せない',
      '荷物が荷台からはみ出さず、重さが片寄らずに置ける広さか',
      '荷物を腰の高さより下に収めて運べるか。高く積み上げない',
    ],
    src: [
      { t: 'サンワサプライ 連結台車の取扱説明書（耐荷重をこえない・重さの偏り・腰の高さ以上に積まない）', url: 'https://cdn.sanwa.co.jp/support/setsumeisyo/pdf/C/CART-FA7_8_ver1-0.pdf' },
      { t: 'ナンシン 樹脂運搬車の取扱説明書（最大積載荷重・偏荷重・荷台より大きな荷物・腰の高さ以上に積まない）', url: 'https://www.matsuyoshi.co.jp/assets/pdf/manual/man_00869349.pdf' },
    ],
    checked: '2026-11-06',
  },
  // ここから下は #75（買う理由・その2・2026-11-09）で中身を足したもの
  dansa: {
    t: '階段の段を見やすくするテープ',
    kw: ['階段 滑り止め テープ'],
    must: ['テープ'],
    ng: ['ペット', '犬', '猫'],
    why: '小売業でけがをして4日以上休んだ人の4割近くが60歳以上（令和7年 6,240人）。4月は階段や段差を歩いて確かめ、段差に目印を貼る',
    theme: 'kourei',
    month: 4,
    points: [
      '段の境目が見分けやすい色か。すべり止めも見やすい色だと、足元に目が向く',
      '表面がすべりにくい物か。段の上のすべり止めをかねる',
      '降り口（いちばん上の段）は踏み外しやすいので、とくに目立たせる',
    ],
    src: [
      { t: '青梅労働基準監督署 階段での転倒災害を防止するための見える化（令和元年12月。段の色・滑り止め・はがれにくさ）', url: 'https://jsite.mhlw.go.jp/tokyo-roudoukyoku/content/contents/002707774.pdf' },
      { t: '厚生労働省ほか 社会福祉施設における労働災害防止のために 好事例集（平成28年3月。階段に色をつけて踏み外しを防ぐ・滑り止めシート・降り口で一度止まる）', url: 'https://www.mhlw.go.jp/content/11300000/001400680.pdf' },
      { t: '大分労働局の掲載資料 転倒災害防止の取り組み事例（階段の滑り止めを見やすい色に・階段のいちばん上に踏み外し注意の表示）', url: 'https://jsite.mhlw.go.jp/oita-roudoukyoku/content/contents/002198443.pdf' },
    ],
    checked: '2026-11-09',
  },
  wbgt: {
    t: '暑さ指数（WBGT）計',
    kw: ['WBGT 熱中症 計'],
    must: ['WBGT', '暑さ指数'],
    ng: ['交換用', '電池のみ'],
    why: '暑さ指数28度以上か気温31度以上で、1時間以上続くか1日4時間をこえる作業は、報告の体制と手順が義務。作業する場所の暑さ指数を測って記録する',
    theme: 'necchu',
    month: 5,
    points: [
      '黒い球（黒球）のついた物か。黒球のない室内用は、日の当たる外では正しく測れないことがある',
      'JIS B 7922 に合う物か。JISマークか、適合の表示を見る',
      '測るときは黒球を握らず、値が落ち着くまで待つ',
    ],
    src: [
      { t: '環境省 暑さ指数（WBGT）の把握（技術情報編 第6章。JIS B 7922 の携帯型・屋外は黒球つき・黒球を握らない・約10分待つ）', url: 'https://www.env.go.jp/content/000119019.pdf' },
      { t: '佐藤計量器製作所 暑さ指数計の取扱説明書（JIS B 7922 クラス2・黒球・周りになじませてから測る）', url: 'https://static.sksato.co.jp/manual/ja/manual_8312-10.pdf' },
    ],
    checked: '2026-11-09',
  },
  tebukuro: {
    t: '切れにくい手袋',
    kw: ['耐切創 手袋'],
    must: ['耐切創', '切れにくい'],
    ng: ['子供用'],
    why: '飲食店でけがをして4日以上休んだ人のうち、切れ・こすれは1,061人で転倒の次に多い（令和7年）。6月の掲示の決まりは「包丁の作業は切れにくい手袋で」',
    theme: 'te',
    month: 6,
    points: [
      '耐切創レベル（A〜Fなど）の表示を見て、使う刃物に合う強さを選ぶ',
      'ミキサーやボール盤など回る機械の作業では使わない。手袋ごと巻き込まれる',
      '細かい作業には、薄手の物（ゲージの数が大きい物）が向く',
    ],
    src: [
      { t: 'パナソニック 耐切創手袋 比較表（耐切創レベル A〜F・EN388：2016 と JIS T 8052・細かい作業はゲージ数の大きい物）', url: 'https://panasonic.jp/gloves/comparison.html' },
      { t: 'パナソニック 耐切創手袋とは（レベルの数が大きいほど強い・ゲージ数が大きいほど細かい作業向け）', url: 'https://www2.panasonic.biz/jp/terasu/skill/dictionary/cutresistant.html' },
      { t: 'ハネウェル 耐切創手袋（用途に合う耐切創性のレベルを選ぶ・ゲージ）', url: 'https://automation.honeywell.com/jp/ja/products/personal-protective-equipment/hand-protection/gloves/cut-resistant-gloves' },
      { t: '横須賀労働基準監督署 切創防止用手袋のリーフレット（佐賀労働局の掲載。包丁などの手工具に・ミキサーなど回る機械では巻き込まれるので使わない）', url: 'https://jsite.mhlw.go.jp/saga-roudoukyoku/content/contents/000551508.pdf' },
      { t: '岐阜労働局の掲載資料 製造業で実際に発生した重篤な労働災害事例集（回る刃物では軍手もふくめ手袋は禁止 安衛則第111条）', url: 'https://jsite.mhlw.go.jp/gifu-roudoukyoku/content/contents/002279169.pdf' },
    ],
    checked: '2026-11-09',
  },
  horeizai: {
    t: '保冷剤とクーラーボックス',
    kw: ['保冷剤 クーラーボックス'],
    must: ['保冷剤', 'クーラーボックス'],
    ng: ['ペット'],
    why: '熱中症は7月がいちばん多く、令和7年は7月だけで718人が4日以上休むか亡くなった。見つけたら水と風で冷やし、首やわきの下も冷やす',
    theme: 'necchu-taiou',
    month: 7,
    points: [
      '首のまわり・わきの下・足の付け根に当てられる数と大きさがあるか',
      '保冷剤のほか、氷や冷たいタオルも合わせて用意する',
      '凍った保冷剤は肌に直接当てず、タオルを巻いて当てる。同じ所に長く当てない',
    ],
    src: [
      { t: '厚生労働省 熱中症予防の普及啓発・注意喚起について（平成30年7月の事務連絡。保冷剤・氷・冷たいタオルで体を冷やす・首のまわり、わきの下、足の付け根）', url: 'https://www.mhlw.go.jp/content/000335769.pdf' },
      { t: '厚生労働省 熱中症予防の普及啓発・注意喚起について（平成28年5月の事務連絡。新潟労働局の掲載。保冷剤・氷・冷たいタオル・首のまわり、わきの下、足の付け根）', url: 'https://jsite.mhlw.go.jp/niigata-roudoukyoku/content/contents/000069763_280518necchushouyobou.pdf' },
      { t: '東京都生活文化局 保冷剤での凍傷に注意！（タオルを巻いて地肌に直接ふれないように・同じ所に長く当てない）', url: 'https://www.shouhiseikatu.metro.tokyo.lg.jp/attention/documents/kigaihoreizaiinsatuyou.pdf' },
      { t: '三重化学工業 冷却用ジェルの取扱説明書（冷やした物を直接肌に当てると凍傷のおそれ・タオルなどで冷たさを調整）', url: 'https://www.matsuyoshi.co.jp/assets/pdf/manual/man_00886021.pdf' },
    ],
    checked: '2026-11-09',
  },
  konsento: {
    t: 'コンセントのほこりよけカバー',
    kw: ['コンセント カバー ほこり'],
    must: ['コンセント'],
    ng: ['ベビー', '赤ちゃん'],
    why: '電気コードなどによる住宅の火事は、東京消防庁の管内で令和6年に488件と過去10年で最も多い。差しっぱなしのプラグは、ほこりと湿気で火が出ることがある',
    theme: 'kanden',
    month: 8,
    points: [
      '差しっぱなしのプラグの根もとをおおい、ほこりをためないカバーか、トラッキングを防ぐ器具か',
      'カバーを付けても、ときどきプラグを抜いて、ほこりを掃除する',
      '水しぶきがかかる所では、コンセントとプラグがぬれないようにする',
    ],
    src: [
      { t: 'サンワサプライ トラッキング火災を防止（プラグにほこりをためないカバー・使わない差込口にふた・差しっぱなしのプラグの点検と掃除）', url: 'https://www.sanwa.co.jp/seihin_joho/tracking/index.html' },
      { t: '西宮市消防局 トラッキング火災について（プラグのほこりを定期的に掃除・トラッキング防止器具を取り付ける）', url: 'https://www.nishi.or.jp/kurashi/anshin/shobokyoku/kasaiyobo/seihinkasai/tracking.html' },
      { t: 'NITE 製品評価技術基盤機構 テーブルタップからの発火事故（差しっぱなしのプラグにほこり・こまめに清掃・水滴でぬらさない）', url: 'https://www.nite.go.jp/data/000004226.pdf' },
      { t: '東京都生活文化局 コードやコンセントなどによる火災に注意！（平成31年4月。ほこりや水分でトラッキング・使う時以外は抜く）', url: 'https://www.shouhiseikatu.metro.tokyo.lg.jp/attention/documents/kigaikiken_cord_20190409r2.pdf' },
    ],
    checked: '2026-11-09',
  },
  co2: {
    t: 'CO2モニター',
    kw: ['CO2モニター 二酸化炭素濃度計'],
    must: ['CO2', '二酸化炭素'],
    ng: ['交換用', 'ボンベ'],
    why: '事務作業の部屋の二酸化炭素は5000ppm以下、空調や機械換気の設備が送る空気は1000ppm以下（事務所衛生基準規則）',
    // 10月の掲示・朝礼・やることに CO2モニターとつながる行がないので、月のページにはリンクを出さない（#76 点検の指摘）
    monthLink: false,
    theme: 'kanki',
    month: 10,
    points: [
      '赤外線で測る方式（NDIR）のセンサーか',
      '外の空気で校正できるか。校正していない物は、外で測って415〜450ppmくらいになるか確かめる',
      'ドア・窓・換気口から離し、人から50cm以上離して置く',
    ],
    src: [
      { t: '厚生労働省 二酸化炭素濃度測定器を使用する際の留意点（別添1。NDIR・定期的に校正・外の空気は415〜450ppm程度・ドアや窓から離し人から50cm以上）', url: 'https://www.mhlw.go.jp/content/000968524.pdf' },
      { t: '佐藤計量器製作所 CO2モニターの取扱説明書（NDIR・外の空気で校正・窓や換気口、人の息がかかる所をさける・人から50cm以上）', url: 'https://www.matsuyoshi.co.jp/assets/pdf/manual/man_00886198.pdf' },
    ],
    checked: '2026-11-09',
  },
  shokaki: {
    t: '業務用の消火器',
    kw: ['消火器 業務用'],
    must: ['消火器'],
    ng: ['リサイクル', '引取', 'ケース', '格納箱', '標識'],
    why: '東京消防庁の管内では、令和7年に飲食店の火事が438件、事務所の火事が236件あった。11月は消火器の場所と、前に物がないかを確かめる',
    theme: 'kasai',
    month: 11,
    points: [
      '火事の種類（普通・油・電気）が絵で表示された物か。文字だけの表示は古い規格の物',
      '本体の製造年と使用期限を見る。業務用は製造からおおむね10年',
      '住宅用の消火器は使用期限がおおむね5年で、業務用とは別の物。業務用かを確かめる',
    ],
    src: [
      { t: '仙台市 旧規格消火器はすみやかに交換が必要です（普通・油・電気が文字なら古い規格・絵なら新しい規格・業務用は約10年）', url: 'https://www.city.sendai.jp/yobo-shido/jigyosha/syoukakishikkou.html' },
      { t: '小田原市消防本部 老朽化消火器等の破裂に注意（絵の表示は新しい規格・新しい規格は10年・住宅用は5年）', url: 'https://www.city.odawara.kanagawa.jp/global-image/units/510316/1-20211013091221.pdf' },
      { t: '東京消防庁 東京消防庁に寄せられた都民の声（令和7年2月分。業務用消火器は10年・住宅用は5年・本体に製造年や使用期限）', url: 'https://www.tfd.metro.tokyo.lg.jp/content/000074850.pdf' },
    ],
    checked: '2026-11-09',
  },
  ondo: {
    t: '温湿度計',
    kw: ['温湿度計'],
    must: ['温湿度計'],
    ng: ['ペット', '爬虫類'],
    sokutei: true,
    why: '空調のある事務所の部屋は、18〜28℃・湿度40〜70%が努力義務（事務所衛生基準規則）。朝と午後に見て記録する',
    points: [
      '湿度40〜70%の間の精度（±何%か）が書いてある物か',
      '部屋の中ほど、床から75〜120cmくらいに置く。壁ぎわや角、冷暖房の風が直接あたる所はさける',
      '置いてから正しい値になるまで1時間ほどかかる。置いてすぐの値で決めない',
    ],
    src: [
      { t: '厚生労働省 検討会の資料5 事務室の作業環境測定（事務室の中央部の床上75〜120cm・2か月以内ごと）', url: 'https://www.mhlw.go.jp/content/11201000/000700627.pdf' },
      { t: 'カスタム 温湿度計の取扱説明書（湿度の精度・直射日光と冷暖房の風、壁際や角をさける・約1時間で正しい値）', url: 'https://www.kk-custom.co.jp/dth/pdf/M_CTH-30A.pdf' },
      { t: 'エンペックス気象計 デジタル温度・湿度計の取扱説明書（湿度の精度は40〜70%RHで±5%・約1時間で正しい値）', url: 'https://image.yodobashi.com/etcobject/100000001008219824/M0000012859.pdf' },
    ],
    checked: '2026-11-09',
  },
  shodo: {
    t: '照度計',
    kw: ['照度計'],
    must: ['照度計'],
    ng: ['交換用'],
    sokutei: true,
    why: '事務作業の机の上は300ルクス以上、付随的な事務作業は150ルクス以上（事務所衛生基準規則）。机の上を測って記録する',
    points: [
      'JIS C 1609-1 の級（一般形AA級・A級など）が書いてある物か',
      '受光部（光を受ける所）を本体から離して測れるか。離すと自分の影や服の影響をさけられる',
      '机や作業台の上に、受光部を上に向けて置いて測る',
    ],
    src: [
      { t: 'コニカミノルタ 照度計のカタログ（JIS C 1609-1 一般形AA級・受光部を本体から外せる）', url: 'https://satosokuteiki.com/upload/items/444/lxt10a.pdf' },
      { t: 'HIOKI 照度計のカタログ（JIS C 1609-1 一般形AA級・受光部を離すと人の影や服の影響をさけられる・机の上で測る）', url: 'https://www.satosokuteiki.com/upload/items/2319/ft3424.pdf' },
      { t: '岩崎電気 照度の測定（JIS C 7612。水平面で測る・作業面は机や作業台の上・指定がなければ床上80cm）', url: 'https://www.iwasaki.co.jp/documents/jp/lighting/support/tech-data/calculation/illuminance.pdf' },
    ],
    checked: '2026-11-09',
  },
};

// 月 → その月にそろえる物の key（3月と9月はなし）
export const KAU_MONTH = Object.fromEntries(Object.entries(KAU).filter(([, k]) => k.month).map(([key, k]) => [k.month, key]));

// ページを作る物（points のある物）
export const KAU_READY = Object.entries(KAU).filter(([, k]) => k.points?.length).map(([key, k]) => ({ key, ...k }));
export const kauPath = (key) => `/soroeru/${key}/`;
// その月のページに出す物（ページのある物だけ）
export const kauOfMonth = (m) => {
  const key = KAU_MONTH[m];
  return key && KAU[key].points?.length && KAU[key].monthLink !== false ? { key, ...KAU[key] } : null;
};
