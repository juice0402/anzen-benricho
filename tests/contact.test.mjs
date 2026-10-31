// お問い合わせ（連絡 C-020）：全サイト共通の Google フォームの、サイト名入りの事前入力の URL を使う
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SITE } from '../src/site.mjs';
import infoPages from '../src/pages/info.mjs';

const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSdAYN3cjrLkbbFywxHmCS7bqLFtDN0VmlO3NuTVPqKpaFj6Dg/viewform';

test('お問い合わせは共通のフォームで、どのサイトからの欄にサイト名が入る', () => {
  assert.ok(SITE.contact.startsWith(`${FORM}?`), '共通のフォームの URL');
  assert.ok(!/forms\.gle/.test(SITE.contact), '短縮 URL は名前が入らないので使わない');
  const name = new URL(SITE.contact).searchParams.get('entry.1872798598');
  assert.equal(name, SITE.name);
});

test('/contact/ があり、このサイトについて・プライバシーポリシーからたどれる', () => {
  const pages = Object.fromEntries(infoPages().map((p) => [p.path, p.html]));
  assert.ok(pages['/contact/'], '/contact/ がある');
  assert.ok(pages['/contact/'].includes(SITE.contact.replace(/&/g, '&amp;')), 'フォームへのリンク');
  for (const p of ['/about/', '/privacy/', '/contact/']) assert.ok(pages[p].includes('href="/contact/"'), `${p} からお問い合わせへ`);
  assert.ok(pages['/privacy/'].includes('Google フォーム'), 'プライバシーポリシーにフォームのこと');
});
