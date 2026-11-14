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
        if (typeof fn === 'function') el.addEventListener(name.slice(2).toLowerCase(), fn);
        continue;
      }
      el.setAttribute(name, interp(val, scope));
    }
    const kids = node.localName === 'template' ? node.content.childNodes : node.childNodes;
    kids.forEach((c) => renderNode(c, scope).forEach((n) => el.appendChild(n)));
    return [el];
  }
  /* 開啟網站時的載入畫面：約 7 秒，隨機顯示一句給爸媽的話。同一次瀏覽切換分頁不會再出現。 */
  const QUOTES = [
    '你不需要當完美的爸媽。寶寶需要的是你，不是完美。',
    '累了就休息一下。照顧好自己，也是在照顧寶寶。',
    '今天也辛苦了，你做得比你想像的還要好。',
    '開口求助不是失敗，是愛寶寶也愛自己的選擇。',
    '每個寶寶都有自己的步調，爸媽也是。慢慢來就好。'
  ];
  const LOADER_MS = 7000;
  function showLoader() {
    let seen = false;
    try { seen = sessionStorage.getItem('zb-loaded') === '1'; sessionStorage.setItem('zb-loaded', '1'); } catch (e) { seen = false; }
    if (seen) return;
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const css = document.createElement('style');
    css.textContent = '#zb-loader{position:fixed;inset:0;z-index:9999;background:#F6F2EA;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:"Noto Sans TC",system-ui,sans-serif;color:#1F2A24;transition:opacity .4s ease}'
      + '#zb-loader .zb-card{max-width:520px;width:100%;display:flex;flex-direction:column;align-items:center;gap:28px;text-align:center}'
      + '#zb-loader .zb-logo{animation:zbPulse 2.4s ease-in-out infinite}'
      + '#zb-loader blockquote{margin:0;font-size:24px;line-height:1.7;font-weight:600;letter-spacing:.02em}'
      + '#zb-loader .zb-for{font-size:14px;color:#5F6B64;margin-top:-16px}'
      + '#zb-loader .zb-track{width:200px;height:4px;border-radius:999px;background:#E4DED2;overflow:hidden}'
      + '#zb-loader .zb-bar{height:4px;width:0;background:#2E5E4E;border-radius:999px;animation:zbFill ' + LOADER_MS + 'ms linear forwards}'
      + '#zb-loader button{min-height:44px;padding:0 18px;border-radius:12px;border:1px solid #E4DED2;background:transparent;font:inherit;font-size:14px;color:#5F6B64;cursor:pointer}'
      + '#zb-loader button:focus-visible{outline:2px solid #2E5E4E;outline-offset:2px}'
      + '@keyframes zbFill{to{width:100%}}@keyframes zbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}'
      + '@media (max-width:480px){#zb-loader blockquote{font-size:20px}}'
      + '@media (prefers-reduced-motion:reduce){#zb-loader .zb-logo{animation:none}}';
    document.head.appendChild(css);
    const ov = document.createElement('div');
    ov.id = 'zb-loader';
    ov.setAttribute('role', 'status');
    ov.innerHTML = '<div class="zb-card">'
      + '<svg class="zb-logo" width="64" height="64" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="#2E5E4E"></circle><path d="M14 20V9M14 13c0-2.5 2-4 4.5-4M14 15.5c0-2.2-1.8-3.5-4-3.5" stroke="#F6F2EA" stroke-width="1.8" fill="none" stroke-linecap="round"></path></svg>'
      + '<blockquote></blockquote>'
      + '<div class="zb-for">給辛苦的爸媽・竹寶</div>'
      + '<div class="zb-track" aria-hidden="true"><div class="zb-bar"></div></div>'
      + '<button type="button">直接進入</button></div>';
    ov.querySelector('blockquote').textContent = quote;
    document.body.appendChild(ov);
    let closed = false;
    const close = () => { if (closed) return; closed = true; ov.style.opacity = '0'; setTimeout(() => { ov.remove(); css.remove(); }, 400); };
    const timer = setTimeout(close, LOADER_MS);
    ov.querySelector('button').addEventListener('click', () => { clearTimeout(timer); close(); });
  }
  let comp = null, tpl = null, root = null;
  function render() {
    const vals = comp.renderVals();
    const frag = document.createDocumentFragment();
    tpl.content.childNodes.forEach((c) => renderNode(c, vals).forEach((n) => frag.appendChild(n)));
    root.replaceChildren(frag);
  }
  window.addEventListener('DOMContentLoaded', () => {
    tpl = document.getElementById('dc-tpl');
    root = document.getElementById('dc-root');
    comp = new window.Component({});
    render();
    showLoader();
  });
})();
