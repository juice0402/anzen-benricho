// 法人パック（#82）：Pages Functions はこのファイルだけ。動くのは /pack/ の下だけ（dist/_routes.json。/pack/ そのものは外す）
//   /pack/open/?s=<セッションID>   支払いのあと Stripe から戻る所。確かめて /pack/<月>/?s=<セッションID> へ
//   /pack/<YYYY-MM>/?s=<セッションID>  毎回 Stripe に確かめ、よければ静的なページ。だめなら /pack/?e=1
// 鍵は Cloudflare の秘密の設定（STRIPE_KEY・STRIPE_TEST_KEY）。セッションの中身・鍵はログに出さない・残さない
import { PACK } from '../../src/data/pack.mjs';
import { checkPack } from '../../src/pack-check.mjs';

const NO_STORE = 'private, no-store';
const go = (url, to) => new Response(null, { status: 302, headers: { Location: new URL(to, url).toString(), 'Cache-Control': NO_STORE, 'Referrer-Policy': 'no-referrer' } });

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const s = url.searchParams.get('s') || '';
  if (/^\/pack\/open\/?$/.test(url.pathname)) {
    const r = await checkPack({ id: s, env, pack: PACK, fetch });
    return go(url, r.ok ? `/pack/${r.month}/?s=${encodeURIComponent(s)}` : '/pack/?e=1');
  }
  const m = /^\/pack\/(\d{4}-\d{2})\/(index\.html)?$/.exec(url.pathname);
  if (!m) return context.next();
  const r = await checkPack({ id: s, month: m[1], env, pack: PACK, fetch });
  if (!r.ok) return go(url, '/pack/?e=1');
  const res = await context.next();
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', NO_STORE);
  out.headers.set('Referrer-Policy', 'no-referrer');
  out.headers.set('X-Robots-Tag', 'noindex');
  return out;
}
