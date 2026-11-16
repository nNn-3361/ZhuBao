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
      + '#zb-loader .zb-seg{fill:#5E8F73;transform-box:fill-box;transform-origin:bottom;animation:zbGrow .55s cubic-bezier(.34,1.56,.64,1) both}'
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
    document.addEventListener('touchstart', function () {}, { passive: true });
  });
})();
