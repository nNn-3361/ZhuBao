/* 竹寶 App 外殼（每一頁都在 <head> 載入）
   1. 電腦大螢幕：自動切到 phone.html，用手機外框展示（加 ?web=1 可看電腦版網頁）。
   2. 手機：底部分頁列（主頁、補助、托育、活動、問竹寶）、右上角選單鍵（通知、寶寶資料、協助、帳號與設定都在裡面）。
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

  /* ---------- 友善模式：區塊底下「怎麼用」的說明文字（class="zb-guide"）只在開啟時顯示，預設關閉 ---------- */
  const guideStyle = document.createElement('style');
  guideStyle.textContent = 'html:not(.zb-friendly) .zb-guide{display:none !important}';
  document.head.appendChild(guideStyle);
  const setFriendly = (on) => { document.documentElement.classList.toggle('zb-friendly', !!on); };
  setFriendly(store.get('zb-friendly', false));

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
    { href: 'benefits.html', label: '補助' },
    { href: 'childcare.html', label: '托育' },
    { href: 'activities.html', label: '活動' },
    { href: 'ask.html', label: '問竹寶' }
  ];
  const MORE = [
    { href: 'help.html', label: '協助', sub: '緊急專線、常見問題、資料隱私' }
  ];
  const TITLES = { 'index.html': '主頁', 'benefits.html': '補助及其他福利', 'childcare.html': '托育', 'activities.html': '親子活動', 'ask.html': '問竹寶', 'help.html': '協助', 'setup.html': '寶寶資料' };
  /* 通知：已關注的項目（補助日期、活動、自己建立的事件）＋每個孩子都有的健檢與疫苗，前 7 天和前 1 天各提醒一次 */
  const F = window.ZBF;
  if (F && F.leaving) return;
  let NOTI = F ? F.reminders() : [];
  const SETTINGS = [
    { id: 'due', label: '關注提醒', sub: '已關注的補助、活動與自己建立的事件，前 7 天和前 1 天提醒' },
    { id: 'health', label: '健檢與疫苗提醒', sub: '每個孩子都有的公費兒童健檢與常規疫苗，不用關注。依生日在健檢期限、建議接種日前 7 天和前 1 天提醒' }
  ];
  const hasTabs = PAGE !== 'setup.html' && PAGE !== 'phone.html';
  if (hasTabs) document.documentElement.classList.add('zb-has-tabs');
  if (inFrame) document.documentElement.classList.add('zb-in-frame');

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'zhubao-app.css?v=20261121b';
  document.head.appendChild(css);

  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} };
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chev = '<svg class="zb-chevr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const logo = '<svg width="18" height="18" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="#2E5E4E"/><path d="M14 20V9M14 13c0-2.5 2-4 4.5-4M14 15.5c0-2.2-1.8-3.5-4-3.5" stroke="#F6F2EA" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';

  const readIds = () => store.get('zb-noti-read', []);
  const settings = () => Object.assign({ due: true, health: true }, store.get('zb-noti-set', {}));
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

  /* 右上角選單：通知、寶寶資料、協助、帳號與同步、通知設定，全部放在同一個面板 */
  function showMore() {
    const st = settings(); const r = readIds();
    const list = NOTI.filter((n) => st[n.set]);
    const noti = list.length
      ? '<div class="zb-group">' + list.map((n) => '<a class="zb-row zb-noti" href="' + n.href + '" data-id="' + n.id + '" data-unread="' + (r.indexOf(n.id) < 0) + '"><span class="zb-noti-top"><b>' + esc(n.kind) + '</b><span>' + esc(n.when) + '</span></span><span class="zb-noti-title"><i class="zb-kdot" style="background:' + F.kidHex(n.kid) + '"></i>' + esc(n.title) + '</span><span class="zb-noti-body">' + esc(n.body) + '</span></a>').join('') + '</div>'
        + (unread().length ? '<button type="button" class="zb-sheet-x" data-act="all" style="align-self:center">全部標為已讀</button>' : '')
      : '<div class="zb-group"><div class="zb-row"><span class="zb-row-main"><span>目前沒有通知</span><span class="zb-row-sub">' + (st.due || st.health ? '健檢期限、疫苗接種日，以及你關注的補助和活動，前 7 天和前 1 天會提醒你。' : '提醒都關掉了，可以在下方通知設定打開。') + '</span></span></div></div>';
    const html = '<span class="zb-group-label">通知</span>' + noti
      + '<span class="zb-group-label">寶寶檔案</span>'
      + '<div class="zb-group">' + F.kids().map((k) => { const on = k.id === F.current().id; return '<button type="button" class="zb-row zb-kid" data-kid="' + k.id + '" aria-pressed="' + on + '"><i class="zb-kdot zb-kdot-lg" style="background:' + F.color(k.color).hex + '"></i><span class="zb-row-main"><span>' + esc(k.name) + '・' + esc(F.age(k).short) + '</span><span class="zb-row-sub">' + esc(F.line(k)) + '</span></span>' + (on ? '<span class="zb-row-end zb-ok">目前</span>' : '<span class="zb-row-end">切換</span>') + '</button>'; }).join('')
      + '<a class="zb-row" href="setup.html"><span class="zb-row-main"><span>修改寶寶資料</span><span class="zb-row-sub">目前是' + esc(F.current().name) + '的檔案</span></span>' + chev + '</a>'
      + '<a class="zb-row" href="setup.html?new=1"><span class="zb-row-main"><span>建立新檔案</span><span class="zb-row-sub">家裡有不只一個孩子時，各自建一個檔案</span></span>' + chev + '</a></div>'
      + '<div class="zb-group">' + MORE.map((m) => '<a class="zb-row" href="' + m.href + '"' + (m.href === PAGE ? ' aria-current="page"' : '') + '><span class="zb-row-main"><span>' + m.label + '</span><span class="zb-row-sub">' + m.sub + '</span></span>' + (m.href === PAGE ? '<span class="zb-row-end zb-ok">目前位置</span>' : chev) + '</a>').join('') + '</div>'
      + '<span class="zb-group-label">帳號與同步</span>'
      + '<div class="zb-group"><div class="zb-row"><span class="zb-row-main"><span>新竹通帳號</span><span class="zb-row-sub">用新竹通登入，換手機也能找回寶寶資料</span></span><span class="zb-row-end zb-ok">已連結</span></div>'
      + '<button type="button" class="zb-row" data-act="sync"><span class="zb-row-main"><span>同步寶寶資料</span><span class="zb-row-sub" data-sync>上次同步：' + esc(store.get('zb-sync', '今天 16:02')) + '</span></span><span class="zb-row-end zb-ok">立即同步</span></button></div>'
      + '<span class="zb-group-label">通知設定</span>'
      + '<div class="zb-group">' + SETTINGS.map((x) => '<div class="zb-row"><span class="zb-row-main"><span id="zs-' + x.id + '">' + x.label + '</span><span class="zb-row-sub">' + x.sub + '</span></span><button type="button" class="zb-switch" role="switch" aria-labelledby="zs-' + x.id + '" aria-checked="' + (st[x.id] ? 'true' : 'false') + '" data-set="' + x.id + '"></button></div>').join('') + '</div>'
      + '<span class="zb-group-label">顯示</span>'
      + '<div class="zb-group"><div class="zb-row"><span class="zb-row-main"><span id="zs-friendly">友善模式</span><span class="zb-row-sub">在各區塊標題下顯示怎麼使用的說明，例如「點一張看全文」</span></span><button type="button" class="zb-switch" role="switch" aria-labelledby="zs-friendly" aria-checked="' + (store.get('zb-friendly', false) ? 'true' : 'false') + '" data-friendly></button></div></div>'
      + '<span class="zb-group-label">重新開始</span>'
      + '<div class="zb-group"><button type="button" class="zb-row" data-act="reset"><span class="zb-row-main"><span>清除資料重新開始</span><span class="zb-row-sub" data-reset-sub>刪除這支手機上的寶寶檔案、關注、事件和問竹寶紀錄，回到第一次使用</span></span><span class="zb-row-end zb-danger">清除</span></button></div>'
      + '<p style="margin:0;font-size:12px;line-height:1.6;color:#5F6B64">竹寶的資料只用來整理可能適用的補助與提醒。實際資格以主管機關審核為準。</p>';
    sheet('zb-more', '選單', html, (el) => {
      el.querySelectorAll('[data-id]').forEach((a) => a.addEventListener('click', () => markRead(a.getAttribute('data-id'))));
      el.querySelectorAll('[data-kid]').forEach((b) => b.addEventListener('click', () => {
        const id = b.getAttribute('data-kid'); buzz();
        if (id === F.current().id) { closeSheet(); return; }
        F.setCurrent(id); closeSheet(true); location.reload();
      }));
      const all = el.querySelector('[data-act="all"]');
      if (all) all.addEventListener('click', () => { store.set('zb-noti-read', NOTI.map((n) => n.id)); el.querySelectorAll('[data-unread]').forEach((x) => x.setAttribute('data-unread', 'false')); all.remove(); updateBell(); buzz(); });
      el.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', () => {
        const s = settings(); const k = b.getAttribute('data-set'); s[k] = !s[k]; store.set('zb-noti-set', s);
        b.setAttribute('aria-checked', s[k] ? 'true' : 'false'); buzz(); updateBell();
      }));
      const fr = el.querySelector('[data-friendly]');
      fr.addEventListener('click', () => {
        const on = !store.get('zb-friendly', false); store.set('zb-friendly', on); setFriendly(on);
        fr.setAttribute('aria-checked', on ? 'true' : 'false'); buzz();
      });
      /* 清除資料：按兩次才清，避免誤觸 */
      const rs = el.querySelector('[data-act="reset"]');
      rs.addEventListener('click', () => {
        buzz();
        if (rs.getAttribute('data-armed') !== '1') {
          rs.setAttribute('data-armed', '1');
          rs.querySelector('.zb-row-end').textContent = '確定清除';
          rs.querySelector('[data-reset-sub]').textContent = '再按一次就會全部清除，無法復原';
          return;
        }
        F.reset();
      });
      const sync = el.querySelector('[data-act="sync"]');
      sync.addEventListener('click', () => {
        const end = sync.querySelector('.zb-row-end');
        end.textContent = '同步中…'; end.classList.remove('zb-ok');
        setTimeout(() => {
          const d = new Date(); const t = '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          store.set('zb-sync', t);
          sync.querySelector('[data-sync]').textContent = '上次同步：' + t;
          end.textContent = '立即同步'; end.classList.add('zb-ok');
          toast('同步成功'); buzz();
        }, 900);
      });
    });
  }
  /* ---------- 給竹寶意見回饋：Demo 只模擬送出，不會傳到任何地方，也不會存下來 ---------- */
  function feedback() {
    const TYPES = ['功能建議', '資料有誤', '使用上的問題', '其他'];
    const html = '<div data-fb-form style="display:flex;flex-direction:column;gap:14px">'
      + '<p style="margin:0;font-size:15px;line-height:1.7;color:var(--zb-sub)">哪裡好用、哪裡不順手，或發現資料有錯，都可以告訴竹寶。</p>'
      + '<div style="display:flex;flex-direction:column;gap:8px"><span id="zb-fb-t" style="font-size:14px;font-weight:600">想說的是</span><div class="zb-pick" role="group" aria-labelledby="zb-fb-t">'
      + TYPES.map((t, i) => '<button type="button" data-fb-type="' + t + '" aria-pressed="' + (i === 0) + '">' + t + '</button>').join('') + '</div></div>'
      + '<label style="display:flex;flex-direction:column;gap:8px"><span style="font-size:14px;font-weight:600">內容</span><textarea class="zb-input" data-fb-text rows="5" maxlength="500" placeholder="例如：希望補助頁可以…"></textarea></label>'
      + '<div class="zb-sheet-actions"><button type="button" class="zb-btn-main" data-fb-send disabled style="opacity:.45">送出</button></div>'
      + '</div>'
      + '<div data-fb-done style="display:none;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:12px 0 8px">'
      + '<svg width="48" height="48" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="#2E5E4E"/><path d="M14 20V9M14 13c0-2.5 2-4 4.5-4M14 15.5c0-2.2-1.8-3.5-4-3.5" stroke="#F6F2EA" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>'
      + '<b style="font-size:18px">已送出，謝謝你！</b><span style="font-size:15px;line-height:1.7;color:var(--zb-sub)">竹寶團隊會看過每一則意見，一起把竹寶變得更好用。</span>'
      + '<div class="zb-sheet-actions" style="align-self:stretch;margin-top:6px"><button type="button" class="zb-btn-ghost" data-fb-close>完成</button></div></div>';
    sheet('zb-feedback', '給竹寶意見回饋', html, (el) => {
      const text = el.querySelector('[data-fb-text]'), send = el.querySelector('[data-fb-send]');
      el.querySelectorAll('[data-fb-type]').forEach((b) => b.addEventListener('click', () => {
        el.querySelectorAll('[data-fb-type]').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); buzz();
      }));
      const sync = () => { const ok = text.value.trim().length > 0; send.disabled = !ok; send.style.opacity = ok ? '' : '.45'; };
      text.addEventListener('input', sync);
      send.addEventListener('click', () => {
        if (send.disabled) return;
        send.disabled = true; send.textContent = '送出中…'; buzz();
        setTimeout(() => {
          if (!el.isConnected) return;
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          el.querySelector('[data-fb-form]').remove();
          const done = el.querySelector('[data-fb-done]'); done.style.display = 'flex';
          const x = el.querySelector('.zb-sheet-x'); if (x) x.style.display = 'none';
          const panel = el.querySelector('.zb-sheet-panel'); panel.scrollTop = 0; panel.focus({ preventScroll: true });
          el.querySelector('[data-fb-close]').addEventListener('click', () => closeSheet());
        }, 700);
      });
    });
  }
  const showNoti = showMore;

  /* ---------- 推播橫幅 ---------- */
  let pushEl = null, pushTimer = 0;
  function push(id) {
    let n;
    if (id === 'health') {
      /* 展示用：有正在提醒的就送那則，沒有就模擬下一個健檢或疫苗日期的 7 天前通知 */
      n = unread().find((x) => x.set === 'health') || NOTI.find((x) => x.set === 'health') || (F.healthPreview && F.healthPreview());
      if (!n) { toast('還沒出生的寶寶，出生後會開始提醒健檢與疫苗'); return; }
    } else {
      n = NOTI.find((x) => x.id === id) || unread().find((x) => x.set === 'due') || NOTI.find((x) => x.set === 'due');
      if (!n) { toast('目前沒有已關注項目的提醒'); return; }
    }
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
  let bell = null;
  function updateBell() {
    if (!bell) return;
    const n = unread().length;
    const b = bell.querySelector('b');
    b.textContent = n; b.hidden = n === 0;
    bell.setAttribute('aria-label', n ? '選單，' + n + ' 則未讀通知' : '選單');
  }
  function syncTabs() {
    if (!bell) return;
    bell.setAttribute('aria-expanded', openSheet && openSheet.id === 'zb-more' ? 'true' : 'false');
  }
  function mount() {
    if (hasTabs) {
      const nav = document.createElement('nav');
      nav.className = 'zb-tabs';
      nav.setAttribute('aria-label', '主選單');
      nav.innerHTML = TABS.map((t) => '<a class="zb-tab" href="' + t.href + '"' + (t.href === PAGE ? ' aria-current="page"' : '') + '><span>' + t.label + '</span></a>').join('');
      document.body.appendChild(nav);
      nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
        buzz();
        /* 再點一次目前的分頁：回到最上面 */
        if (a.getAttribute('aria-current') === 'page') { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }
      }));

      /* 右上角選單鍵（三條線）：未讀通知數字顯示在旁邊 */
      bell = document.createElement('button');
      bell.type = 'button';
      bell.className = 'zb-bell';
      bell.setAttribute('aria-haspopup', 'dialog');
      bell.setAttribute('aria-expanded', 'false');
      bell.innerHTML = '<span class="zb-bell-in"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><b></b></span>';
      bell.addEventListener('click', () => { buzz(); if (openSheet && openSheet.id === 'zb-more') closeSheet(); else showMore(); });
      document.body.appendChild(bell);
      updateBell(); syncTabs();

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
      /* 篩選條件打開時，小助手按鈕先收起來：不然捲動停下後它會回到右下角，正好蓋在右邊的篩選按鈕上，點下去變成打開小助手 */
      const FSEL = 'section[aria-label="篩選"] > button[aria-expanded="true"], .zb-filter-head[aria-expanded="true"]';
      const syncFilter = () => root.classList.toggle('zb-filter-open', !!document.querySelector(FSEL));
      new MutationObserver(syncFilter).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-expanded'] });
      syncFilter();
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
    if (PAGE === 'index.html' && hasTabs && !ss.get('zb-pushed') && settings().due) {
      ss.set('zb-pushed', '1');
      if (unread().length) setTimeout(() => push(), document.getElementById('zb-loader') ? 6400 : 1600);
    }
    if (inFrame) { try { window.parent.postMessage({ zb: 'page', page: PAGE, title: TITLES[PAGE] || '' }, '*'); } catch (e) {} }
  }
  /* 在同一頁點到跳轉連結（例如補助頁的通知指向補助頁的某一項）：重新載入才會展開並對準 */
  window.addEventListener('hashchange', () => { if (/^#(a|b|d)-/.test(location.hash)) location.reload(); });
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.zb === 'push') push(d.id);
    if (d.zb === 'reset') F.reset();
    if (d.zb === 'replay') { try { sessionStorage.removeItem('zb-loaded'); sessionStorage.removeItem('zb-pushed'); } catch (x) {} location.href = 'index.html'; }
  });
  const refresh = () => { NOTI = F ? F.reminders() : []; updateBell(); };
  window.ZB = { push, toast, showNoti, showMore, sheet, closeSheet, buzz, refresh, feedback };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
