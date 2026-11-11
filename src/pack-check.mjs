// 法人パックの支払いを Stripe に確かめる（#82）。Pages Functions（functions/pack/_middleware.js）とテスト（tests/pack.test.mjs）で使う
// node: の部品・process.env を使わない（Cloudflare の関数で動く）。fetch は引数で渡す（テストで Stripe の代わりを入れる）
// 確かめたセッションの中身（メール・名前など）は返さず、どこにも残さない。返すのは「よい・だめ」と、よいときの月だけ

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
// Stripe のセッション ID（cs_live_… / cs_test_…）。ほかの形は Stripe に聞かずにだめにする
const SESSION_RE = /^cs_(live|test)_[A-Za-z0-9]{10,250}$/;

// Functions を通る URL（dist/_routes.json）。/pack/ の売るページとほかのページは通らない
export const PACK_ROUTES = { version: 1, include: ['/pack/*'], exclude: ['/pack/'] };

// /pack/ の下の URL の種類（デコードした pathname で決める。%2D などで月の確かめをすり抜けないように）
//   sale：/pack/ の売るページ。open：支払いのあとに戻る所。month：月のページ（YYYY-MM）。bad：ほか（開けない）
export function packRoute(pathname) {
  let p;
  try { p = decodeURIComponent(pathname); } catch { return { kind: 'bad' }; }
  if (/^\/pack\/(index\.html)?$/.test(p)) return { kind: 'sale' };
  if (/^\/pack\/open\/?$/.test(p)) return { kind: 'open' };
  const m = /^\/pack\/(\d{4}-\d{2})(\/(index\.html)?)?$/.exec(p);
  if (m && MONTH_RE.test(m[1])) return { kind: 'month', month: m[1] };
  return { kind: 'bad' };
}

export const packRef = (month) => `pack-${month}`;

// id：?s= の値。month：ページの月（YYYY-MM）。/pack/open/ では null（月はセッションから取る）
// env：Cloudflare の秘密の設定（STRIPE_KEY・STRIPE_TEST_KEY）。pack：src/data/pack.mjs の PACK
export async function checkPack({ id, month = null, env = {}, pack, fetch: f }) {
  const m = SESSION_RE.exec(id || '');
  if (!m) return { ok: false, why: 'id' };
  const live = m[1] === 'live';
  const key = live ? env.STRIPE_KEY : env.STRIPE_TEST_KEY;
  if (!key) return { ok: false, why: 'key' };
  const linkId = live ? pack.linkId : pack.testLinkId;
  if (!linkId) return { ok: false, why: 'link' };
  if (month !== null && !MONTH_RE.test(month)) return { ok: false, why: 'month' };
  let s;
  try {
    const res = await f(`https://api.stripe.com/v1/checkout/sessions/${id}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) return { ok: false, why: 'stripe' };
    s = await res.json();
  } catch {
    return { ok: false, why: 'stripe' };
  }
  if (!s || typeof s !== 'object') return { ok: false, why: 'stripe' };
  if (s.id !== id || s.livemode !== live) return { ok: false, why: 'mode' };
  if (s.status !== 'complete' || s.payment_status !== 'paid') return { ok: false, why: 'unpaid' };
  if (s.currency !== 'jpy' || s.amount_total !== pack.price) return { ok: false, why: 'amount' };
  if (s.payment_link !== linkId) return { ok: false, why: 'link' };
  const ref = /^pack-(\d{4}-\d{2})$/.exec(s.client_reference_id || '');
  if (!ref || !MONTH_RE.test(ref[1]) || ref[1] < pack.first) return { ok: false, why: 'month' };
  if (month !== null && ref[1] !== month) return { ok: false, why: 'month' };
  return { ok: true, month: ref[1] };
}
