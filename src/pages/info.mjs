// このサイトについて・プライバシーポリシー・免責事項・ページが見つからないとき
// 広告の審査で見られるページ。広告は置かない（noAds）
import { page, esc } from '../layout.mjs';
import { SITE } from '../site.mjs';

const ymd = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
};
const established = () => (SITE.established ? `<p class="doc-date">制定日 ${ymd(SITE.established)}</p>` : '');
const sec = (h, body) => `<section class="doc-sec"><h2>${h}</h2>${body}</section>`;
const ext = (href, text) => `<a href="${href}" rel="noopener">${text}</a>`;

function info(path, h1, description, body) {
  return {
    path,
    html: page({
      title: `${h1}｜${SITE.name}`,
      description,
      path,
      body: `<article class="doc"><h1 class="doc-h">${h1}</h1>${body}${established()}</article>`,
      crumbs: [{ name: h1 }],
      noAds: true,
    }),
  };
}

export default function infoPages() {
  const contact = SITE.contact
    ? sec('お問い合わせ・訂正', `<p>内容のまちがいや、古くなった情報に気づいたときは、${ext(esc(SITE.contact), 'お問い合わせのフォーム')}からお知らせください。確かめて、直したらページの確認日を新しくします。</p>`)
    : '';
  return [
    info(
      '/about/',
      'このサイトについて',
      `${SITE.name}について。どんな人に向けたサイトか、中身の作り方と出典の決まり、広告の扱いを説明します。`,
      `${sec('このサイトでできること', `<p>職場の安全衛生の担当者に向けて、毎月のテーマごとに、掲示・朝礼の文・担当者のやることを業種別にまとめています。掲示はA4で印刷して、そのまま職場に貼れます。</p>
<p>業種は、事務所・店舗、飲食店、製造業、清掃・ビルメンの4つから始めました。清掃・ビルメンの資料や、講習・資格の更新の目安も、順に載せていきます。</p>`)}
${sec('中身の作り方', `<p>厚生労働省、都道府県の労働局、中央労働災害防止協会、職場のあんぜんサイトなど、公的な資料をもとに書いています。数字や事例には、出典のリンクと確認した日をつけています。</p>
<p>資料の文章は写さず、要点を短く言いかえています。公式のポスターやイラストは載せず、リンクで案内します。</p>
<p>専門家の監修は受けていません。法令や運動の最新の内容は、厚生労働省や労働局の公式のページで確かめてください。</p>`)}
${sec('運営と広告', `<p>個人で運営しています。運営のために広告（Google AdSense）を載せることがあります。商品のリンクに楽天アフィリエイトを使うページには、「広告」と書きます。広告があってもなくても、中身や並び順は変えません。</p>`)}
${contact}`,
    ),
    info(
      '/privacy/',
      'プライバシーポリシー',
      `${SITE.name}のプライバシーポリシーです。ブラウザに保存する情報、アクセス解析、広告とアフィリエイト、外部への情報の送信について説明します。`,
      `${sec('ブラウザに保存する情報', `<p>次に開いたときに使うため、次のものをお使いの端末のブラウザの中（localStorage）に保存します。当サイトのサーバーや第三者には送りません。ブラウザのサイトのデータを消すと消えます。</p>
<ul class="doc-ul"><li>えらんだ業種と人数の帯</li><li>法改正の一覧でつけた「うちの職場」の印</li><li>資格の更新の期限でえらんだ資格と、入れた修了証書の日付</li></ul>
<p>掲示に入れた名前は保存しません。ページを閉じると消えます。</p>
<p>「担当者のやること」のチェックは保存しません。ページを閉じると消えます。</p>`)}
${sec('アクセス解析', `<p>サイトの改善のために、Cookieを使わないアクセス解析（Cloudflare Web Analytics）を使うことがあります。集めるのは、見られたページ・参照元・ブラウザの種類などの統計で、個人を特定する情報はふくみません。</p>`)}
${sec('広告', `<p>当サイトは、第三者配信の広告サービス「Google AdSense」を利用しています。</p>
<p>Googleなどの第三者配信事業者は、Cookieを使って、ユーザーが当サイトやほかのサイトに過去にアクセスしたときの情報にもとづいて広告を配信します。Googleは広告のCookieを使うことで、ユーザーが当サイトやほかのサイトにアクセスしたときの情報にもとづいて、Googleやそのパートナーが適切な広告を表示できるようにしています。</p>
<p>パーソナライズ広告は、Googleの${ext('https://adssettings.google.com/', '広告設定')}で無効にできます。また、${ext('https://www.aboutads.info/', 'www.aboutads.info')}で、パーソナライズ広告に使われる第三者配信事業者のCookieを無効にできます。</p>
<p>Googleによる広告でのCookieの使い方は、${ext('https://policies.google.com/technologies/ads?hl=ja', 'Googleの広告に関するページ')}をご覧ください。</p>`)}
${sec('アフィリエイト', `<p>当サイトは、楽天アフィリエイトを利用することがあります。商品のリンクから楽天市場に移ると、楽天グループのCookieが使われることがあります。くわしくは${ext('https://privacy.rakuten.co.jp/', '楽天グループのプライバシーポリシー')}をご覧ください。</p>`)}
${sec('外部への情報の送信', `<p>当サイトのページを開くと、次の会社にお使いの端末の情報が送られることがあります。</p>
<table class="doc-tbl"><thead><tr><th>送り先</th><th>送る情報</th><th>使い方</th></tr></thead><tbody>
<tr><td>Google LLC（Google AdSense）</td><td>Cookieの識別子、見たページのURL、IPアドレス、ブラウザの種類</td><td>広告の表示と効果の測定</td></tr>
<tr><td>Cloudflare, Inc.（Cloudflare Web Analytics を使うとき）</td><td>見たページのURL、参照元、ブラウザの種類</td><td>アクセスの集計</td></tr>
</tbody></table>`)}
${sec('このポリシーの変更', `<p>必要に応じて変更することがあります。変更したときは、このページでお知らせします。</p>`)}
${contact}`,
    ),
    info(
      '/disclaimer/',
      '免責事項',
      `${SITE.name}の免責事項です。掲載している情報の扱い、掲示と朝礼の文の使い方、リンク先について説明します。`,
      `${sec('掲載している情報', `<p>正確になるよう努めていますが、正しさや新しさを保証するものではありません。法令や運動の内容は変わることがあります。大切な判断の前には、厚生労働省や労働局の公式の情報を確かめてください。</p>
<p>当サイトの情報を使ったことで生じた損害について、当サイトは責任を負いかねます。</p>`)}
${sec('掲示と朝礼の文の使い方', `<p>掲示と朝礼の文は、職場の安全衛生の活動のために、印刷したり読み上げたりして使えます。ほかのサイトへの転載や、販売はお断りします。</p>`)}
${sec('リンク先', `<p>当サイトからリンクしているほかのサイトの内容について、当サイトは責任を負いません。</p>`)}`,
    ),
    {
      path: '/404',
      file: '404.html',
      html: page({
        title: `ページが見つかりません｜${SITE.name}`,
        description: 'お探しのページは見つかりませんでした。トップページから、今月の安全衛生のテーマと業種をえらんでください。',
        path: '/404',
        body: `<article class="doc"><h1 class="doc-h">ページが見つかりません</h1><p><a href="/">トップページへ</a></p></article>`,
        noAds: true,
        noindex: true,
      }),
    },
  ];
}
