// このテーマを深く（C-027 案B「テーマの道」・11/12 しょーくん。#100）
// 「あわせて見る」に並べるリンクと、その理由の1行（d。全角30字まで。リンクの先に何があるかを書く）
//   THEME_KANREN：テーマの slug → [{ href, t, d }]。同じテーマのほかの月（組は両方向）と、そのテーマで使う道具・知識のページ
//     テーマの入口の href（/anzen/theme/<slug>/）は、業種のページでは同じ業種のページに読みかえる（theme.mjs）
//     組のないテーマ・掲示とやることに道具が出てこないテーマには足さない
//   KOUSHIN_KANREN：資格の更新のページの key（kantoku・byouin・bouka）→ 同じ形
//   d はどの業種のページにも出るので、業種によらない言い方にする
//   relD：テーマと資格のデータの related（法改正など）に付ける理由の1行。法改正は施行日と義務の区別から作る
import { HOUREI, houreiPath, fmtDate } from './hourei.mjs';

const KOUREI = { href: '/anzen/theme/kourei/', t: '4月 高年齢の人の安全' };
const TENTOU = { href: '/anzen/theme/tentou/', t: '1月 冬の転倒' };
const NECCHU = { href: '/anzen/theme/necchu/', t: '5月 熱中症の準備' };
const TAIOU = { href: '/anzen/theme/necchu-taiou/', t: '7月 熱中症を見つけたら' };
const KANDEN = { href: '/anzen/theme/kanden/', t: '8月 夏の感電と電気の火事' };
const KASAI = { href: '/anzen/theme/kasai/', t: '11月 職場の火事に備える' };
const KOKORO = { href: '/anzen/theme/kokoro/', t: '3月 心の健康' };
const KAROU = { href: '/anzen/theme/karou/', t: '11月 働きすぎを防ぐ' };
const HARASS = { href: '/anzen/theme/harassment/', t: '12月 ハラスメントとカスハラ' };
const KANSEN = { href: '/anzen/theme/kansen/', t: '12月 冬の感染症' };
const KANKI = { href: '/anzen/theme/kanki/', t: '10月 職場の空気と換気' };
const ISSANKA = { href: '/anzen/theme/issanka/', t: '1月 暖房と一酸化炭素' };
const SOKUTEI = { href: '/kihon/sokutei/', t: '職場を測る記録帳' };
const MAZENAI = { href: '/kagaku/mazenai/', t: 'この2つの洗剤、まぜると危ない？' };

export const THEME_KANREN = {
  tentou: [
    { ...KOUREI, d: '転倒は高年齢の人に多い' },
    { href: '/kihon/hiyari/', t: 'ヒヤリハット報告の用紙と書き方', d: 'すべった・つまずいたを書いて残す' },
    { href: '/kihon/ky/', t: 'KY活動のやり方とシート', d: '作業の前に、すべりそうな所を出し合う' },
  ],
  kourei: [{ ...TENTOU, d: '高年齢の人に多い転倒を、冬の床で防ぐ' }],
  necchu: [
    { ...TAIOU, d: '準備のあと、見つけたときの冷やし方' },
    { ...SOKUTEI, d: 'WBGT を測って残す' },
  ],
  'necchu-taiou': [
    { ...NECCHU, d: '見つける前の準備。暑い日の働き方' },
    { ...SOKUTEI, d: 'WBGT を測って残す' },
  ],
  kanden: [{ ...KASAI, d: '電気からの火事。火元と避難の通路' }],
  kasai: [{ ...KANDEN, d: '電気からの火事。プラグとコードの決まり' }],
  kokoro: [
    { ...KAROU, d: '心の健康につながる。労働時間と医師の面接' },
    { ...HARASS, d: '心の健康につながる。ハラスメントを防ぐ決まり' },
  ],
  karou: [
    { ...KOKORO, d: '心の健康につながる。眠れないときの相談先' },
    { ...HARASS, d: '心の健康につながる。ハラスメントを防ぐ決まり' },
  ],
  harassment: [
    { ...KOKORO, d: '心の健康につながる。眠れない日が続いたら' },
    { ...KAROU, d: '心の健康につながる。労働時間と医師の面接' },
  ],
  kansen: [
    { ...KANKI, d: '換気で感染を減らす。換気のしかた' },
    { ...MAZENAI, d: '塩素系の消毒液と酸性の洗剤をまぜない' },
  ],
  kanki: [
    { ...KANSEN, d: '換気で感染を減らす。冬の感染症への備え' },
    { ...ISSANKA, d: '一酸化炭素も換気で防ぐ' },
    { ...SOKUTEI, d: 'CO2 を測って残す' },
  ],
  issanka: [{ ...KANKI, d: '換気。職場の空気の決まり' }],
  oosouji: [{ ...MAZENAI, d: '洗剤を2つ使う前に' }],
};

const BYOUIN = { href: '/shikaku/koushin/byouin/', t: '病院清掃受託責任者の再講習' };
const KANTOKU = { href: '/shikaku/koushin/kantoku/', t: '清掃作業監督者の再講習' };
export const KOUSHIN_KANREN = {
  kantoku: [{ ...BYOUIN, d: '同じ全国ビルメンテナンス協会の再講習' }],
  byouin: [
    { ...KANTOKU, d: '同じ全国ビルメンテナンス協会の再講習' },
    { href: '/anzen/theme/kansen/seisou/', t: '清掃・ビルメンの冬の感染症', d: 'おう吐物の処理' },
  ],
  bouka: [{ ...KASAI, d: '防火管理者が月のテーマで話すこと' }],
};

// 同じページへのリンクかを見る印：テーマはどの業種のページでも slug でそろえる
export const relKey = (href) => {
  const m = href.match(/^\/anzen\/theme\/([^/]+)\//);
  return m ? `theme:${m[1]}` : href;
};

// related の理由の1行（印 relKey → d）
const D = {
  'theme:kasai': '火元と避難の通路の決まり',
  'theme:necchu-taiou': '見つけたときの冷やし方',
  'theme:kenshin': '要再検査を受けて、結果を出す',
  'theme:kokoro': '眠れない日が続いたときの相談先',
  'theme:kanden': '感電と、電気からの火事',
  'theme:harassment': '困ったときの相談窓口',
  'theme:tentou': '冬の床で転ばない',
  'theme:youtsu': '重い物の運び方と姿勢',
  'theme:necchu': '暑い日の働き方と休み方',
  'theme:shinjin': '新しく入った人に最初に教える決まり',
  'theme:oosouji': '年末の大掃除のけがを防ぐ',
  'theme:kansen': '冬の感染症への備え',
  'theme:kanki': '換気と職場の空気',
  '/kihon/junshi/': '衛生管理者は毎週1回、産業医は原則毎月1回',
  '/kihon/sokutei/': '測った数を基準とくらべて残す',
  '/kagaku/sds/': '2・4・7・8・15項を見る',
  '/kihon/ninzu/': '10人で推進者、50人で衛生管理者と産業医',
  '/kihon/nyusha/': '雇い入れたら全員に安全衛生教育',
  '/kihon/hozon/': '議事録は3年、健康診断の記録は5年',
  '/shikaku/tokubetsu/': '危険・有害な業務につかせる前の教育',
  '/anzen/nenkan/': '安全週間は7月、労働衛生週間は10月',
  '/kihon/ky/': '作業の前に危険を出し合い、対策を1つ決める',
  '/kihon/hiyari/': '何が起きそうだったかを書いて出す',
  '/kihon/shishobyo/': '休業4日以上は遅滞なく、1〜3日は3か月ごと',
  '/kagaku/mazenai/': '塩素系と酸性の洗剤をまぜない',
  '/kagaku/': 'SDS・化学物質管理者・リスクアセスメント',
  '/shikaku/kigen/': '推進者講習や特別教育に有効期限はない',
  '/shikaku/koushin/': '4つの資格の次の期限を出す',
  '/shikaku/koushin/byouin/': '4年ごと。全国ビルメンテナンス協会の再講習',
  '/shikaku/koushin/kantoku/': '6年ごと。全国ビルメンテナンス協会の再講習',
};
for (const h of HOUREI) D[houreiPath(h)] = `${fmtDate(h.date)}から・${h.kind}`;
export const relD = (href) => D[relKey(href)] || '';

// 姉妹サイトのサクッと計算（parts.mjs の SAKUTTO_SEISOU・SAKUTTO_GENBA）
export const SAKUTTO_D = { seisou: '面積と人数から、何時間かかるか', genba: '清掃の現場の時間割と作業計画書' };
export const MAX_KANREN = 5;
