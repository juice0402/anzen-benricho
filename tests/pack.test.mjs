// 法人パック（#82）：Stripe のセッションの確かめ方と、売る号・月のページの号
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPack, packRef, PACK_ROUTES } from '../src/pack-check.mjs';
import { PACK } from '../src/data/pack.mjs';
import { sellMonth, packMonths, buyUrl } from '../src/pages/pack.mjs';

const P = { price: 500, link: 'https://buy.stripe.com/live', linkId: 'plink_live1', testLink: 'https://buy.stripe.com/test', testLinkId: 'plink_test1', first: '2026-12' };
const ENV = { STRIPE_KEY: 'rk_live_x', STRIPE_TEST_KEY: 'rk_test_x' };
const LIVE = 'cs_live_a1B2c3D4e5F6g7';
const TEST = 'cs_test_a1B2c3D4e5F6g7';
const sess = (id, o = {}) => ({ id, livemode: id.startsWith('cs_live_'), status: 'complete', payment_status: 'paid', currency: 'jpy', amount_total: 500, payment_link: id.startsWith('cs_live_') ? 'plink_live1' : 'plink_test1', client_reference_id: 'pack-2026-12', ...o });
// Stripe の代わり：呼ばれた URL と鍵を覚え、決めた中身を返す
const fake = (body, status = 200) => {
  const calls = [];
  const f = async (url, init) => {
    calls.push({ url, auth: init.headers.Authorization });
    return { ok: status >= 200 && status < 300, json: async () => body };
  };
  f.calls = calls;
  return f;
};
const run = (id, body, o = {}) => checkPack({ id, month: '2026-12', env: ENV, pack: P, fetch: fake(body), ...o });

test('支払い済み・金額・リンク・月がそろえば開く（本番の鍵で Stripe に聞く）', async () => {
  const f = fake(sess(LIVE));
  const r = await checkPack({ id: LIVE, month: '2026-12', env: ENV, pack: P, fetch: f });
  assert.deepEqual(r, { ok: true, month: '2026-12' });
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, `https://api.stripe.com/v1/checkout/sessions/${LIVE}`);
  assert.equal(f.calls[0].auth, 'Bearer rk_live_x');
});

test('テストのセッションはテストの鍵とテストのリンク', async () => {
  const f = fake(sess(TEST));
  const r = await checkPack({ id: TEST, month: '2026-12', env: ENV, pack: P, fetch: f });
  assert.equal(r.ok, true);
  assert.equal(f.calls[0].auth, 'Bearer rk_test_x');
});

test('未払い・期限切れは開かない', async () => {
  assert.equal((await run(LIVE, sess(LIVE, { payment_status: 'unpaid' }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { status: 'open' }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { status: 'expired' }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { payment_status: 'no_payment_required' }))).ok, false);
});

test('金額・通貨がちがうと開かない', async () => {
  assert.equal((await run(LIVE, sess(LIVE, { amount_total: 50000 }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { amount_total: 0 }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { currency: 'usd' }))).ok, false);
});

test('ほかの支払いリンクのセッションは開かない', async () => {
  assert.equal((await run(LIVE, sess(LIVE, { payment_link: 'plink_other' }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { payment_link: null }))).ok, false);
});

test('月がちがう・号の印がないと開かない', async () => {
  assert.equal((await run(LIVE, sess(LIVE, { client_reference_id: 'pack-2027-01' }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { client_reference_id: null }))).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { client_reference_id: 'pack-2026-13' }), { month: null })).ok, false);
  assert.equal((await run(LIVE, sess(LIVE, { client_reference_id: 'pack-2026-11' }), { month: null })).ok, false, '最初の号より前');
  assert.equal((await run(LIVE, sess(LIVE), { month: '2026-1' })).ok, false);
});

test('/pack/open/（月なし）はセッションの号の月を返す', async () => {
  const r = await run(LIVE, sess(LIVE, { client_reference_id: 'pack-2027-03' }), { month: null });
  assert.deepEqual(r, { ok: true, month: '2027-03' });
});

test('テストと本番を取りちがえない', async () => {
  // 本番の ID なのに Stripe の答えがテスト（livemode false）
  assert.equal((await run(LIVE, sess(LIVE, { livemode: false }))).ok, false);
  // テストのセッションが本番のリンクを名乗っても開かない
  assert.equal((await run(TEST, sess(TEST, { payment_link: 'plink_live1' }))).ok, false);
  // ほかの ID の答え
  assert.equal((await run(LIVE, sess(LIVE, { id: 'cs_live_zzzzzzzzzzzz' }))).ok, false);
  // テストのリンクがないとき、テストのセッションは開かない
  assert.equal((await run(TEST, sess(TEST), { pack: { ...P, testLinkId: null } })).ok, false);
});

test('鍵がないときは Stripe に聞かずに開かない', async () => {
  const f = fake(sess(LIVE));
  assert.deepEqual(await checkPack({ id: LIVE, month: '2026-12', env: {}, pack: P, fetch: f }), { ok: false, why: 'key' });
  assert.equal((await checkPack({ id: TEST, month: '2026-12', env: { STRIPE_KEY: 'rk_live_x' }, pack: P, fetch: f })).ok, false);
  assert.equal(f.calls.length, 0);
});

test('Stripe がエラー・つながらないときは開かない', async () => {
  assert.equal((await run(LIVE, { error: { message: 'No such checkout.session' } }, { fetch: fake({}, 404) })).ok, false);
  assert.equal((await run(LIVE, null, { fetch: fake(null, 500) })).ok, false);
  const boom = async () => { throw new Error('network'); };
  assert.equal((await run(LIVE, null, { fetch: boom })).ok, false);
});

test('セッション ID の形がちがうと Stripe に聞かない', async () => {
  const f = fake(sess(LIVE));
  for (const id of ['', 'abc', 'cs_live_', 'cs_live_aaaa/../../v1/customers', 'pi_123456789012', `${LIVE}?x=1`]) {
    assert.equal((await checkPack({ id, month: '2026-12', env: ENV, pack: P, fetch: f })).ok, false, id);
  }
  assert.equal(f.calls.length, 0);
});

test('売る号はトップの「今月」と同じ（15日から翌月）・最初の号より前は最初の号', () => {
  assert.equal(sellMonth('2026-11-10'), '2026-12');
  assert.equal(sellMonth('2026-11-15'), '2026-12');
  assert.equal(sellMonth('2026-12-14'), '2026-12');
  assert.equal(sellMonth('2026-12-20'), '2027-01');
  assert.equal(sellMonth('2027-03-01'), '2027-03');
});

test('月のページは最初の号から売る号の11か月先まで', () => {
  const a = packMonths('2026-11-10');
  assert.equal(a.length, 12);
  assert.equal(a[0], '2026-12');
  assert.equal(a[11], '2027-11');
  const b = packMonths('2027-12-20');
  assert.equal(b[0], '2026-12', '前の号も開ける');
  assert.equal(b.at(-1), '2028-12');
});

test('買うボタンの URL に号の印（client_reference_id）', () => {
  assert.equal(buyUrl('https://buy.stripe.com/abc', '2026-12'), 'https://buy.stripe.com/abc?client_reference_id=pack-2026-12');
  assert.match(packRef('2026-12'), /^[A-Za-z0-9_-]{1,200}$/);
});

test('支払いリンクと ID は、そろって入れる（片方だけにしない）・値段は 500円', () => {
  assert.equal(Boolean(PACK.link), Boolean(PACK.linkId));
  assert.equal(Boolean(PACK.testLink), Boolean(PACK.testLinkId));
  if (PACK.linkId) assert.match(PACK.linkId, /^plink_/);
  if (PACK.testLinkId) assert.match(PACK.testLinkId, /^plink_/);
  assert.equal(PACK.price, 500);
});

test('Functions は /pack/ の下だけ（/pack/ そのものは通らない）', () => {
  assert.deepEqual(PACK_ROUTES.include, ['/pack/*']);
  assert.ok(PACK_ROUTES.exclude.includes('/pack/'));
});

test('/pack/ の下の URL の種類はデコードして決める（%2D などですり抜けない）', async () => {
  const { packRoute } = await import('../src/pack-check.mjs');
  assert.deepEqual(packRoute('/pack/'), { kind: 'sale' });
  assert.deepEqual(packRoute('/pack/index.html'), { kind: 'sale' });
  assert.deepEqual(packRoute('/pack/open/'), { kind: 'open' });
  assert.deepEqual(packRoute('/pack/open'), { kind: 'open' });
  for (const p of ['/pack/2026-12/', '/pack/2026-12', '/pack/2026-12/index.html', '/pack/2026%2D12/', '/pack/%32026-12/index.html']) {
    assert.deepEqual(packRoute(p), { kind: 'month', month: '2026-12' }, p);
  }
  for (const p of ['/pack/2026-13/', '/pack/zzz/', '/pack/2026-12/x', '/pack/2026-12//', '/pack/%E0%A4%A/', '/pack/2026-12%2Findex.html%3F', '/pack/open/x']) {
    assert.equal(packRoute(p).kind, 'bad', p);
  }
});
