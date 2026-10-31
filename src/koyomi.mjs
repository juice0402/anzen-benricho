// 月のページの「◯月の暦」（升目）と、カレンダーの購読 /calendar.ics（10/31 連絡 C-016 案A・#42）
// 暦の年は「その月が次に来る年」（作り直しの日の月は今年）。運動のデータは src/data/koyomi.mjs
import { createHash } from 'node:crypto';
import { KOYOMI } from './data/koyomi.mjs';
import { HOUREI, houreiPath, todayJst } from './data/hourei.mjs';
import { SITE } from './site.mjs';
import { esc } from './layout.mjs';
import { icsDay, icsStamp, icsText, icsFold } from './client/ics.mjs';

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const lastDay = (y, m) => new Date(y, m, 0).getDate();
const md = (s) => `${Number(s.slice(5, 7))}月${Number(s.slice(8, 10))}日`;
const addDays = (s, n) => { const d = new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)) + n); return iso(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
const toDate = (s) => new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));

export const calYear = (m, today = todayJst()) => (m >= Number(today.slice(5, 7)) ? Number(today.slice(0, 4)) : Number(today.slice(0, 4)) + 1);

// ある年の運動の期間（毎年同じもの・その年度に確かめたもの）
const periodsOfYear = (r, y) => {
  if (r.span) return [[`${y}-${r.span[0]}`, `${y}-${r.span[1]}`]];
  if (r.month) return [[iso(y, r.month, 1), iso(y, r.month, lastDay(y, r.month))]];
  return [];
};

// その月の暦：色の日・印・凡例
export function monthKoyomi(y, m) {
  const a = iso(y, m, 1);
  const z = iso(y, m, lastDay(y, m));
  const run = new Set();
  const marks = {};
  const mark = (d, t) => { (marks[d] ||= []).includes(t) || marks[d].push(t); };
  const colored = [];
  const whole = [];
  const later = [];
  for (const r of KOYOMI) {
    const ps = r.dates || periodsOfYear(r, y);
    const p = ps.find(([f, t]) => f <= z && t >= a);
    if (!p) {
      if (r.pref && r.months.includes(m)) later.push(`<li><b>${m}月</b> ${esc(r.name)}（${esc(r.pref)}）</li>`);
      else if (r.dates && r.months.includes(m)) later.push(`<li><b>${m}月中</b> ${esc(r.name)}（日付は発表後）</li>`);
      continue;
    }
    const [f, t] = p;
    const until = t > z ? `（${md(t)}まで）` : '';
    if (f <= a && t >= z) {
      whole.push(`<li><b>${m}月中</b> ${esc(r.name)}${until}</li>`);
      if (r.start && f === a) mark(1, '運動開始');
    } else {
      for (let d = 1; d <= lastDay(y, m); d++) { const s = iso(y, m, d); if (s >= f && s <= t) run.add(d); }
      if (f >= a) mark(Number(f.slice(8, 10)), '運動開始');
      colored.push(`<li><b>色の日</b> ${esc(r.name)}（${md(t)}まで）</li>`);
    }
  }
  const next = m === 12 ? iso(y + 1, 1, 1) : iso(y, m + 1, 1);
  const laws = HOUREI.filter((h) => (h.date >= a && h.date <= z) || h.date === next).sort((p, q) => p.date.localeCompare(q.date));
  for (const h of laws) if (h.date <= z) mark(Number(h.date.slice(8, 10)), '施行');
  const lawLis = laws.map((h) => `<li><b>${md(h.date)}</b> <a href="${houreiPath(h)}">${esc(h.title)}</a>の施行（法改正）</li>`);
  return { run, marks, legend: [...colored, ...whole, ...later, ...lawLis] };
}

// カレンダーに登録するリンク（iPhone は webcal、Google カレンダーは cid）
const HOST = SITE.url.replace(/^https?:\/\//, '');
export const calSub = () => `<div class="cal-sub np">
<p><a href="webcal://${HOST}/calendar.ics">カレンダーに登録する</a></p>
<p class="u-note">毎月1日に◯月号、運動の初日が入る</p>
<p class="u-note"><a href="https://calendar.google.com/calendar/r?cid=webcal://${HOST}/calendar.ics">Google カレンダーで登録する</a></p>
</div>`;

export function koyomiHtml(m, today = todayJst()) {
  const y = calYear(m, today);
  const { run, marks, legend } = monthKoyomi(y, m);
  const first = new Date(y, m - 1, 1).getDay();
  const n = lastDay(y, m);
  const cells = ['日', '月', '火', '水', '木', '金', '土'].map((w) => `<div class="dw">${w}</div>`);
  for (let i = 0; i < first; i++) cells.push('<div class="e"></div>');
  for (let d = 1; d <= n; d++) {
    const cls = [(first + d - 1) % 7 === 0 ? 'sun' : '', run.has(d) ? 'run' : ''].filter(Boolean).join(' ');
    cells.push(`<div${cls ? ` class="${cls}"` : ''}><span class="d">${d}</span>${(marks[d] || []).map((t) => `<span class="mk">${t}</span>`).join('')}</div>`);
  }
  while (cells.length % 7) cells.push('<div class="e"></div>');
  return `<section class="sec ky" aria-labelledby="ky-h">
<h2 class="sec-h" id="ky-h">${y}年${m}月の暦</h2>
<div class="grid7" aria-hidden="true">${cells.join('')}</div>
${legend.length ? `<ul class="legend">${legend.join('')}</ul>` : ''}
${calSub()}
</section>`;
}

// /calendar.ics：毎月1日の◯月号・運動の期間・法改正の施行日（作り直しの日から12か月先まで、終日の予定）
export function calendarIcs({ themes, now = new Date() }) {
  const today = todayJst(now);
  const end = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;
  const ev = [];
  const add = (sum, from, to, desc) => { if (to >= today && from <= end) ev.push({ sum, from, to, desc }); };
  const monthUrl = (s) => `${SITE.url}/anzen/${Number(s.slice(5, 7))}/`;
  // ◯月号
  for (let i = 1; i <= 12; i++) {
    const d = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + i, 1);
    const m = d.getMonth() + 1;
    const ts = themes.filter((t) => t.month === m);
    if (!ts.length) continue;
    const s = iso(d.getFullYear(), m, 1);
    add(`${SITE.name} ${m}月号`, s, s, `${m}月のテーマ：${ts.map((t) => t.title).join('・')}\n${monthUrl(s)}`);
  }
  // 運動の期間
  const y0 = Number(today.slice(0, 4));
  for (const r of KOYOMI) {
    if (r.pref) continue;
    const ps = r.dates || [...periodsOfYear(r, y0), ...periodsOfYear(r, y0 + 1)];
    for (const [f, t] of ps) add(r.name, f, t, `${r.name}（${md(f)}〜${md(t)}）\n${monthUrl(f)}`);
  }
  // 法改正の施行日
  for (const h of HOUREI) add(`${h.title}の施行（法改正）`, h.date, h.date, `${SITE.url}${houreiPath(h)}`);
  ev.sort((p, q) => p.from.localeCompare(q.from) || p.sum.localeCompare(q.sum));
  const stamp = icsStamp(now);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//anzen-benricho.com//calendar//JA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsText(SITE.name)}`, `X-WR-CALDESC:${icsText('毎月1日の◯月号・全国の運動の期間・法改正の施行日')}`,
    'REFRESH-INTERVAL;VALUE=DURATION:P1W', 'X-PUBLISHED-TTL:P1W'];
  const seen = new Set();
  for (const e of ev) {
    const uid = createHash('sha256').update(`${e.sum}|${e.from}|${e.to}`).digest('hex').slice(0, 20);
    if (seen.has(uid)) continue;
    seen.add(uid);
    lines.push('BEGIN:VEVENT', `UID:${uid}@${HOST}`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDay(toDate(e.from))}`, `DTEND;VALUE=DATE:${icsDay(toDate(addDays(e.to, 1)))}`,
      `SUMMARY:${icsText(e.sum)}`, `DESCRIPTION:${icsText(e.desc)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(icsFold).join('\r\n') + '\r\n';
}
