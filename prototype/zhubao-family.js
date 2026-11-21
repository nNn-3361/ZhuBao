/* 竹寶的家庭資料（每一頁都在 <head>、zhubao-app.js 之前載入）
   - 多個寶寶檔案：每個檔案有暱稱、顏色、出生日期（或預產期）與幾個關鍵答案。
   - 關注：補助（跟著某個寶寶）、活動（可指定寶寶或全家）、自己建立的事件。全家共用一份。
   - 補助日期：依每個寶寶的生日算出「可開始申請」與「截止」的日子，給行事曆和通知用。
   全部存在這台裝置的瀏覽器（localStorage），不連任何伺服器。 */
(function () {
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const COLORS = [
    { id: 'red', name: '紅', hex: '#C8553D' },
    { id: 'orange', name: '橙', hex: '#D9822B' },
    { id: 'yellow', name: '黃', hex: '#C9A227' },
    { id: 'green', name: '綠', hex: '#3F8F5F' },
    { id: 'blue', name: '藍', hex: '#3C76B5' },
    { id: 'purple', name: '紫', hex: '#7D5BA6' },
    { id: 'pink', name: '粉', hex: '#D46A92' }
  ];
  const FAMILY = { id: '', name: '全家', hex: '#8A938D' };
  const WK = ['日', '一', '二', '三', '四', '五', '六'];

  const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const ymd = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const parse = (s) => { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const addM = (d, m) => { const x = new Date(d.getFullYear(), d.getMonth() + m, 1); const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); x.setDate(Math.min(d.getDate(), last)); return x; };
  const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const days = (a, b) => Math.round((b - a) / 86400000);
  const fmt = (d) => d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  const md = (d) => (d.getMonth() + 1) + '/' + d.getDate();

  /* ---------- 寶寶檔案 ---------- */
  /* 示範：哥哥 2024/2/20 出生（藍），妹妹 2026/9/10 出生（綠） */
  const SEED_KIDS = [
    { id: 'k2', name: '妹妹', color: 'green', bd: '2026-09-10', district: '北區', residency: '不確定', order: '第 2 胎', care: '自己或家人', lowIncome: '不想回答' },
    { id: 'k1', name: '哥哥', color: 'blue', bd: '2024-02-20', district: '北區', residency: '不確定', order: '第 1 胎', care: '自己或家人', lowIncome: '不想回答' }
  ];
  function kids() {
    let k = store.get('zb-kids', null);
    if (!Array.isArray(k) || !k.length) { k = SEED_KIDS.map((x) => Object.assign({}, x)); store.set('zb-kids', k); seedFollows(); }
    return k;
  }
  const kid = (id) => kids().find((k) => k.id === id) || null;
  function current() {
    const all = kids();
    return all.find((k) => k.id === store.get('zb-kid', '')) || all[0];
  }
  const setCurrent = (id) => store.set('zb-kid', id);
  function saveKid(k) {
    const all = kids();
    if (!k.id) k.id = 'k' + Date.now().toString(36);
    const i = all.findIndex((x) => x.id === k.id);
    if (i >= 0) all[i] = k; else all.push(k);
    store.set('zb-kids', all);
    return k;
  }
  function removeKid(id) {
    const all = kids().filter((k) => k.id !== id);
    if (!all.length) return;
    store.set('zb-kids', all);
    store.set('zb-follow', follows().filter((f) => f.kid !== id));
    store.set('zb-events', events().map((e) => (e.kid === id ? Object.assign({}, e, { kid: '' }) : e)));
    if (store.get('zb-kid', '') === id) setCurrent(all[0].id);
  }
  const color = (id) => (COLORS.find((c) => c.id === id) || COLORS[3]);
  const kidHex = (id) => { const k = id ? kid(id) : null; return k ? color(k.color).hex : FAMILY.hex; };
  const kidName = (id) => { const k = id ? kid(id) : null; return k ? k.name : FAMILY.name; };

  /* 年紀文字：2 個月 11 天、2 歲 9 個月；還沒出生就顯示預產期倒數 */
  function age(k, ref) {
    const t = ref || today(), b = parse(k.bd);
    if (b > t) return { born: false, text: '預產期還有 ' + days(t, b) + ' 天', short: '還沒出生' };
    let m = (t.getFullYear() - b.getFullYear()) * 12 + t.getMonth() - b.getMonth();
    if (addM(b, m) > t) m -= 1;
    const d = days(addM(b, m), t);
    if (m < 24) return { born: true, months: m, text: (m ? m + ' 個月 ' : '') + d + ' 天', short: m ? m + ' 個月' : d + ' 天' };
    const y = Math.floor(m / 12), mm = m % 12;
    return { born: true, months: m, text: y + ' 歲' + (mm ? ' ' + mm + ' 個月' : ''), short: y + ' 歲' + (mm ? ' ' + mm + ' 個月' : '') };
  }
  function line(k) {
    const b = parse(k.bd), born = b <= today();
    return fmt(b) + (born ? ' 出生' : ' 預產期') + '・' + k.district + '・' + k.order + '・' + (k.care === '自己或家人' ? '自己或家人照顧' : k.care);
  }

  /* 補助的年齡階段（補助頁的竹節）：依生日算出每個階段的起訖 */
  function stages(k) {
    const b = parse(k.bd);
    const schoolY = b.getMonth() < 8 || (b.getMonth() === 8 && b.getDate() === 1) ? b.getFullYear() + 5 : b.getFullYear() + 6;
    const s5 = new Date(schoolY, 7, 1), s6 = new Date(schoolY + 1, 7, 1);
    const list = [
      { id: 'preg', title: '孕期', from: null, to: b },
      { id: 's0', title: '出生到 2 個月', from: b, to: addM(b, 2) },
      { id: 's1', title: '2 到 4 個月', from: addM(b, 2), to: addM(b, 4) },
      { id: 's2', title: '4 到 12 個月', from: addM(b, 4), to: addM(b, 12) },
      { id: 's3', title: '1 到 2 歲', from: addM(b, 12), to: addM(b, 24) },
      { id: 's4', title: '2 歲到 5 歲前', from: addM(b, 24), to: s5 },
      { id: 's5', title: '5 歲', from: s5, to: s6 },
      { id: 's6', title: '上小學以後', from: s6, to: null }
    ];
    const t = today();
    list.forEach((s) => {
      s.phase = (s.to && s.to <= t) ? 'past' : (!s.from || s.from <= t) ? 'now' : 'next';
      const end = s.to ? addD(s.to, -1) : null;
      s.range = s.id === 'preg' ? '懷孕期間' : !end ? fmt(s.from).replace(/\/\d+$/, '') + ' 起' : s.id === 's4' || s.id === 's5' ? fmt(s.from).replace(/\/\d+$/, '') + ' – ' + fmt(end).replace(/\/\d+$/, '') : fmt(s.from) + ' – ' + fmt(end);
    });
    let seenNext = false;
    list.forEach((s) => { if (s.phase === 'next') { if (seenNext) s.phase = 'later'; seenNext = true; } });
    return list;
  }

  /* 補助頁上方的篩選條件（可複選）。family＝家庭狀況，care＝照顧方式 */
  const CONDS = [
    { id: 'low', name: '經濟困難', group: 'family' },
    { id: 'single', name: '單親・特殊境遇', group: 'family' },
    { id: 'dis', name: '身障・早療', group: 'family' },
    { id: 'med', name: '醫療', group: 'family' },
    { id: 'new', name: '新住民', group: 'family' },
    { id: 'ind', name: '原住民', group: 'family' },
    { id: 'multi', name: '多胞胎', group: 'family' },
    { id: 'preg', name: '懷孕・下一胎', group: 'family' },
    { id: 'home', name: '自己或家人照顧', group: 'care' },
    { id: 'care', name: '送托（保母、托嬰中心）', group: 'care' },
    { id: 'leave', name: '請育嬰留停', group: 'care' }
  ];
  /* 依寶寶檔案自動帶入的條件：寶寶資料頁勾的狀況＋低收入、照顧方式、還沒出生 */
  function conds(k) {
    const out = (k.conds || []).filter((c) => CONDS.some((x) => x.id === c));
    const add = (c) => { if (out.indexOf(c) < 0) out.push(c); };
    if (k.lowIncome === '是') add('low');
    if (k.care === '自己或家人') add('home'); else if (k.care) add('care');
    if (parse(k.bd) > today()) add('preg');
    return out;
  }

  /* 補助日期規則：只用補助頁上已寫明、有官方來源的時間點 */
  const RULES = [
    { item: 'confine', name: '到宅坐月子服務', start: (b) => addM(b, -3) },
    { item: 'birthHC', name: '新竹市生育津貼', start: (b) => b, skip: (k) => k.residency === '否' },
    { item: 'lowInc', name: '低收入戶產婦及嬰兒營養費', start: (b) => b, end: (b) => addD(addM(b, 3), -1), skip: (k) => k.lowIncome === '否' },
    { item: 'post1', name: '產後健康照護（第 1 次）', start: (b) => b, end: (b) => addD(addM(b, 1), -1) },
    { item: 'post2', name: '產後健康照護（第 2 次）', start: (b) => addM(b, 1), end: (b) => addD(addM(b, 3), -1) },
    { item: 'allowance', name: '育兒津貼', start: (b) => b },
    { item: 'leave', name: '育嬰留職停薪津貼', end: (b) => addD(addM(b, 36), -1) },
    { item: 'after2', name: '育兒津貼（2 歲以後）', start: (b) => addM(b, 24) },
    { item: 'school5', name: '幼兒園就學補助（5 歲）', start: (b) => { const y = b.getMonth() < 8 || (b.getMonth() === 8 && b.getDate() === 1) ? b.getFullYear() + 5 : b.getFullYear() + 6; return new Date(y, 7, 1); }, end: (b) => { const y = b.getMonth() < 8 || (b.getMonth() === 8 && b.getDate() === 1) ? b.getFullYear() + 5 : b.getFullYear() + 6; return new Date(y, 11, 31); } }
  ];
  /* 某個寶寶某項補助的日期：可開始申請（已經過了就不列）與截止 */
  function benefitDates(k, item) {
    const r = RULES.find((x) => x.item === item);
    if (!r || !k || (r.skip && r.skip(k))) return [];
    const b = parse(k.bd), t = today(), out = [];
    if (r.start) { const d = r.start(b); if (d > t) out.push({ type: 'start', label: '可開始申請', date: d }); }
    if (r.end) { const d = r.end(b); const s = r.start ? r.start(b) : null; if (!s || d >= s) out.push({ type: 'end', label: '截止', date: d }); }
    return out;
  }
  const ruleName = (item) => (RULES.find((x) => x.item === item) || {}).name || '';

  /* ---------- 關注 ---------- */
  /* 補助：{ t:'b', id:'post2', kid:'k2' }；活動：{ t:'a', id:'12151', kid:'k1' 或 ''（全家）, name, date, time, place } */
  const follows = () => store.get('zb-follow', []);
  const fkey = (f) => f.t + ':' + f.id + '@' + (f.kid || '');
  function isFollowing(t, id, kidId) { return follows().some((f) => f.t === t && f.id === id && (t === 'a' || f.kid === kidId)); }
  function follow(f) { const all = follows().filter((x) => !(x.t === f.t && x.id === f.id && (f.t === 'a' || x.kid === f.kid))); all.push(f); store.set('zb-follow', all); }
  function unfollow(t, id, kidId) { store.set('zb-follow', follows().filter((x) => !(x.t === t && x.id === id && (t === 'a' || x.kid === kidId)))); }
  const activityFollow = (id) => follows().find((f) => f.t === 'a' && f.id === id) || null;

  /* 自己建立的事件：{ id, title, date:'2026-11-29', time:'10:00', kid:'k2', note } */
  const events = () => store.get('zb-events', []);
  function saveEvent(e) { const all = events().filter((x) => x.id !== e.id); if (!e.id) e.id = 'e' + Date.now().toString(36); all.push(e); store.set('zb-events', all); return e; }
  const removeEvent = (id) => store.set('zb-events', events().filter((x) => x.id !== id));

  function seedFollows() {
    if (store.get('zb-follow', null) === null) {
      store.set('zb-follow', [
        { t: 'b', id: 'post2', kid: 'k2' },
        { t: 'b', id: 'lowInc', kid: 'k2' },
        { t: 'b', id: 'leave', kid: 'k1' },
        { t: 'a', id: '12151', kid: 'k1', name: '彩色滴管－大象艾瑪', date: '2026-11-22', time: '10:00', place: '東區親子館' },
        { t: 'a', id: '12149', kid: 'k1', name: '敲一敲、變一變', date: '2026-11-26', time: '13:30', place: '東區親子館' },
        { t: 'a', id: '12102', kid: '', name: '故事花園：企鵝體操', date: '2026-11-27', time: '10:00', place: '北區親子館' }
      ]);
    }
    if (store.get('zb-events', null) === null) {
      const t = today();
      store.set('zb-events', [
        { id: 'e1', title: '參觀托嬰中心', date: ymd(addD(t, 8)), time: '10:00', kid: 'k2', note: '先打電話預約參觀時間。' },
        { id: 'e2', title: '帶妹妹看醫生', date: ymd(addD(t, 12)), time: '09:30', kid: 'k2', note: '記得帶健保卡和兒童健康手冊。' }
      ]);
    }
  }

  /* 行事曆上的所有事件（已關注的補助日期、已關注的活動、自己建立的事件） */
  function calendar() {
    const out = [];
    follows().forEach((f) => {
      if (f.t === 'b') {
        const k = kid(f.kid); if (!k) return;
        benefitDates(k, f.id).forEach((d) => out.push({
          key: 'b:' + f.id + '@' + f.kid + ':' + d.type, kind: 'b', date: ymd(d.date), time: '',
          title: ruleName(f.id) + d.label, short: ruleName(f.id), what: d.label, sub: '補助・' + d.label + '・' + k.name,
          kid: f.kid, href: 'benefits.html#b-' + f.id + '@' + f.kid
        }));
      } else if (f.t === 'a') {
        if (f.kid && !kid(f.kid)) f.kid = '';
        out.push({ key: 'a:' + f.id, kind: 'a', date: f.date, time: f.time || '', title: f.name, short: f.name, what: '活動',
          sub: '活動・' + (f.time ? f.time + '・' : '') + (f.place || '') + '・' + kidName(f.kid), kid: f.kid, href: 'activities.html#a-' + f.id });
      }
    });
    events().forEach((e) => out.push({ key: 'e:' + e.id, kind: 'e', id: e.id, date: e.date, time: e.time || '', title: e.title, short: e.title, what: '自己的事件',
      sub: '自己的事件・' + (e.time ? e.time + '・' : '') + kidName(e.kid), kid: e.kid || '', note: e.note || '', href: '' }));
    out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.time || '99') < (b.time || '99') ? -1 : 1));
    return out;
  }

  /* 通知：只通知已關注的，前 7 天和前 1 天各提醒一次 */
  function reminders() {
    const t = today(), out = [];
    calendar().forEach((e) => {
      const d = parse(e.date), left = days(t, d);
      if (left < 1 || left > 7) return;
      const whenTxt = (sent) => { const g = days(sent, t); return g === 0 ? '今天 08:00' : g === 1 ? '昨天 08:00' : md(sent); };
      const href = e.href || 'index.html#d-' + e.date;
      const title = e.kind === 'b' ? e.title : e.short;
      const day = md(d) + '（' + WK[d.getDay()] + '）';
      out.push({ id: 'r7:' + e.key, kind: '7 天前提醒', at: addD(d, -7), when: whenTxt(addD(d, -7)), title, body: '7 天後，' + day + '・' + e.sub, href, kid: e.kid, set: 'due' });
      if (left === 1) out.push({ id: 'r1:' + e.key, kind: '明天提醒', at: addD(d, -1), when: whenTxt(addD(d, -1)), title, body: '明天，' + day + '・' + e.sub, href, kid: e.kid, set: 'due' });
    });
    out.sort((a, b) => b.at - a.at);
    return out;
  }

  window.ZBF = { COLORS, FAMILY, WK, today, ymd, parse, addM, addD, days, fmt, md, kids, kid, current, setCurrent, saveKid, removeKid, color, kidHex, kidName, age, line, stages, CONDS, conds, benefitDates, ruleName,
    follows, isFollowing, follow, unfollow, activityFollow, events, saveEvent, removeEvent, calendar, reminders, fkey };
})();
