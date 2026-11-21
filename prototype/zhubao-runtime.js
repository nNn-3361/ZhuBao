/* 竹寶 Demo 的小型渲染器：讀取 <template id="dc-tpl">，依 Component.renderVals() 的資料填入畫面。 */
(function () {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) { Object.assign(this.state, patch); render(); }
  }
  window.DCLogic = DCLogic;
  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  function evalExpr(expr, scope) {
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    let v = scope;
    for (const part of expr.split('.')) { if (v == null) return undefined; v = v[part]; }
    return v;
  }
  const interp = (str, scope) => str.replace(HOLE, (_, e) => { const v = evalExpr(e, scope); return v == null ? '' : String(v); });
  function renderNode(node, scope) {
    if (node.nodeType === 3) return [document.createTextNode(node.nodeValue.indexOf('{{') >= 0 ? interp(node.nodeValue, scope) : node.nodeValue)];
    if (node.nodeType !== 1) return [];
    const tag = node.localName;
    if (tag === 'sc-for') {
      const list = evalExpr(WHOLE.exec(node.getAttribute('list'))[1], scope) || [];
      const as = node.getAttribute('as');
      const out = [];
      list.forEach((item) => { const sc = Object.create(scope); sc[as] = item; node.childNodes.forEach((c) => out.push(...renderNode(c, sc))); });
      return out;
    }
    if (tag === 'sc-if') {
      const v = evalExpr(WHOLE.exec(node.getAttribute('value'))[1], scope);
      if (!v) return [];
      const out = []; node.childNodes.forEach((c) => out.push(...renderNode(c, scope))); return out;
    }
    const el = node.cloneNode(false);
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name, val = attr.value;
      if (name.indexOf('hint-') === 0) { el.removeAttribute(name); continue; }
      if (val.indexOf('{{') < 0) continue;
      const whole = WHOLE.exec(val);
      if (/^on/i.test(name)) {
        el.removeAttribute(name);
        const fn = whole ? evalExpr(whole[1], scope) : null;
        if (typeof fn === 'function') (el.__zb || (el.__zb = {}))[name.slice(2).toLowerCase()] = fn;
        continue;
      }
      el.setAttribute(name, interp(val, scope));
    }
    const kids = node.localName === 'template' ? node.content.childNodes : node.childNodes;
    kids.forEach((c) => renderNode(c, scope).forEach((n) => el.appendChild(n)));
    return [el];
  }
  /* 開啟網站時的載入畫面：約 5 秒，隨機顯示一句給爸媽的話。同一次瀏覽切換分頁不會再出現。 */
  const QUOTES = [
    '你不需要當完美的爸媽。寶寶需要的是你，不是完美。',
    '累了就休息一下。照顧好自己，也是在照顧寶寶。',
    '今天也辛苦了，你做得比你想像的還要好。',
    '開口求助不是失敗，是愛寶寶也愛自己的選擇。',
    '每個寶寶都有自己的步調，爸媽也是。慢慢來就好。'
  ];
  const LOADER_MS = 5000;
  function showLoader() {
    let seen = false;
    try { seen = sessionStorage.getItem('zb-loaded') === '1'; sessionStorage.setItem('zb-loaded', '1'); } catch (e) { seen = false; }
    if (seen) return;
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const css = document.createElement('style');
    css.textContent = '#zb-loader{position:fixed;inset:0;z-index:9999;background:#F6F2EA;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:"Noto Sans TC",system-ui,sans-serif;color:#1F2A24;transition:opacity .4s ease}'
      + '#zb-loader .zb-card{max-width:520px;width:100%;display:flex;flex-direction:column;align-items:center;gap:28px;text-align:center}'
      + '#zb-loader .zb-seg{fill:#5E8F73;transform-box:fill-box;transform-origin:bottom;animation:zbGrow .55s cubic-bezier(.23,1,.32,1) both}'
      + '#zb-loader .zb-nd{fill:#2E5E4E;transform-box:fill-box;transform-origin:center;animation:zbPop .35s ease-out both}'
      + '#zb-loader .s1{animation-delay:.1s}#zb-loader .n1{animation-delay:.55s}#zb-loader .s2{animation-delay:.6s}#zb-loader .n2{animation-delay:1.05s}#zb-loader .s3{animation-delay:1.1s}'
      + '#zb-loader .zb-lf{fill:#8FC16F;transform-box:fill-box;animation:zbPop .4s ease-out both,zbLeaf 2.6s ease-in-out infinite}'
      + '#zb-loader .l1{transform-origin:left center;animation-delay:1.5s,1.9s}#zb-loader .l2{transform-origin:right center;animation-delay:1.7s,2.1s}#zb-loader .l3{transform-origin:left bottom;animation-delay:1.9s,2.3s}'
      + '#zb-loader blockquote{margin:0;font-size:24px;line-height:1.7;font-weight:600;letter-spacing:.02em}'
      + '#zb-loader .zb-for{font-size:14px;color:#5F6B64;margin-top:-16px}'
      + '#zb-loader .zb-track{width:200px;height:4px;border-radius:999px;background:#E4DED2;overflow:hidden}'
      + '#zb-loader .zb-bar{height:4px;width:0;background:#2E5E4E;border-radius:999px;animation:zbFill ' + LOADER_MS + 'ms linear forwards}'
      + '@keyframes zbFill{to{width:100%}}@keyframes zbGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes zbPop{from{transform:scale(0)}to{transform:scale(1)}}@keyframes zbLeaf{0%,100%{transform:rotate(0)}50%{transform:rotate(-12deg)}}'
      + '@media (max-width:480px){#zb-loader blockquote{font-size:20px}}'
      + '@media (prefers-reduced-motion:reduce){#zb-loader svg *{animation:none !important}}';
    document.head.appendChild(css);
    const ov = document.createElement('div');
    ov.id = 'zb-loader';
    ov.setAttribute('role', 'status');
    ov.innerHTML = '<div class="zb-card">'
      + '<svg class="zb-grow" width="84" height="132" viewBox="0 0 84 132" aria-hidden="true">'
      + '<rect class="zb-seg s1" x="36" y="88" width="12" height="40" rx="2"/><rect class="zb-nd n1" x="32" y="85" width="20" height="6" rx="3"/>'
      + '<rect class="zb-seg s2" x="36" y="50" width="12" height="38" rx="2"/><rect class="zb-nd n2" x="32" y="47" width="20" height="6" rx="3"/>'
      + '<rect class="zb-seg s3" x="36" y="14" width="12" height="36" rx="6"/>'
      + '<g class="zb-lf l1"><path d="M48 50C56 38 72 34 82 38C74 48 60 52 48 50Z"/></g>'
      + '<g class="zb-lf l2"><path d="M36 88C28 76 12 72 2 76C10 86 24 90 36 88Z"/></g>'
      + '<g class="zb-lf l3"><path d="M48 22C54 10 66 4 76 6C70 16 60 22 48 22Z"/></g>'
      + '</svg>'
      + '<blockquote></blockquote>'
      + '<div class="zb-for">給辛苦的爸媽・竹寶</div>'
      + '<div class="zb-track" aria-hidden="true"><div class="zb-bar"></div></div>'
      + '</div>';
    ov.querySelector('blockquote').textContent = quote;
    document.body.appendChild(ov);
    let closed = false;
    const close = () => { if (closed) return; closed = true; ov.style.opacity = '0'; setTimeout(() => { ov.remove(); css.remove(); }, 400); };
    setTimeout(close, LOADER_MS);
  }
  let comp = null, tpl = null, root = null;
  /* 更新畫面時只改有變的地方，不整頁重建：已開的卡片不會重播動畫，竹葉、發光也不會被打斷。 */
  const ANIM_SEL = '.zb-acc-body, .zb-bam-panel, .zb-anim';
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute('data-k') : null);
  const same = (a, b) => a.nodeType === b.nodeType && (a.nodeType !== 1 || (a.localName === b.localName && keyOf(a) === keyOf(b)));
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  function frames(el) {
    const cs = getComputedStyle(el);
    return { height: cs.height, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom };
  }
  function bringIntoView(el) {
    const box = el.getBoundingClientRect();
    const head = el.classList.contains('zb-bam-panel') && el.previousElementSibling ? el.previousElementSibling.getBoundingClientRect() : (el.closest('.zb-acc') || el).getBoundingClientRect();
    const tabs = document.querySelector('.zb-tabs');
    const inset = tabs && getComputedStyle(tabs).display !== 'none' ? tabs.offsetHeight : 0; /* 手機底部分頁列會蓋住的高度 */
    const over = box.bottom - (window.innerHeight - inset) + 16;
    if (over <= 0) return;
    const by = Math.min(over, head.top - 72);
    if (by > 0) window.scrollBy({ top: by, behavior: reduced() ? 'auto' : 'smooth' });
  }
  /* 竹節展開／收起：不再逐格改高度（高的竹節裡有很多卡片，每一格都要重排整頁，手機上會卡一下）。
     版面一次到位，再用 transform 把下面的內容從舊位置滑到新位置，竹節內容用 clip-path 露出或收進去。
     這兩種動畫都交給 GPU，不用重排版面。 */
  const BAM_MS = 300;
  function around(el, dir) {
    const out = [];
    const key = dir > 0 ? 'nextElementSibling' : 'previousElementSibling';
    for (let n = el; n && n !== root; n = n.parentElement) {
      for (let s = n[key]; s; s = s[key]) {
        if (s.__leaving) continue;
        const p = getComputedStyle(s).position;
        if (p !== 'fixed' && p !== 'sticky' && p !== 'absolute') out.push(s);
      }
    }
    return out;
  }
  const followers = (el) => around(el, 1);
  function slide(list, from) {
    list.forEach((s) => s.animate([{ transform: 'translateY(' + from + 'px)' }, { transform: 'translateY(0)' }], { duration: BAM_MS, easing: EASE, composite: 'add' }));
  }
  /* 竹節實際佔掉的高度：本身高度加上排版的間距（gap） */
  function span(el) {
    const cs = el.parentElement ? getComputedStyle(el.parentElement) : null;
    const g = cs && /flex|grid/.test(cs.display) ? parseFloat(cs.rowGap) || 0 : 0;
    const m = getComputedStyle(el);
    return el.offsetHeight + g + (parseFloat(m.marginTop) || 0) + (parseFloat(m.marginBottom) || 0);
  }
  function bamEnter(el) {
    const H = span(el);
    if (!H) return;
    slide(followers(el), -H);
    const a = el.animate([{ clipPath: 'inset(0 0 100% 0)', opacity: 0.4 }, { clipPath: 'inset(0 0 0% 0)', opacity: 1 }], { duration: BAM_MS, easing: EASE });
    a.onfinish = () => { if (anchoring) pendingView = el; else bringIntoView(el); };
  }
  function bamLeave(el) {
    el.__leaving = true;
    const H = span(el);
    const par = el.parentElement;
    if (!H || !par) { el.remove(); return; }
    if (getComputedStyle(par).position === 'static') { par.style.position = 'relative'; par.__zbRel = (par.__zbRel || 0) + 1; }
    const top = el.offsetTop, left = el.offsetLeft, w = el.offsetWidth;
    const after = followers(el);
    /* 點的是下面另一個竹節：被點的按鈕要留在手指底下。先把捲動位置往上補回竹節的高度，
       讓上面的內容往下滑、竹節從上往下收，按鈕不動 */
    const hold = anchor && after.some((f) => f.contains(anchor.el)) ? anchor : null;
    const before = hold ? around(el, -1) : [];
    /* 竹節拿出版面時頁面會一下子變短，瀏覽器會把捲動位置往上拉、畫面跳一下。
       先在頁尾補一段一樣高的空白，再依需要跟著動畫慢慢收掉 */
    const y0 = window.scrollY;
    const pad = document.createElement('div');
    pad.style.height = H + 'px';
    document.body.appendChild(pad);
    Object.assign(el.style, { position: 'absolute', top: top + 'px', left: left + 'px', width: w + 'px', pointerEvents: 'none', margin: '0' });
    window.scrollTo(0, hold ? Math.max(0, y0 - H) : y0);
    const dS = hold ? y0 - window.scrollY : 0;
    if (hold) anchor = null;
    const lack = Math.ceil(window.scrollY - (document.documentElement.scrollHeight - H - window.innerHeight));
    let padLive = lack > 0;
    if (padLive) {
      pad.style.height = lack + 'px';
      pad.animate([{ height: lack + 'px' }, { height: '0px' }], { duration: BAM_MS, easing: EASE, fill: 'forwards' });
    } else pad.remove();
    if (dS) slide(before, -dS);
    slide(after, H - dS);
    const a = el.animate([
      { transform: 'translateY(' + -dS + 'px)', clipPath: 'inset(0px 0 0px 0)', opacity: 1 },
      { transform: 'translateY(' + -dS + 'px)', clipPath: 'inset(' + dS + 'px 0 ' + (H - dS) + 'px 0)', opacity: 0.4 }
    ], { duration: BAM_MS, easing: EASE, fill: 'forwards' });
    a.onfinish = () => {
      el.remove();
      if (padLive) pad.remove();
      if (par.__zbRel && --par.__zbRel === 0) par.style.position = '';
    };
  }
  function enter(el) {
    if (el.nodeType === 1 && el.classList.contains('zb-bam-panel') && !reduced()) { bamEnter(el); return; }
    if (el.nodeType !== 1 || !el.matches(ANIM_SEL) || reduced()) return;
    const f = frames(el);
    el.style.overflow = 'hidden';
    const a = el.animate([
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
      { height: f.height, paddingTop: f.paddingTop, paddingBottom: f.paddingBottom, opacity: 1 }
    ], { duration: 320, easing: EASE });
    /* 篩選條件打開時不自動捲動：原本展開後約 0.5 秒頁面會自己往上捲 100–200px，
       家長這時去點選項，按鈕剛好從手指底下移走，看起來像「點中間沒反應、要點下面一點」 */
    const still = el.closest('section[aria-label="篩選"], .zb-filter');
    a.onfinish = () => { el.style.overflow = ''; if (still) return; if (anchoring) pendingView = el; else bringIntoView(el); };
  }
  function leave(el) {
    /* 卡片詳情面板：往下滑出去再移除（只動 transform，不重排版面） */
    if (el.nodeType === 1 && el.classList.contains('zb-csheet')) {
      if (el.__leaving) return;
      el.__leaving = true;
      if (reduced() || el.__instant) { el.remove(); return; }
      el.classList.add('zb-closing');
      setTimeout(() => el.remove(), 200);
      return;
    }
    if (el.nodeType === 1 && el.classList.contains('zb-bam-panel') && !reduced() && !el.__leaving) { bamLeave(el); return; }
    if (el.nodeType !== 1 || !el.matches(ANIM_SEL) || reduced() || el.__leaving) { el.remove(); return; }
    el.__leaving = true;
    const f = frames(el);
    el.style.overflow = 'hidden';
    el.style.pointerEvents = 'none';
    const a = el.animate([
      { height: f.height, paddingTop: f.paddingTop, paddingBottom: f.paddingBottom, opacity: 1 },
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }
    ], { duration: 240, easing: EASE, fill: 'forwards' });
    a.onfinish = () => el.remove();
  }
  function morph(o, n) {
    if (o.nodeType === 3) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
    for (const at of Array.from(o.attributes)) if (!n.hasAttribute(at.name)) o.removeAttribute(at.name);
    for (const at of Array.from(n.attributes)) if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value);
    o.__zb = n.__zb;
    if (o.hasAttribute('data-zb-static')) return; /* 這個區塊由其他程式自己管理內容（例如主頁的最新消息輪播），不要覆蓋 */
    morphChildren(o, n);
  }
  function morphChildren(op, np) {
    const olds = Array.from(op.childNodes).filter((x) => !x.__leaving);
    const news = Array.from(np.childNodes);
    const newKeys = new Set(news.map(keyOf).filter(Boolean));
    let oi = 0, last = null;
    for (const n of news) {
      let o = olds[oi];
      while (o && !same(o, n)) {
        const k = keyOf(n);
        if (k) {
          let j = -1;
          for (let x = oi + 1; x < olds.length; x++) if (same(olds[x], n)) { j = x; break; }
          if (j > 0) { for (let x = oi; x < j; x++) leave(olds[x]); oi = j; o = olds[oi]; }
          else o = null;
          break;
        }
        if (keyOf(o) && newKeys.has(keyOf(o))) { o = null; break; }
        leave(o); oi += 1; o = olds[oi];
      }
      if (o) { morph(o, n); last = o; oi += 1; }
      else {
        op.insertBefore(n, olds[oi] || (last ? last.nextSibling : op.firstChild));
        enter(n); last = n;
      }
    }
    for (let x = oi; x < olds.length; x++) leave(olds[x]);
  }
  /* 點擊時把被點的按鈕固定在畫面上同一個位置，上方內容收合時頁面不會跳。 */
  let anchor = null, anchoring = false, pendingView = null;
  function holdAnchor() {
    if (!anchor || !anchor.el.isConnected) { anchor = null; return; }
    const a = anchor; anchor = null; anchoring = true;
    const until = performance.now() + 380;
    const step = () => {
      if (a.el.isConnected) {
        const d = a.el.getBoundingClientRect().top - a.top;
        if (Math.abs(d) > 0.5) window.scrollBy(0, d);
      }
      if (performance.now() < until) requestAnimationFrame(step);
      else { anchoring = false; if (pendingView) { const v = pendingView; pendingView = null; bringIntoView(v); } }
    };
    requestAnimationFrame(step);
  }
  function delegate(type) {
    document.addEventListener(type, (e) => {
      for (let el = e.target; el && el !== document; el = el.parentNode) {
        if (el.__zb && el.__zb[type]) {
          if (type === 'click') anchor = { el, top: el.getBoundingClientRect().top };
          el.__zb[type](e); anchor = null; return;
        }
      }
    });
  }
  /* ---------- 卡片詳情的底部面板 ----------
     頁面在模板最後放一個 .zb-csheet（補助、托育、活動）。點卡片時細節從下方滑上來，原本的列表完全不動；
     長內容在面板裡捲動。往下拉、點背景、按「完成」、按 Esc、按返回鍵（Android 返回、iOS 邊緣滑動）都會關閉。 */
  let cs = null, csHist = false, csSkip = false, csFocus = null;
  const csClose = (el) => { const b = el && el.querySelector('[data-sheet-close]'); if (b) b.click(); };
  window.addEventListener('popstate', () => {
    if (csSkip) { csSkip = false; return; }
    if (cs) { csHist = false; csClose(cs); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cs) csClose(cs); });
  function csDrag(el) {
    const panel = el.querySelector('.zb-sheet-panel');
    const back = el.querySelector('.zb-sheet-back');
    let y0 = null, t0 = 0, dy = 0, id = null;
    panel.addEventListener('pointerdown', (e) => {
      const onHead = e.target.closest('.zb-sheet-head, .zb-grab');
      if (e.button > 0 || (!onHead && panel.scrollTop > 0) || e.target.closest('button, a, input, select, textarea')) return;
      y0 = e.clientY; t0 = performance.now(); dy = 0; id = e.pointerId;
    });
    panel.addEventListener('pointermove', (e) => {
      if (y0 == null || e.pointerId !== id) return;
      dy = Math.max(0, e.clientY - y0);
      if (dy > 4) {
        panel.style.animation = 'none'; panel.style.transition = 'none';
        panel.style.transform = 'translate3d(0,' + dy + 'px,0)';
        back.style.animation = 'none'; back.style.opacity = String(Math.max(0, 1 - dy / 400));
      }
    });
    const end = () => {
      if (y0 == null) return;
      const v = dy / Math.max(1, performance.now() - t0);
      y0 = null;
      if (dy > 110 || (dy > 30 && v > 0.6)) {
        el.__instant = true;
        panel.style.transition = 'transform .2s ease-in'; panel.style.transform = 'translate3d(0,100%,0)';
        back.style.transition = 'opacity .2s ease-in'; back.style.opacity = '0';
        setTimeout(() => csClose(el), 190);
      } else if (dy > 0) {
        panel.style.transition = 'transform .3s cubic-bezier(.23,1,.32,1)'; panel.style.transform = '';
        back.style.transition = 'opacity .3s ease'; back.style.opacity = '';
      }
    };
    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }
  function syncCardSheet() {
    const el = root.querySelector('.zb-csheet:not(.zb-closing)');
    const html = document.documentElement;
    if (el && !cs) {
      cs = el;
      const a = document.activeElement;
      csFocus = a && a !== document.body && root.contains(a) && !el.contains(a) ? a : null;
      html.classList.add('zb-csheet-open');
      html.style.overflow = 'hidden';
      csDrag(el);
      const panel = el.querySelector('.zb-sheet-panel');
      if (panel) panel.focus({ preventScroll: true });
      try { history.pushState({ zbCard: 1 }, ''); csHist = true; } catch (e) { csHist = false; }
    } else if (el && el !== cs) {
      cs = el; csDrag(el);
    } else if (!el && cs) {
      cs = null;
      html.classList.remove('zb-csheet-open');
      html.style.overflow = '';
      if (csHist) { csHist = false; csSkip = true; try { history.back(); } catch (e) { csSkip = false; } }
      if (csFocus && csFocus.isConnected) csFocus.focus({ preventScroll: true });
      csFocus = null;
    }
  }
  let first = true;
  function render() {
    const vals = comp.renderVals();
    const frag = document.createDocumentFragment();
    tpl.content.childNodes.forEach((c) => renderNode(c, vals).forEach((n) => frag.appendChild(n)));
    if (first) { root.replaceChildren(frag); first = false; syncCardSheet(); return; }
    morphChildren(root, frag);
    holdAnchor();
    syncCardSheet();
  }
  ['click', 'submit', 'input', 'change'].forEach(delegate);
  try { document.documentElement.style.overflowAnchor = 'none'; } catch (e) {}
  window.addEventListener('DOMContentLoaded', () => {
    tpl = document.getElementById('dc-tpl');
    root = document.getElementById('dc-root');
    comp = new window.Component({});
    render();
    showLoader();
    document.addEventListener('touchstart', function () {}, { passive: true });
    /* 大區塊（展開卡片、整列連結、大按鈕）按下時不縮放，只淡淡變色；小按鈕保留彈一下 */
    const big = document.createElement('style');
    big.textContent = '.zb-big:active,.zb-acc-head:active{transform:none !important;box-shadow:none !important;opacity:.78}'
      + '.zb-big,.zb-acc-head{transition:opacity .15s ease,background-color .2s ease,color .2s ease !important}'
      + 'button:focus:not(:focus-visible),a:focus:not(:focus-visible){outline:none}';
    document.head.appendChild(big);
    document.addEventListener('pointerdown', (e) => {
      const el = e.target.closest && e.target.closest('button, a');
      if (!el || el.classList.contains('zb-big')) return;
      const r = el.getBoundingClientRect();
      if (r.width >= 200 || r.height >= 72) el.classList.add('zb-big');
    }, true);
  });
})();
