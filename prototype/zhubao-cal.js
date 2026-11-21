/* 主頁行事曆：像手機行事曆的月曆。
   點日期看當天已關注的補助、活動和自己建立的事件；點補助或活動會跳到那一頁並對準那張卡片。
   左右滑或按箭頭換月。「新增事件」讓家長自己記其他事（托嬰中心報名、看醫生等）。 */
(function () {
  const F = window.ZBF;
  if (!F) return;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chev = '<svg class="zb-chevr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const toast = (t) => window.ZB && window.ZB.toast ? window.ZB.toast(t) : null;
  const buzz = () => window.ZB && window.ZB.buzz && window.ZB.buzz();
  const longDate = (d) => (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日（' + F.WK[d.getDay()] + '）';

  let root = null, view = null, sel = null;

  function render() {
    const T = F.today(), tKey = F.ymd(T);
    const all = F.calendar();
    const byDay = {};
    all.forEach((e) => { (byDay[e.date] = byDay[e.date] || []).push(e); });
    const first = new Date(view.y, view.m, 1);
    const start = F.addD(first, -first.getDay());
    const lastDay = new Date(view.y, view.m + 1, 0);
    const weeks = Math.ceil((first.getDay() + lastDay.getDate()) / 7);
    let cells = '';
    for (let i = 0; i < weeks * 7; i++) {
      const d = F.addD(start, i), k = F.ymd(d), evs = byDay[k] || [];
      const cls = ['zb-cal-d'];
      if (d.getMonth() !== view.m) cls.push('zb-out');
      if (k === tKey) cls.push('zb-now'); else if (d < T) cls.push('zb-past');
      const dots = evs.slice(0, 3).map((e) => '<i style="background:' + F.kidHex(e.kid) + '"></i>').join('') + (evs.length > 3 ? '<em>+</em>' : '');
      cells += '<button type="button" class="' + cls.join(' ') + '" data-day="' + k + '" aria-pressed="' + (k === sel) + '" aria-label="' + esc(longDate(d) + (k === tKey ? '，今天' : '') + (evs.length ? '，' + evs.length + ' 件事' : '')) + '">'
        + '<span class="zb-cal-n">' + d.getDate() + '</span><span class="zb-cal-dots" aria-hidden="true">' + dots + '</span></button>';
    }
    const legend = F.kids().map((k) => '<span><i class="zb-kdot" style="background:' + F.color(k.color).hex + '"></i>' + esc(k.name) + '</span>').join('')
      + '<span><i class="zb-kdot" style="background:' + F.FAMILY.hex + '"></i>全家</span>';
    const selD = F.parse(sel), list = byDay[sel] || [];
    const items = list.length ? list.map((e) => {
      const inner = '<span class="zb-ev-bar" style="background:' + F.kidHex(e.kid) + '"></span><span class="zb-ev-main"><span class="zb-ev-title">' + esc(e.title) + '</span><span class="zb-ev-sub">' + esc(e.sub) + '</span></span>' + chev;
      return e.href
        ? '<a class="zb-ev" href="' + esc(e.href) + '">' + inner + '</a>'
        : '<button type="button" class="zb-ev" data-ev="' + esc(e.id) + '">' + inner + '</button>';
    }).join('') : '<p class="zb-empty">這天沒有關注的事。在補助或活動按「關注」，日期就會出現在這裡；也可以按「新增事件」自己記。</p>';
    const upcoming = all.filter((e) => e.date > tKey);
    const nextTxt = !list.length && upcoming.length ? '<p class="zb-upnext">下一件：' + F.md(F.parse(upcoming[0].date)) + ' ' + esc(upcoming[0].title) + '</p>' : '';
    root.innerHTML = '<div class="zb-cal" aria-label="行事曆">'
      + '<div class="zb-cal-head"><span class="zb-cal-title" aria-live="polite">' + view.y + ' 年 ' + (view.m + 1) + ' 月</span>'
      + '<button type="button" class="zb-cal-today" data-act="today">今天</button>'
      + '<button type="button" class="zb-cal-nav" data-act="prev" aria-label="上個月">‹</button><button type="button" class="zb-cal-nav" data-act="next" aria-label="下個月">›</button></div>'
      + '<div class="zb-cal-grid">' + F.WK.map((w) => '<span class="zb-cal-w">' + w + '</span>').join('') + cells + '</div>'
      + '<div class="zb-cal-legend">' + legend + '</div></div>'
      + '<div class="zb-agenda"><div class="zb-agenda-head"><h3>' + longDate(selD) + (sel === tKey ? '・今天' : '') + '</h3><button type="button" class="zb-add" data-act="add">新增事件</button></div>' + items + nextTxt + '</div>';
  }

  function go(n) { const d = new Date(view.y, view.m + n, 1); view = { y: d.getFullYear(), m: d.getMonth() }; buzz(); render(); }

  /* 新增或修改自己的事件 */
  function editEvent(ev) {
    const e = ev || { title: '', date: sel, time: '', kid: F.current().id, note: '' };
    let kidPick = e.kid || '';
    const opts = F.kids().concat([{ id: '', name: '全家', color: null }]);
    const html = '<label class="zb-field"><span>要記什麼</span><input class="zb-input" id="ze-title" maxlength="40" placeholder="例如：托嬰中心報名、帶寶寶看醫生" value="' + esc(e.title) + '"></label>'
      + '<div style="display:flex;gap:10px"><label class="zb-field" style="flex:1.3"><span>日期</span><input class="zb-input" id="ze-date" type="date" value="' + esc(e.date) + '"></label>'
      + '<label class="zb-field" style="flex:1"><span>時間（選填）</span><input class="zb-input" id="ze-time" type="time" value="' + esc(e.time) + '"></label></div>'
      + '<div class="zb-field"><span>和誰有關</span><div class="zb-pick" id="ze-kid">' + opts.map((k) => '<button type="button" data-k="' + k.id + '" aria-pressed="' + (k.id === kidPick) + '"><i class="zb-kdot" style="background:' + F.kidHex(k.id) + '"></i>' + esc(k.name) + '</button>').join('') + '</div></div>'
      + '<label class="zb-field"><span>備註（選填）</span><textarea class="zb-input" id="ze-note" maxlength="200">' + esc(e.note) + '</textarea></label>'
      + '<div class="zb-sheet-actions">' + (ev ? '<button type="button" class="zb-btn-danger" data-act="del">刪除</button>' : '') + '<button type="button" class="zb-btn-main" data-act="save">' + (ev ? '儲存' : '加到行事曆') + '</button></div>';
    window.ZB.sheet('zb-evform', ev ? '修改事件' : '新增事件', html, (el) => {
      el.querySelectorAll('#ze-kid button').forEach((b) => b.addEventListener('click', () => {
        kidPick = b.getAttribute('data-k');
        el.querySelectorAll('#ze-kid button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      }));
      el.querySelector('[data-act="save"]').addEventListener('click', () => {
        const title = el.querySelector('#ze-title').value.trim(), date = el.querySelector('#ze-date').value;
        if (!title) { el.querySelector('#ze-title').focus(); toast('請先寫要記什麼'); return; }
        if (!date) { el.querySelector('#ze-date').focus(); toast('請選日期'); return; }
        F.saveEvent({ id: ev ? ev.id : '', title, date, time: el.querySelector('#ze-time').value, kid: kidPick, note: el.querySelector('#ze-note').value.trim() });
        sel = date; const d = F.parse(date); view = { y: d.getFullYear(), m: d.getMonth() };
        window.ZB.closeSheet(); render(); window.ZB.refresh && window.ZB.refresh(); toast(ev ? '已儲存' : '已加到行事曆'); buzz();
      });
      const del = el.querySelector('[data-act="del"]');
      if (del) del.addEventListener('click', () => { F.removeEvent(ev.id); window.ZB.closeSheet(); render(); window.ZB.refresh && window.ZB.refresh(); toast('已刪除'); buzz(); });
    });
  }
  function showEvent(id) {
    const e = F.events().find((x) => x.id === id);
    if (!e) return;
    const html = '<dl class="zb-detail"><dt>日期</dt><dd>' + esc(longDate(F.parse(e.date))) + (e.time ? ' ' + esc(e.time) : '') + '</dd>'
      + '<dt>和誰</dt><dd><i class="zb-kdot" style="background:' + F.kidHex(e.kid) + '"></i>' + esc(F.kidName(e.kid)) + '</dd>'
      + (e.note ? '<dt>備註</dt><dd>' + esc(e.note) + '</dd>' : '') + '</dl>'
      + '<p class="zb-follow-note" style="margin:0">日期前 7 天和前 1 天會提醒你。</p>'
      + '<div class="zb-sheet-actions"><button type="button" class="zb-btn-ghost" data-act="edit">修改</button></div>';
    window.ZB.sheet('zb-evshow', e.title, html, (el) => {
      el.querySelector('[data-act="edit"]').addEventListener('click', () => editEvent(e));
    });
  }

  function mount() {
    root = document.getElementById('zb-cal');
    if (!root) return;
    const T = F.today();
    const m = /^#d-(\d{4}-\d{2}-\d{2})$/.exec(location.hash);
    sel = m ? m[1] : F.ymd(T);
    const s = F.parse(sel);
    view = { y: s.getFullYear(), m: s.getMonth() };
    render();
    if (m) setTimeout(() => root.scrollIntoView({ block: 'start', behavior: 'auto' }), 60);
    root.addEventListener('click', (ev) => {
      const t = ev.target.closest('button,a');
      if (!t || !root.contains(t)) return;
      const day = t.getAttribute('data-day'), act = t.getAttribute('data-act'), id = t.getAttribute('data-ev');
      if (day) {
        sel = day; const d = F.parse(day);
        if (d.getMonth() !== view.m || d.getFullYear() !== view.y) view = { y: d.getFullYear(), m: d.getMonth() };
        buzz(); render();
      } else if (act === 'prev') go(-1);
      else if (act === 'next') go(1);
      else if (act === 'today') { sel = F.ymd(T); view = { y: T.getFullYear(), m: T.getMonth() }; buzz(); render(); }
      else if (act === 'add') editEvent(null);
      else if (id) showEvent(id);
    });
    /* 左右滑換月 */
    let x0 = null, y0 = null;
    root.addEventListener('pointerdown', (e) => { if (!e.target.closest('.zb-cal')) return; x0 = e.clientX; y0 = e.clientY; });
    root.addEventListener('pointerup', (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { root.__swiped = true; go(dx < 0 ? 1 : -1); setTimeout(() => { root.__swiped = false; }, 0); }
    });
    root.addEventListener('click', (e) => { if (root.__swiped) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  window.ZBCal = { render: () => root && render() };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0));
  else setTimeout(mount, 0);
})();
