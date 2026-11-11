// 法人パック（#82）：Pages Functions はこのファイルだけ。動くのは /pack/ の下だけ（dist/_routes.json。/pack/ そのものは外す）
//   /pack/open/?s=<セッションID>   支払いのあと Stripe から戻る所。確かめて /pack/<月>/?s=<セッションID> へ
//   /pack/<YYYY-MM>/?s=<セッションID>  毎回 Stripe に確かめ、よければ静的なページ。だめなら /pack/?e=1
//   /pack/ の下のほかの URL（月の形に合わないもの）も /pack/?e=1。URL の種類はデコードした pathname で決める（src/pack-check.mjs の packRoute）
// 鍵は Cloudflare の秘密の設定（STRIPE_KEY・STRIPE_TEST_KEY）。セッションの中身・鍵はログに出さない・残さない
import { PACK } from '../../src/data/pack.mjs';
import { checkPack, packRoute } from '../../src/pack-check.mjs';

const NO_STORE = 'private, no-store';
const go = (url, to) => new Response(null, { status: 302, headers: { Location: new URL(to, url).toString(), 'Cache-Control': NO_STORE, 'Referrer-Policy': 'no-referrer' } });
const NG = '/pack/?e=1';
// その月のページがあるか（作っていない号は開けない）
const hasPage = async (env, url, month) => {
  try {
    const r = await env.ASSETS.fetch(new URL(`/pack/${month}/`, url));
    return r.status === 200;
  } catch {
    return false;
  }
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const s = url.searchParams.get('s') || '';
  const route = packRoute(url.pathname);
  if (route.kind === 'sale') return context.next();
  if (route.kind === 'bad') return go(url, NG);
  const r = await checkPack({ id: s, month: route.kind === 'month' ? route.month : null, env, pack: PACK, fetch });
  if (!r.ok || !(await hasPage(env, url, r.month))) return go(url, NG);
  if (route.kind === 'open') return go(url, `/pack/${r.month}/?s=${encodeURIComponent(s)}`);
  const res = await context.next();
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', NO_STORE);
  out.headers.set('Referrer-Policy', 'no-referrer');
  out.headers.set('X-Robots-Tag', 'noindex');
  return out;
}
