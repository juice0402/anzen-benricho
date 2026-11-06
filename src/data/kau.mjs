// そろえる物（買う理由・その1。#66）：物ごとのページ /soroeru/<key>/ と、月のページの「今月そろえる物」
// 楽天市場の商品は物のページだけに出す（取り方は src/rakuten.mjs・scripts/fetch-rakuten.mjs）
// 形：key → { t: 物の名前, kw: [さがす言葉], must: [商品名にどれかが入る], ng: [入っていたら外す], why, theme, month, points: [選ぶときに見る所×3], src: [{ t, url }], checked }
//   測る道具は month と theme の代わりに sokutei: true（why は記録帳の言い方）
//   points がない物は、ページも月のリンクも出さない（次の項目「そろえる物のページの残り」で足す）
// 決まり：why の数字は、そのテーマのデータ（memo・多いけが・note）にある数字だけ。points は公的な資料かメーカーの取扱説明書・カタログで2つ以上一致したことだけ
//   機種の名前・くらべ・順位は書かない。おすすめ・お得・最安・今すぐ を使わない。吐いた物の処理セットは病気を防ぐ・治すと書かない（備えの道具）
// 2026-11-06：台車は2社の取扱説明書（耐荷重をこえない・偏らせない・はみ出さない・腰の高さ以上に積まない）、
//   すべり止めマットは新見署・彦根署・広島北署・亀戸署・茨城局の資料、吐いた物の処理セットは川崎市・大阪府・厚労省の資料（12月のテーマと同じ）で書いた

export const KAU = {
  hakimono: {
    t: '吐いた物の処理セット',
    // 11/6 PR #67：1つ目の言葉だけでは条件に合うものが1件だったので、言葉を1つ足し、must に「吐物」を足した
    kw: ['嘔吐物処理セット', '汚物処理キット', 'ノロウイルス 処理セット'],
    must: ['嘔吐', 'おう吐', '吐物', '汚物処理'],
    // 人とペットの両方に使える処理セットが多いので、ペットは外す言葉に入れない（11/6 PR #67）
    ng: ['詰め替え', '詰替', 'ペット用', '犬用', '猫用'],
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
  // ここから下は、さがす言葉だけ先に入れたもの（points を足したらページと月のリンクが出る）
  dansa: { t: '階段の段を見やすくするテープ', kw: ['階段 滑り止め テープ'], must: ['テープ'], ng: ['ペット', '犬', '猫'], theme: 'kourei', month: 4 },
  wbgt: { t: '暑さ指数（WBGT）計', kw: ['WBGT 熱中症 計'], must: ['WBGT', '暑さ指数'], ng: ['交換用', '電池のみ'], theme: 'necchu', month: 5 },
  tebukuro: { t: '切れにくい手袋', kw: ['耐切創 手袋'], must: ['耐切創', '切れにくい'], ng: ['子供用'], theme: 'te', month: 6 },
  horeizai: { t: '保冷剤とクーラーボックス', kw: ['保冷剤 クーラーボックス'], must: ['保冷剤', 'クーラーボックス'], ng: ['ペット'], theme: 'necchu-taiou', month: 7 },
  konsento: { t: 'コンセントのほこりよけカバー', kw: ['コンセント カバー ほこり'], must: ['コンセント'], ng: ['ベビー', '赤ちゃん'], theme: 'kanden', month: 8 },
  co2: { t: 'CO2モニター', kw: ['CO2モニター 二酸化炭素濃度計'], must: ['CO2', '二酸化炭素'], ng: ['交換用', 'ボンベ'], theme: 'kanki', month: 10 },
  shokaki: { t: '業務用の消火器', kw: ['消火器 業務用'], must: ['消火器'], ng: ['リサイクル', '引取', 'ケース', '格納箱', '標識'], theme: 'kasai', month: 11 },
  ondo: { t: '温湿度計', kw: ['温湿度計'], must: ['温湿度計'], ng: ['ペット', '爬虫類'], sokutei: true },
  shodo: { t: '照度計', kw: ['照度計'], must: ['照度計'], ng: ['交換用'], sokutei: true },
};

// 月 → その月にそろえる物の key（3月と9月はなし）
export const KAU_MONTH = Object.fromEntries(Object.entries(KAU).filter(([, k]) => k.month).map(([key, k]) => [k.month, key]));

// ページを作る物（points のある物）
export const KAU_READY = Object.entries(KAU).filter(([, k]) => k.points?.length).map(([key, k]) => ({ key, ...k }));
export const kauPath = (key) => `/soroeru/${key}/`;
// その月のページに出す物（ページのある物だけ）
export const kauOfMonth = (m) => {
  const key = KAU_MONTH[m];
  return key && KAU[key].points?.length ? { key, ...KAU[key] } : null;
};
