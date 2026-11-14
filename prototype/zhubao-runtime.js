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
  });
})();
