/* 竹寶 App 外殼（每一頁都在 <head> 載入）
   1. 電腦大螢幕：自動切到 phone.html，用手機外框展示（加 ?web=1 可看電腦版網頁）。
   2. 手機：底部分頁列（主頁、日記、補助、問竹寶、更多）、上方「通知」、更多選單。
   3. 用畫面模擬系統功能：推播橫幅、通知中心、通知設定、新竹通帳號與同步。全部是前端示範，不連任何伺服器。 */
(function () {
  const PAGE = (location.pathname.split('/').pop() || 'index.html').replace(/\?.*$/, '') || 'index.html';
  const params = new URLSearchParams(location.search);
  const inFrame = window.self !== window.top;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- 1. 電腦大螢幕 → 手機外框展示 ---------- */
  if (params.get('web') === '1') ss.set('zb-web', '1');
  if (params.get('web') === '0') ss.set('zb-web', '0');
  const wide = () => { try { return window.innerWidth >= 1000 && window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) { return false; } };
  if (!inFrame && PAGE !== 'phone.html' && wide() && ss.get('zb-web') !== '1') {
    location.replace('phone.html?p=' + encodeURIComponent(PAGE + location.hash));
    return;
  }

  const TABS = [
    { href: 'index.html', label: '主頁' },
    { href: 'diary.html', label: '日記' },
    { href: 'benefits.html', label: '補助' },
    { href: 'ask.html', label: '問竹寶' }
  ];
  const MORE = [
    { href: 'childcare.html', label: '托育', sub: '托嬰中心、公共托育、臨時托育' },
    { href: 'activities.html', label: '親子活動', sub: '新竹市近期的親子活動' },
    { href: 'help.html', label: '協助', sub: '緊急專線、常見問題、資料隱私' }
  ];
  const TITLES = { 'index.html': '主頁', 'diary.html': '寶寶日記', 'benefits.html': '補助及其他福利', 'childcare.html': '托育', 'activities.html': '親子活動', 'ask.html': '問竹寶', 'help.html': '協助', 'setup.html': '寶寶資料' };
  /* 通知內容都來自網站上已經有的官方資訊（疾管署接種時程、國健署產後健康照護、疾管署公告） */
  const NOTI = [
    { id: 'vax', kind: '疫苗與健檢', when: '今天 08:00', title: '寶寶 1/10 滿 4 個月', body: '可以打五合一和肺炎鏈球菌疫苗第 2 劑，公費免費。帶兒童健康手冊和健保卡到合約院所。', href: 'index.html', set: 'vax' },
    { id: 'care', kind: '補助期限', when: '昨天 20:00', title: '第 2 次產後健康照護', body: '要在 12/10 前完成，記得先預約。', href: 'benefits.html', set: 'due' },
    { id: 'diary', kind: '日記提醒', when: '昨天 21:30', title: '今天還沒記體溫', body: '點一下就能記錄。未滿 3 個月、38 度以上請儘快就醫。', href: 'diary.html', set: 'diary' },
    { id: 'flu', kind: '最新消息', when: '11/3', title: '幼兒第一次打流感疫苗，要打 2 劑才完整', body: '疾管署提醒：滿 6 個月、還沒上小學，今年 10 月前從沒打過流感疫苗的幼兒，要打 2 劑，中間隔 28 天以上。', href: 'index.html', set: 'news' }
  ];
  const SETTINGS = [
    { id: 'vax', label: '疫苗與健檢提醒', sub: '接種和兒童健檢前 7 天提醒' },
    { id: 'due', label: '補助期限提醒', sub: '申請期限前 14 天提醒' },
    { id: 'diary', label: '日記提醒', sub: '每天晚上 9:30 提醒還沒記的項目' },
    { id: 'news', label: '最新消息', sub: '新竹市政府與衛福部的育兒公告' }
  ];
  const hasTabs = PAGE !== 'setup.html' && PAGE !== 'phone.html';
  if (hasTabs) document.documentElement.classList.add('zb-has-tabs');
  if (inFrame) document.documentElement.classList.add('zb-in-frame');

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'zhubao-app.css';
  document.head.appendChild(css);

  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} };
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chev = '<svg class="zb-chevr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const logo = '<svg width="18" height="18" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="#2E5E4E"/><path d="M14 20V9M14 13c0-2.5 2-4 4.5-4M14 15.5c0-2.2-1.8-3.5-4-3.5" stroke="#F6F2EA" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';

  const readIds = () => store.get('zb-noti-read', []);
  const settings = () => Object.assign({ vax: true, due: true, diary: true, news: true }, store.get('zb-noti-set', {}));
  const unread = () => { const r = readIds(); const s = settings(); return NOTI.filter((n) => s[n.set] && r.indexOf(n.id) < 0); };
  const markRead = (id) => { const r = readIds(); if (r.indexOf(id) < 0) { r.push(id); store.set('zb-noti-read', r); } updateBell(); };

  /* ---------- 底部面板 ---------- */
  let openSheet = null, lastFocus = null, sheetHist = false, skipPop = false;
  window.addEventListener('popstate', () => { if (skipPop) { skipPop = false; return; } if (openSheet) closeSheet(false, true); });
  function sheet(id, title, html, onReady) {
    closeSheet(true);
    lastFocus = document.activeElement;
    const el = document.createElement('div');
    el.className = 'zb-sheet';
    el.id = id;
    el.innerHTML = '<div class="zb-sheet-back"></div><div class="zb-sheet-panel" role="dialog" aria-modal="true" aria-label="' + esc(title) + '" tabindex="-1">'
      + '<span class="zb-grab" aria-hidden="true"></span><div class="zb-sheet-head"><h2>' + esc(title) + '</h2><button type="button" class="zb-sheet-x">完成</button></div>' + html + '</div>';
    document.body.appendChild(el);
    openSheet = el;
    el.querySelector('.zb-sheet-back').addEventListener('click', () => closeSheet());
    el.querySelector('.zb-sheet-x').addEventListener('click', () => closeSheet());
    const panel = el.querySelector('.zb-sheet-panel');
    dragToClose(panel);
    panel.focus({ preventScroll: true });
    document.documentElement.style.overflow = 'hidden';
    if (onReady) onReady(el);
    syncTabs();
    /* 面板開著時按返回（Android 返回鍵、iOS 邊緣滑動、瀏覽器上一頁）：先關面板，不離開這一頁 */
    try { history.pushState({ zbSheet: id }, ''); sheetHist = true; } catch (e) { sheetHist = false; }
  }
  function closeSheet(now, fromBack) {
    const el = openSheet;
    if (!el) return;
    openSheet = null;
    if (sheetHist && !fromBack) { sheetHist = false; skipPop = true; try { history.back(); } catch (e) { skipPop = false; } }
    sheetHist = false;
    document.documentElement.style.overflow = '';
    syncTabs();
    if (now || reduced()) { el.remove(); } else { el.classList.add('zb-closing'); setTimeout(() => el.remove(), 200); }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  /* 往下拉關閉：跟著手指走，放開時看拉的距離或速度決定要不要關 */
  function dragToClose(panel) {
    let y0 = null, t0 = 0, dy = 0;
    panel.addEventListener('pointerdown', (e) => {
      if (panel.scrollTop > 0 || e.target.closest('button,a,input,textarea')) return;
      y0 = e.clientY; t0 = performance.now(); dy = 0;
    });
    panel.addEventListener('pointermove', (e) => {
      if (y0 == null) return;
      dy = Math.max(0, e.clientY - y0);
      if (dy > 4) { panel.style.animation = 'none'; panel.style.transform = 'translateY(' + dy + 'px)'; }
    });
    const end = () => {
      if (y0 == null) return;
      const v = dy / Math.max(1, performance.now() - t0);
      y0 = null;
      if (dy > 120 || (dy > 30 && v > 0.6)) { panel.style.transition = 'transform .2s ease-in'; panel.style.transform = 'translateY(100%)'; setTimeout(() => closeSheet(true), 190); }
      else { panel.style.transition = 'transform .3s cubic-bezier(.23,1,.32,1)'; panel.style.transform = ''; setTimeout(() => { panel.style.transition = ''; }, 300); }
    };
    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }

  function showMore() {
    const st = settings();
    const html = '<div class="zb-me"><b>寶寶 2 個月 4 天</b><span>2026/9/10 出生・北區・第 1 胎・自己或家人照顧</span><a href="setup.html">修改寶寶資料</a></div>'
      + '<div class="zb-group">' + MORE.map((m) => '<a class="zb-row" href="' + m.href + '"' + (m.href === PAGE ? ' aria-current="page"' : '') + '><span class="zb-row-main"><span>' + m.label + '</span><span class="zb-row-sub">' + m.sub + '</span></span>' + (m.href === PAGE ? '<span class="zb-row-end zb-ok">目前位置</span>' : chev) + '</a>').join('') + '</div>'
      + '<span class="zb-group-label">帳號與同步</span>'
      + '<div class="zb-group"><div class="zb-row"><span class="zb-row-main"><span>新竹通帳號</span><span class="zb-row-sub">用新竹通登入，換手機也不會遺失紀錄</span></span><span class="zb-row-end zb-ok">已連結</span></div>'
      + '<button type="button" class="zb-row" data-act="sync"><span class="zb-row-main"><span>同步寶寶日記</span><span class="zb-row-sub" data-sync>上次同步：' + esc(store.get('zb-sync', '今天 16:02')) + '</span></span><span class="zb-row-end zb-ok">立即同步</span></button></div>'
      + '<span class="zb-group-label">通知設定</span>'
      + '<div class="zb-group">' + SETTINGS.map((s) => '<div class="zb-row"><span class="zb-row-main"><span id="zs-' + s.id + '">' + s.label + '</span><span class="zb-row-sub">' + s.sub + '</span></span><button type="button" class="zb-switch" role="switch" aria-labelledby="zs-' + s.id + '" aria-checked="' + (st[s.id] ? 'true' : 'false') + '" data-set="' + s.id + '"></button></div>').join('') + '</div>'
      + '<p style="margin:0;font-size:12px;line-height:1.6;color:#5F6B64">竹寶的資料只用來整理你可以用的補助與提醒。資格以主管機關審核為準。</p>';
    sheet('zb-more', '更多', html, (el) => {
      el.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', () => {
        const s = settings(); const k = b.getAttribute('data-set'); s[k] = !s[k]; store.set('zb-noti-set', s);
        b.setAttribute('aria-checked', s[k] ? 'true' : 'false'); buzz(); updateBell();
      }));
      const sync = el.querySelector('[data-act="sync"]');
      sync.addEventListener('click', () => {
        const end = sync.querySelector('.zb-row-end');
        end.textContent = '同步中…'; end.classList.remove('zb-ok');
        setTimeout(() => {
          const d = new Date(); const t = '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          store.set('zb-sync', t);
          sync.querySelector('[data-sync]').textContent = '上次同步：' + t;
          end.textContent = '立即同步'; end.classList.add('zb-ok');
          toast('已同步到新竹通帳號'); buzz();
        }, 900);
      });
    });
  }
  function showNoti() {
    const s = settings(); const r = readIds();
    const list = NOTI.filter((n) => s[n.set]);
    const html = list.length
      ? '<div class="zb-group">' + list.map((n) => '<a class="zb-row zb-noti" href="' + n.href + '" data-id="' + n.id + '" data-unread="' + (r.indexOf(n.id) < 0) + '"><span class="zb-noti-top"><b>' + n.kind + '</b><span>' + n.when + '</span></span><span class="zb-noti-title">' + n.title + '</span><span class="zb-noti-body">' + n.body + '</span></a>').join('') + '</div>'
        + '<button type="button" class="zb-sheet-x" data-act="all" style="align-self:center">全部標為已讀</button>'
      : '<div class="zb-group"><div class="zb-row"><span class="zb-row-main"><span>目前沒有通知</span><span class="zb-row-sub">通知都關掉了。可以到「更多」裡的通知設定打開。</span></span></div></div>';
    sheet('zb-noti', '通知', html, (el) => {
      el.querySelectorAll('[data-id]').forEach((a) => a.addEventListener('click', () => markRead(a.getAttribute('data-id'))));
      const all = el.querySelector('[data-act="all"]');
      if (all) all.addEventListener('click', () => { store.set('zb-noti-read', NOTI.map((n) => n.id)); el.querySelectorAll('[data-unread]').forEach((x) => x.setAttribute('data-unread', 'false')); updateBell(); buzz(); });
    });
  }

  /* ---------- 推播橫幅 ---------- */
  let pushEl = null, pushTimer = 0;
  function push(id) {
    const n = NOTI.find((x) => x.id === id) || NOTI[0];
    if (pushEl) pushEl.remove();
    clearTimeout(pushTimer);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'zb-push';
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<span class="zb-push-top">' + logo + '<b>竹寶</b><span>現在</span></span><span class="zb-push-title">' + esc(n.title) + '</span><span class="zb-push-body">' + esc(n.body) + '</span>';
    document.body.appendChild(el);
    pushEl = el;
    buzz();
    let y0 = null, dy = 0;
    const hide = () => { if (!el.isConnected) return; el.classList.add('zb-closing'); setTimeout(() => el.remove(), 240); if (pushEl === el) pushEl = null; };
    el.addEventListener('pointerdown', (e) => { y0 = e.clientY; dy = 0; clearTimeout(pushTimer); });
    el.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.min(0, e.clientY - y0); el.style.animation = 'none'; el.style.transform = 'translateY(' + dy + 'px)'; });
    el.addEventListener('pointerup', () => {
      const moved = dy; y0 = null;
      if (moved < -30) { hide(); return; }
      el.style.transform = '';
      if (Math.abs(moved) < 6) { markRead(n.id); location.href = n.href; }
    });
    pushTimer = setTimeout(hide, 7000);
  }
  function toast(text) {
    const t = document.createElement('div');
    t.className = 'zb-toast'; t.setAttribute('role', 'status'); t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  /* ---------- 分頁列與通知按鈕 ---------- */
  let bell = null, moreBtn = null;
  function updateBell() {
    if (!bell) return;
    const n = unread().length;
    const b = bell.querySelector('b');
    b.textContent = n; b.hidden = n === 0;
    bell.setAttribute('aria-label', n ? '通知，' + n + ' 則未讀' : '通知');
  }
  function syncTabs() {
    if (!moreBtn) return;
    moreBtn.setAttribute('aria-expanded', openSheet && openSheet.id === 'zb-more' ? 'true' : 'false');
    const onMore = MORE.some((m) => m.href === PAGE);
    moreBtn.setAttribute('aria-current', onMore && !openSheet ? 'page' : 'false');
  }
  function mount() {
    if (hasTabs) {
      const nav = document.createElement('nav');
      nav.className = 'zb-tabs';
      nav.setAttribute('aria-label', '主選單');
      nav.innerHTML = TABS.map((t) => '<a class="zb-tab" href="' + t.href + '"' + (t.href === PAGE ? ' aria-current="page"' : '') + '><span>' + t.label + '</span></a>').join('')
        + '<button type="button" class="zb-tab" aria-haspopup="dialog" aria-expanded="false"><span>更多</span></button>';
      document.body.appendChild(nav);
      moreBtn = nav.querySelector('button');
      moreBtn.addEventListener('click', () => { buzz(); if (openSheet && openSheet.id === 'zb-more') closeSheet(); else showMore(); });
      nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
        buzz();
        /* 再點一次目前的分頁：回到最上面 */
        if (a.getAttribute('aria-current') === 'page') { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }
      }));
      syncTabs();

      bell = document.createElement('button');
      bell.type = 'button';
      bell.className = 'zb-bell';
      bell.innerHTML = '<span class="zb-bell-in">通知<b></b></span>';
      bell.addEventListener('click', () => { buzz(); showNoti(); });
      document.body.appendChild(bell);
      updateBell();

      const nt = document.createElement('div');
      nt.className = 'zb-navtitle';
      nt.setAttribute('aria-hidden', 'true');
      nt.textContent = TITLES[PAGE] || '';
      document.body.appendChild(nt);
      let lastY = window.scrollY, idle = 0;
      const root = document.documentElement;
      const onScroll = () => {
        const y = window.scrollY;
        const h = document.querySelector('#dc-root h1');
        const past = h ? h.getBoundingClientRect().bottom < 60 : y > 80;
        nt.classList.toggle('zb-on', past);
        /* 內容捲到上方列底下時，才出現分隔線 */
        root.classList.toggle('zb-scrolled', y > 4);
        /* 往下捲時小助手按鈕先讓開；往上捲、停下來或到底就回來 */
        const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 8;
        if (y > lastY + 6 && y > 120 && !atEnd) root.classList.add('zb-fab-away');
        else if (y < lastY - 6 || atEnd || y <= 120) root.classList.remove('zb-fab-away');
        lastY = y;
        clearTimeout(idle);
        idle = setTimeout(() => root.classList.remove('zb-fab-away'), 900);
        /* 問竹寶：輸入列黏在下方時加上分隔線 */
        const comp = document.querySelector('.zb-composer');
        if (comp) { const tabs = document.querySelector('.zb-tabs'); const limit = tabs ? tabs.getBoundingClientRect().top : window.innerHeight; const nx = comp.nextElementSibling; comp.classList.toggle('zb-stuck', !!nx && nx.getBoundingClientRect().top > limit + 1); }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    if (PAGE === 'setup.html') {
      /* 填完寶寶資料是單向的：進主頁後按返回不會再回到設定頁 */
      document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[href="index.html"]');
        if (!a) return;
        e.preventDefault(); location.replace('index.html');
      }, true);
    }
    if (!inFrame && ss.get('zb-web') === '1' && window.innerWidth >= 1000) {
      const back = document.createElement('a');
      back.className = 'zb-back-phone';
      back.href = 'phone.html?p=' + encodeURIComponent(PAGE);
      back.textContent = '切換到手機展示';
      back.addEventListener('click', () => ss.set('zb-web', '0'));
      document.body.appendChild(back);
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openSheet) closeSheet(); });
    /* 打字時（手機鍵盤跳出來）先收起分頁列和小助手按鈕，不擋住輸入框 */
    const isField = (t) => t && t.matches && t.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]),textarea,[contenteditable="true"]');
    document.addEventListener('focusin', (e) => { if (isField(e.target)) document.documentElement.classList.add('zb-typing'); });
    document.addEventListener('focusout', (e) => { if (isField(e.target)) setTimeout(() => { if (!isField(document.activeElement)) document.documentElement.classList.remove('zb-typing'); }, 60); });
    /* 第一次打開主頁時，載入畫面結束後收到一則推播 */
    if (PAGE === 'index.html' && hasTabs && !ss.get('zb-pushed') && settings().vax) {
      ss.set('zb-pushed', '1');
      setTimeout(() => push('vax'), document.getElementById('zb-loader') ? 6400 : 1600);
    }
    if (inFrame) { try { window.parent.postMessage({ zb: 'page', page: PAGE, title: TITLES[PAGE] || '' }, '*'); } catch (e) {} }
  }
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.zb === 'push') push(d.id);
    if (d.zb === 'replay') { try { sessionStorage.removeItem('zb-loaded'); sessionStorage.removeItem('zb-pushed'); } catch (x) {} location.href = 'index.html'; }
  });
  window.ZB = { push, toast, showNoti, showMore };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
