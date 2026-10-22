// 法改正の一覧（施行日の順）。2026-10-22 に厚生労働省・労働局・都道府県の資料で確かめたもの
// kind は「義務」か「努力義務」。cond は「うちの職場」の印（null はすべての事業者に関係する）
// 施行日を過ぎたかどうかは、作り直した日でページが決める（毎月1日に作り直す）

export const HOUREI_CHECKED = '2026-10-22';

// 「うちの職場」の印。印をつけると、あてはまらない改正を一覧から隠す
export const CONDS = [
  { key: 'small', label: '働く人が50人未満' },
  { key: 'elder', label: '高年齢の人が働いている' },
  { key: 'heat', label: '暑い場所での作業がある' },
  { key: 'free', label: '一人親方などと同じ場所で働く' },
];

const AN_EIHOU = { t: '厚生労働省 労働安全衛生法及び作業環境測定法の一部を改正する法律（令和7年法律第33号）', u: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/an-eihou/index_00001.html' };
const POINTS = { t: '厚生労働省 労働安全衛生法及び作業環境測定法 改正の主なポイントについて（リーフレット）', u: 'https://www.mhlw.go.jp/content/11300000/001513749.pdf' };

export const HOUREI = [
  {
    slug: 'necchusho',
    date: '2025-06-01',
    title: '熱中症の報告の体制と手順',
    kind: '義務',
    cond: 'heat',
    whoShort: '暑い場所での作業がある職場',
    who: '暑い場所での作業がある事業者（WBGT 28度以上か気温31度以上の場所で、1時間以上続くか、1日4時間をこえる作業）',
    change: [
      '熱中症の症状がある人や、そのおそれがある人を見つけたときに、報告できる体制をつくる。',
      '作業から離す・体を冷やす・医師にみせるなどの手順を決め、作業する人に知らせる。',
    ],
    todo: [
      '熱中症のおそれがある人を見つけたら、だれに伝えるかを決める',
      '作業から離す・体を冷やす・病院へ運ぶまでの手順を決める',
      '決めた体制と手順を、作業する人に知らせる',
    ],
    src: [{ t: '秋田労働局 職場における熱中症対策が強化されました！（労働安全衛生規則の改正）', u: 'https://jsite.mhlw.go.jp/akita-roudoukyoku/newpage_02520.html' }],
  },
  {
    slug: 'koureisha',
    date: '2026-04-01',
    title: '高年齢の人の労働災害を防ぐ',
    kind: '努力義務',
    cond: 'elder',
    whoShort: '高年齢の人が働く職場',
    who: '高年齢の人が働く事業者',
    change: [
      '高年齢の人の体の変化に合わせて、作業する場所の改善や作業のやり方の見直しをすることが、事業者の努力義務になった。',
      '国が「高年齢者の労働災害防止のための指針（エイジフレンドリー指針）」を出している。',
    ],
    todo: [
      '階段の手すりや段差など、転びやすい所を設備で直す',
      '体力チェックを続けて行い、結果を作業の割りふりに生かす',
      'はじめての作業につく人には、ていねいに教える',
    ],
    src: [POINTS, { t: '厚生労働省 高年齢者の労働災害防止のための指針（エイジフレンドリー指針）リーフレット（令和8年6月）', u: 'https://www.mhlw.go.jp/content/11300000/001702280.pdf' }],
  },
  {
    slug: 'ryouritsu',
    date: '2026-04-01',
    title: '治療と仕事の両立支援',
    kind: '努力義務',
    cond: null,
    whoShort: 'すべての事業主',
    who: 'すべての事業主',
    change: [
      '病気の治療をしながら働く人を支えることが、事業主の努力義務になった（改正労働施策総合推進法）。',
      '国が「治療と就業の両立支援指針」（令和8年厚生労働省告示第28号）を出している。',
    ],
    todo: [
      '病気になっても働き続けられるよう支える、という方針を伝える',
      '相談の窓口をだれにするか決めて、働く人に知らせる',
      '時間単位の有給休暇や短時間勤務など、休み方と働き方の制度を見直す',
    ],
    src: [
      { t: '高知労働局 治療と就業の両立支援が努力義務になります！', u: 'https://jsite.mhlw.go.jp/kochi-roudoukyoku/newpage_01102.html' },
      { t: '神奈川県 病気を抱える労働者の治療と就業の両立支援が努力義務となりました', u: 'https://www.pref.kanagawa.jp/docs/nf5/chiryoutoshigotoryouritushien.html' },
    ],
  },
  {
    slug: 'kasuhara',
    date: '2026-10-01',
    title: 'カスハラと求職者へのセクハラの防止',
    kind: '義務',
    cond: null,
    whoShort: 'すべての事業主',
    who: 'すべての事業主',
    change: [
      'お客さんや取引先などからのハラスメント（カスハラ）から働く人を守るための措置が、事業主の義務になった。',
      '仕事を探している人（求職者）へのセクハラを防ぐ措置も、事業主の義務になった。',
    ],
    todo: [
      'カスハラには毅然と対応して働く人を守る、という方針を決めて知らせる',
      '相談の窓口を決め、相談を受ける人が対応できるようにしておく',
      '特に悪質なカスハラのときの対応を、前もって決めておく',
    ],
    src: [
      { t: '厚生労働省 職場におけるハラスメントの防止のために', u: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyoukintou/seisaku06/index.html' },
      { t: '神奈川労働局 カスタマーハラスメント対策企業マニュアル（令和8年度改訂版・厚生労働省委託事業）', u: 'https://jsite.mhlw.go.jp/kanagawa-roudoukyoku/content/contents/002821822.pdf' },
    ],
  },
  {
    slug: 'kojin-houkoku',
    date: '2027-01-01',
    title: '個人事業者等の業務上災害の報告',
    kind: '義務',
    cond: 'free',
    whoShort: '一人親方などと同じ場所で働く職場',
    who: '一人親方などに仕事を頼み、同じ場所で自分も仕事をする注文者など',
    change: [
      '同じ場所で働く一人親方などが、仕事で亡くなったり4日以上休んだりしたときは、注文者などが労働基準監督署に報告する。',
      '報告は電子申請が原則。罰則はない。',
    ],
    todo: [
      '同じ場所で働く一人親方・フリーランスがいるか確かめる',
      'けがや病気で休んだときは知らせてもらうよう、前もって伝える',
      '労働基準監督署への報告のしかた（電子申請）を確かめる',
    ],
    src: [
      { t: '厚生労働省 個人事業者等の業務上災害の報告に係る省令の施行について（令和8年6月24日 基発0624第5号）', u: 'https://www.mhlw.go.jp/content/11300000/001713372.pdf' },
      AN_EIHOU,
    ],
  },
  {
    slug: 'kojin-sochi',
    date: '2027-04-01',
    title: '個人事業者等の安全衛生の義務',
    kind: '義務',
    cond: 'free',
    whoShort: '一人親方などと同じ場所で働く職場',
    who: '労働者と同じ場所で働く一人親方など、元方事業者、機械を貸す事業者',
    change: [
      '労働者と同じ場所で働く一人親方なども、決まりを満たさない機械を使わない、危ない業務の前に安全衛生教育を受ける、などが義務になる。',
      '元方事業者の指導や連絡・調整は、一人親方なども含めて行う。',
    ],
    todo: [
      '同じ場所で働く一人親方・フリーランスに、4月からの決まりを伝える',
      '元方事業者は、連絡・調整の場に一人親方なども入ってもらう',
      '危ない業務を頼むときは、安全衛生教育を受けたか確かめる',
    ],
    src: [POINTS, AN_EIHOU],
  },
  {
    slug: 'stress-check',
    date: '2028-04-01',
    title: '50人未満の職場もストレスチェックが義務',
    kind: '義務',
    cond: 'small',
    whoShort: '働く人が50人未満の職場',
    who: '働く人が50人未満の事業者（これまでは努力義務）',
    change: [
      '50人未満の職場も、1年に1回のストレスチェックと、ストレスが高い人への医師の面接指導が義務になる。',
      '厚生労働省が、小さな職場向けの実施マニュアルを出している。',
    ],
    todo: [
      '厚生労働省の小規模事業場向けの実施マニュアルを読む',
      '産業保健総合支援センターの無料の支援（相談・訪問）を調べる',
      'だれが実施するか（医師・保健師など）と、職場の担当を決める',
    ],
    src: [
      { t: '厚生労働省 労働者数50人未満の事業者もストレスチェックが義務になります！（リーフレット）', u: 'https://www.mhlw.go.jp/content/11300000/001679776.pdf' },
      { t: '徳島労働局 ストレスチェック', u: 'https://jsite.mhlw.go.jp/tokushima-roudoukyoku/hourei_seido_tetsuzuki/anzen_eisei/newpage_02102.html' },
    ],
  },
];

export const houreiPath = (h) => `/hourei/${h.slug}/`;
export const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
};
// 今日（日本時間）の YYYY-MM-DD
export const todayJst = (now = new Date()) => new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10);
// 施行日を過ぎたか
export const inForce = (h, today = todayJst()) => h.date <= today;
// トップに出す「次の改正」：まだ施行されていないうち、いちばん近いもの
export const nextKaisei = (today = todayJst()) => HOUREI.filter((h) => !inForce(h, today)).sort((a, b) => a.date.localeCompare(b.date))[0];
