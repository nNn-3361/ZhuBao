/* 竹寶 AI：示範問答資料、歷史紀錄（最多 5 筆，存在這台裝置的瀏覽器），以及每頁右下角的浮動小助手。 */
(function () {
  const S = {
    dosi: ['衛福部社會保險司・生育補助', 'https://dep.mohw.gov.tw/DOSI/cp-3544-86293-102.html'],
    civil: ['新竹市民政處・生育津貼', 'https://dep-civil.hccg.gov.tw/ch/home.jsp?id=272&parentpath=0%2C4%2C51'],
    allow: ['新竹市政府・育兒津貼申辦公告', 'https://www.hccg.gov.tw/hccg/app/data/view?module=news&id=30122&serno=168fff14-5734-45d5-9823-44254b02e80c'],
    lawLow: ['新竹市低收入戶產婦及嬰兒營養費補助辦法', 'https://law.hccg.gov.tw/LawContent.aspx?id=FL086082'],
    cdc: ['疾管署・兒童預防接種時程', 'https://www.cdc.gov.tw/Category/Page/TxRW-x3WzvPhvEtxM628GA'],
    hpaPost: ['國健署・產後健康照護', 'https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=4996&pid=19790'],
    hpaChild: ['國健署・兒童預防保健', 'https://www.hpa.gov.tw/Pages/List.aspx?nodeid=202'],
    book: ['國健署・兒童健康手冊（內附嬰兒大便辨識卡）', 'https://www.mohw.gov.tw/cp-88-214-1.html']
  };
  const DEMO = {
    money: { q: '寶寶出生後，我可以領哪些補助？', keys: [['補助', '領'], ['補助', '哪些'], ['津貼', '哪些']],
      answer: '依你填的資料，有 4 項可能適用：2 筆生育補助、每月的育兒津貼，還有一項是低收入戶才有的營養費。實際資格以主管機關審核為準。',
      mine: '寶寶 2026/9/10 出生、第 2 胎、由自己或家人照顧。你填的地區是北區，但還沒確認父或母是否設籍新竹市，這會影響市府的生育津貼。',
      prepTitle: '竹寶幫你整理', prep: [
        '中央生育補助：每胎 10 萬元。有參加社會保險的人，依規定由保險人辦理給付，方式請看官方說明。',
        '新竹市生育津貼：每胎 3 萬元。父或母要設籍新竹市，向戶政事務所申請。',
        '育兒津貼：未滿 2 歲、自己或家人帶的寶寶可能適用，金額、資格與申辦方式請看市府公告。',
        '低收入戶產婦及嬰兒營養費：2 萬元，只限新竹市列冊低收入戶，要在 2026/12/10 前向區公所申請。'],
      next: [['看補助', 'benefits.html'], ['修改寶寶資料', 'setup.html']],
      srcs: [S.dosi, S.civil, S.allow, S.lawLow] },
    switch: { q: '送托之後，我的補助會怎麼變？', keys: [['送托'], ['托育補助']],
      answer: '送到準公共托嬰中心或保母後，可能改適用托育補助，育兒津貼和托育補助不會同時領，實際以社會處規定為準。',
      mine: '你填的是自己或家人帶寶寶，所以育兒津貼可能適用，托育補助可能不適用。打算送托時，可以先看北區的準公共托嬰中心名冊。',
      prepTitle: '送托前可以先做', prep: ['確認托育單位是不是「準公共」，這會影響托育補助。', '送托後依社會處規定提出托育補助申請。'],
      next: [['看托育', 'childcare.html'], ['看補助', 'benefits.html']],
      srcs: [['新竹市社會處・準公共化專區', 'https://society.hccg.gov.tw/ch/home.jsp?id=10330&parentpath=0%2C3%2C20']] },
    nursery: { q: '北區有哪些準公共托嬰中心？', keys: [['托嬰'], ['準公共']],
      answer: '北區的準公共托嬰中心都列在社會處的名冊上，例如新竹市私立茱蒂園托嬰中心。',
      mine: '你的戶籍在北區，托育頁會把北區排在前面。送準公共托嬰中心可能適用托育補助。',
      prepTitle: '', prep: [],
      next: [['看托育', 'childcare.html']],
      srcs: [['新竹市社會處・115 年準公共化托嬰中心名冊', 'https://society.hccg.gov.tw/ch/home.jsp?id=10330&parentpath=0%2C3%2C20']] },
  };
  const QA = {
    lowinc: { q: '低收入戶的產婦營養費要準備什麼？', keys: [['營養費'], ['低收入']],
      answer: '新竹市列冊低收入戶的產婦，每案可申請 2 萬元，要在寶寶出生後 3 個月內向區公所申請。',
      mine: '寶寶 9/10 出生，申請期限是 2026/12/10。你在設定時略過了這一題，如果是低收入戶，記得在期限前申請。',
      prepTitle: '帶到戶籍所在地的區公所', prep: ['申請書', '寶寶的新式戶口名簿影本與出生證明', '郵局存摺正面影本', '領款收據（請別人代辦要附委託書）'],
      next: [['看補助', 'benefits.html']],
      srcs: [S.lawLow] },
    weekend: { q: '這週末可以帶寶寶去哪？', keys: [['週末'], ['周末'], ['去哪']],
      answer: '這週六上午北區親子館有寶寶共讀，0 歲寶寶也能參加，免費但要先預約。',
      mine: '寶寶 2 個月，適合安靜、室內、可以推嬰兒車的地方。竹北遠百的聖誕樹展也在室內。',
      prepTitle: '', prep: [],
      next: [['看親子活動', 'activities.html']],
      srcs: [['新竹市托育資源中心親子館', 'https://wpcc.hccg.gov.tw/']] }
  };
  const ALL = Object.assign({}, DEMO, QA);
  const norm = (x) => String(x || '').replace(/[\s，。？?！!、,.]/g, '');
  function match(text) {
    const n = norm(text);
    if (!n) return null;
    for (const k of Object.keys(ALL)) if (norm(ALL[k].q) === n) return k;
    for (const k of Object.keys(ALL)) if (ALL[k].keys.some((ks) => ks.every((w) => n.indexOf(w) >= 0))) return k;
    return null;
  }

  /* 歷史問答：最多 5 筆，同一題再問一次會移到最上面。 */
  const HKEY = 'zb-ai-history';
  const MAX = 5;
  function history() {
    try {
      const v = JSON.parse(localStorage.getItem(HKEY) || '[]');
      return Array.isArray(v) ? v.filter((h) => h && typeof h.q === 'string').slice(0, MAX) : [];
    } catch (e) { return []; }
  }
  function remember(k, q) {
    const list = history().filter((h) => norm(h.q) !== norm(q));
    list.unshift({ k: ALL[k] ? k : null, q: String(q).slice(0, 120), t: Date.now() });
    try { localStorage.setItem(HKEY, JSON.stringify(list.slice(0, MAX))); } catch (e) {}
    return list.slice(0, MAX);
  }
  function clearHistory() { try { localStorage.removeItem(HKEY); } catch (e) {} return []; }
  function when(t) {
    const d = new Date(t), now = new Date();
    const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return d.toDateString() === now.toDateString() ? '今天 ' + hm : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hm;
  }

  /* 各頁先建議的問題 */
  const PAGES = {
    'index.html': ['主頁', ['money', 'switch', 'weekend']],
    'benefits.html': ['補助及其他福利', ['money', 'switch', 'lowinc']],
    'childcare.html': ['托育', ['nursery', 'switch', 'money']],
    'activities.html': ['親子活動', ['weekend', 'nursery', 'money']],
    'help.html': ['協助', ['money', 'switch', 'lowinc']]
  };

  window.ZBAI = { S, DEMO, QA, ALL, match, history, remember, clearHistory, when, MAX };

  /* ---------- 浮動小助手 ---------- */
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page === 'ask.html' || page === 'setup.html') return;
  const ctx = PAGES[page] || PAGES['index.html'];
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const LOGO = '<svg width="{s}" height="{s}" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="#2E5E4E"></circle><path class="zbf-sprout" d="M14 20V9M14 13c0-2.5 2-4 4.5-4M14 15.5c0-2.2-1.8-3.5-4-3.5" stroke="#F6F2EA" stroke-width="1.8" fill="none" stroke-linecap="round"></path></svg>';
  const logo = (s) => LOGO.replace(/\{s\}/g, s);

  const CSS = ''
    + '.zbf-fab{position:fixed;right:20px;bottom:20px;bottom:calc(20px + env(safe-area-inset-bottom));z-index:900;width:60px;height:60px;border-radius:999px;border:0;padding:0;background:#FCFAF6;box-shadow:0 6px 18px rgba(31,42,36,.18),0 0 0 1px #E4DED2;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .25s cubic-bezier(.23,1,.32,1),box-shadow .2s ease}'
    + '.zbf-fab svg{transition:transform .3s cubic-bezier(.23,1,.32,1)}'
    + '.zbf-fab .zbf-sprout{transform-origin:14px 20px;transform-box:view-box}'
    + '.zbf-fab:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(31,42,36,.22),0 0 0 1px #B9CDBF}'
    + '.zbf-fab:hover .zbf-sprout{animation:zbfSway .9s ease-in-out}'
    + '.zbf-fab:active{transform:scale(.9)}'
    + '.zbf-fab[aria-expanded="true"]{box-shadow:0 6px 18px rgba(31,42,36,.18),0 0 0 3px #8FC16F}'
    + '.zbf-fab:focus-visible{outline:2px solid #2E5E4E;outline-offset:3px}'
    + '.zbf-tip{position:absolute;right:70px;top:50%;transform:translateY(-50%) translateX(6px);background:#2E5E4E;color:#fff;font:600 13px/1 "Noto Sans TC",system-ui,sans-serif;padding:8px 12px;border-radius:999px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease}'
    + '.zbf-fab:hover .zbf-tip{opacity:1;transform:translateY(-50%) translateX(0)}'
    + '.zbf-fab[aria-expanded="true"] .zbf-tip{display:none}'
    + '@media (hover:none){.zbf-tip{display:none}}'
    + '.zbf-panel{position:fixed;z-index:901;width:360px;max-width:calc(100vw - 16px);height:520px;max-height:calc(100vh - 16px);max-height:calc(100dvh - 16px);display:flex;flex-direction:column;background:#F6F2EA;border:1px solid #E4DED2;border-radius:20px;box-shadow:0 18px 48px rgba(31,42,36,.22);overflow:hidden;font-family:"Noto Sans TC",system-ui,sans-serif;color:#1F2A24;box-sizing:border-box}'
    + '.zbf-panel[hidden]{display:none}'
    + '.zbf-panel.zbf-in{animation:zbfIn .28s cubic-bezier(.23,1,.32,1)}'
    + '.zbf-panel.zbf-dragging{box-shadow:0 24px 60px rgba(31,42,36,.3);transition:none}'
    + '.zbf-head{display:flex;align-items:center;gap:10px;padding:10px 8px 10px 14px;background:#FCFAF6;border-bottom:1px solid #E4DED2;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}'
    + '.zbf-head:active{cursor:grabbing}'
    + '.zbf-head:focus-visible{outline:2px solid #2E5E4E;outline-offset:-2px}'
    + '.zbf-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}'
    + '.zbf-title b{font-size:15px;font-weight:600}'
    + '.zbf-title span{font-size:12px;color:#5F6B64}'
    + '.zbf-grip{display:flex;flex-direction:column;gap:3px;padding:0 2px}'
    + '.zbf-grip i{display:block;width:14px;height:2px;border-radius:2px;background:#B9CDBF}'
    + '.zbf-ic{width:40px;height:40px;flex-shrink:0;border-radius:12px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;color:#5F6B64;cursor:pointer;text-decoration:none;transition:background .15s ease,transform .2s cubic-bezier(.23,1,.32,1)}'
    + '.zbf-ic:hover{background:#E4EEE7;color:#2E5E4E;transform:scale(1.08)}'
    + '.zbf-ic:active{transform:scale(.9)}'
    + '.zbf-ic:focus-visible{outline:2px solid #2E5E4E;outline-offset:0}'
    + '.zbf-body{position:relative;flex:1;overflow-y:auto;overscroll-behavior:contain;padding:14px;display:flex;flex-direction:column;gap:12px}'
    + '.zbf-bot{background:#FCFAF6;border:1px solid #E4DED2;border-radius:4px 16px 16px 16px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.7}'
    + '.zbf-bot p{margin:0}'
    + '.zbf-bot .zbf-ans{font-size:15px;font-weight:600;line-height:1.6}'
    + '.zbf-mine{background:#E4EEE7;border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:2px}'
    + '.zbf-mine b{font-size:12px;color:#2E5E4E}'
    + '.zbf-sub{font-size:12px;font-weight:600;color:#5F6B64}'
    + '.zbf-bot ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px}'
    + '.zbf-links{display:flex;flex-wrap:wrap;gap:6px}'
    + '.zbf-links a{min-height:36px;display:inline-flex;align-items:center;padding:0 12px;border-radius:12px;font-size:13px;font-weight:600;text-decoration:none;border:1px solid #2E5E4E;color:#2E5E4E;transition:transform .2s cubic-bezier(.23,1,.32,1),background .15s ease}'
    + '.zbf-links a:first-child{background:#2E5E4E;color:#fff}'
    + '.zbf-links a:hover{transform:translateY(-2px)}.zbf-links a:active{transform:scale(.95)}'
    + '.zbf-src{font-size:11px;color:#5F6B64;border-top:1px solid #E4DED2;padding-top:8px;display:flex;flex-wrap:wrap;gap:2px 10px}'
    + '.zbf-src a{color:#2E5E4E}'
    + '.zbf-me{align-self:flex-end;max-width:85%;background:#2E5E4E;color:#fff;border-radius:16px 16px 4px 16px;padding:9px 13px;font-size:14px;line-height:1.6;word-break:break-word}'
    + '.zbf-chips{display:flex;flex-direction:column;gap:6px}'
    + '.zbf-chip{min-height:40px;padding:8px 12px;border-radius:12px;border:1px solid #B9CDBF;background:#fff;color:#2E5E4E;font:600 13px/1.5 "Noto Sans TC",system-ui,sans-serif;text-align:left;cursor:pointer;transition:transform .2s cubic-bezier(.23,1,.32,1),background .15s ease,border-color .15s ease}'
    + '.zbf-chip:hover{background:#E4EEE7;border-color:#2E5E4E;transform:translateX(3px)}'
    + '.zbf-chip:active{transform:scale(.97)}'
    + '.zbf-chip:focus-visible{outline:2px solid #2E5E4E;outline-offset:2px}'
    + '.zbf-think{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#2E5E4E}'
    + '.zbf-dot{display:inline-block;width:7px;height:7px;border-radius:999px;background:#2E5E4E;animation:zbfDot 1.2s infinite ease-in-out}'
    + '.zbf-dot:nth-child(2){animation-delay:.2s}.zbf-dot:nth-child(3){animation-delay:.4s}'
    + '.zbf-form{display:flex;gap:6px;padding:10px;background:#FCFAF6;border-top:1px solid #E4DED2}'
    + '.zbf-form input{flex:1;min-width:0;height:44px;border:1px solid #E4DED2;border-radius:12px;background:#fff;padding:0 12px;font:16px "Noto Sans TC",system-ui,sans-serif;color:#1F2A24}'
    + '.zbf-form input:focus-visible{outline:2px solid #2E5E4E;outline-offset:0;border-color:#2E5E4E}'
    + '.zbf-form button{min-height:44px;padding:0 16px;border-radius:12px;border:0;background:#2E5E4E;color:#fff;font:600 14px "Noto Sans TC",system-ui,sans-serif;cursor:pointer;transition:transform .2s cubic-bezier(.23,1,.32,1),background .15s ease}'
    + '.zbf-form button:hover{background:#1F4337;transform:translateY(-2px)}.zbf-form button:active{transform:scale(.93)}'
    + '.zbf-form button:focus-visible{outline:2px solid #2E5E4E;outline-offset:2px}'
    + '.zbf-note{margin:0;padding:0 12px 10px;background:#FCFAF6;font-size:11px;line-height:1.5;color:#5F6B64}'
    + '.zbf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'
    + '@keyframes zbfIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}'
    + '@keyframes zbfSway{0%,100%{transform:rotate(0)}30%{transform:rotate(-14deg)}65%{transform:rotate(9deg)}}'
    + '@keyframes zbfDot{0%,80%,100%{opacity:.25}40%{opacity:1}}'
    + '@keyframes zbfPop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'
    + '.zbf-body>*{animation:zbfPop .25s ease-out}'
    + '@media (max-width:480px){.zbf-fab{right:14px;width:56px;height:56px}.zbf-panel{height:72vh;height:72dvh}}'
    + '@media print{.zbf-fab,.zbf-panel{display:none !important}}'
    + '@media (prefers-reduced-motion:reduce){.zbf-fab,.zbf-fab svg,.zbf-ic,.zbf-chip,.zbf-links a,.zbf-form button{transition:none !important}.zbf-fab:hover,.zbf-fab:active{transform:none}.zbf-fab .zbf-sprout,.zbf-panel.zbf-in,.zbf-body>*,.zbf-dot{animation:none !important}.zbf-dot{opacity:.6}}';

  function h(tag, attrs, kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k of Object.keys(attrs)) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach((c) => c && el.appendChild(c));
    return el;
  }

  function mount() {
    const style = h('style', { text: CSS });
    document.head.appendChild(style);

    const fab = h('button', { type: 'button', class: 'zbf-fab', 'aria-label': '問竹寶 AI 小助手', 'aria-expanded': 'false', 'aria-controls': 'zbf-panel', html: logo(44) + '<span class="zbf-tip" aria-hidden="true">問竹寶</span>' });
    const body = h('div', { class: 'zbf-body', 'aria-live': 'polite' });
    const input = h('input', { id: 'zbf-input', type: 'text', autocomplete: 'off', enterkeyhint: 'send', placeholder: '輸入問題…' });
    const form = h('form', { class: 'zbf-form' }, [
      h('label', { for: 'zbf-input', class: 'zbf-sr', text: '輸入問題' }), input,
      h('button', { type: 'submit', text: '送出' })
    ]);
    const head = h('div', { class: 'zbf-head', tabindex: '0', role: 'group', 'aria-label': '對話窗標題列。按住拖曳可以移動，也可以用方向鍵移動' }, [
      h('span', { class: 'zbf-grip', 'aria-hidden': 'true', html: '<i></i><i></i><i></i>' }),
      h('span', { html: logo(30), style: 'display:flex' }),
      h('span', { class: 'zbf-title' }, [h('b', { text: '問竹寶' }), h('span', { text: '按住這裡可以拖曳' })]),
      h('a', { class: 'zbf-ic', href: 'ask.html', 'aria-label': '打開完整的問竹寶頁', title: '打開完整的問竹寶頁', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>' }),
      h('button', { type: 'button', class: 'zbf-ic', 'aria-label': '關閉對話窗', title: '關閉', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' })
    ]);
    const full = head.querySelector('a');
    const closeBtn = head.querySelector('button');
    const panel = h('section', { id: 'zbf-panel', class: 'zbf-panel', role: 'dialog', 'aria-label': '竹寶 AI 小助手', hidden: '' }, [
      head, body, form,
      h('p', { class: 'zbf-note', text: 'AI 只負責白話說明，資格以主管機關審核為準。緊急狀況請撥 119。' })
    ]);
    document.body.appendChild(panel);
    document.body.appendChild(fab);
    if (window.matchMedia('(max-width: 760px)').matches) document.body.style.paddingBottom = '84px';

    /* ---- 對話 ---- */
    let timer = null, started = false;
    const scrollEnd = () => { body.scrollTop = body.scrollHeight; };
    const chips = (keys) => h('div', { class: 'zbf-chips' }, keys.map((k) => h('button', { type: 'button', class: 'zbf-chip', text: ALL[k].q, onclick: () => ask(k, ALL[k].q) })));
    function botCard(kids) {
      const head2 = h('div', { style: 'display:flex;align-items:center;gap:6px', html: logo(20) + '<span style="font-size:12px;font-weight:600;color:#2E5E4E">竹寶</span>' });
      return h('article', { class: 'zbf-bot', 'aria-label': '竹寶' }, [head2].concat(kids));
    }
    function welcome() {
      body.appendChild(botCard([
        h('p', { text: '嗨，我是竹寶。你正在看「' + ctx[0] + '」，先幫你挑了這幾題，點一下就能問：' }),
        chips(ctx[1])
      ]));
    }
    function answerCard(k) {
      const a = ALL[k];
      const kids = [h('p', { class: 'zbf-ans', text: a.answer }),
        h('div', { class: 'zbf-mine' }, [h('b', { text: '你的情況' }), h('span', { text: a.mine })])];
      if (a.prep.length) kids.push(h('div', null, [h('div', { class: 'zbf-sub', text: a.prepTitle }), h('ul', null, a.prep.map((p) => h('li', { text: p })))]));
      kids.push(h('div', { class: 'zbf-links' }, a.next.map((n) => h('a', { href: n[1], text: n[0] }))));
      kids.push(h('div', { class: 'zbf-src' }, [h('span', { text: '來源：' })].concat(a.srcs.map((s) => h('a', { href: s[1], target: '_blank', rel: 'noopener', text: s[0] })))));
      return botCard(kids);
    }
    function ask(k, text) {
      if (timer) { clearTimeout(timer); const t = body.querySelector('.zbf-thinking'); if (t) t.remove(); }
      body.appendChild(h('div', { class: 'zbf-me', text: text }));
      const think = botCard([h('div', { class: 'zbf-think', html: '竹寶正在整理答案 <span aria-hidden="true" style="display:inline-flex;gap:4px"><span class="zbf-dot"></span><span class="zbf-dot"></span><span class="zbf-dot"></span></span>' })]);
      think.classList.add('zbf-thinking');
      think.setAttribute('role', 'status');
      body.appendChild(think);
      scrollEnd();
      remember(k, text);
      if (k) full.href = 'ask.html?k=' + encodeURIComponent(k);
      timer = setTimeout(() => {
        timer = null;
        think.remove();
        const card = k ? answerCard(k) : botCard([h('p', { text: '這題竹寶還在學習中。這個 Demo 版先準備了下面幾題，點一下就能看竹寶怎麼回答：' }), chips(Object.keys(DEMO))]);
        body.appendChild(card);
        body.scrollTop = Math.max(0, card.offsetTop - 14);
      }, reduced() ? 500 : 1300);
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      ask(match(text), text);
    });

    /* ---- 位置與拖曳：永遠留在畫面內 ---- */
    const PKEY = 'zb-ai-pos';
    const M = 8;
    let pos = null;
    try { pos = JSON.parse(sessionStorage.getItem(PKEY) || 'null'); } catch (e) { pos = null; }
    function clamp(x, y) {
      const w = panel.offsetWidth, ht = panel.offsetHeight;
      const vw = document.documentElement.clientWidth, vh = window.innerHeight;
      return { x: Math.round(Math.min(Math.max(M, x), Math.max(M, vw - w - M))), y: Math.round(Math.min(Math.max(M, y), Math.max(M, vh - ht - M))) };
    }
    function place(x, y, save) {
      const p = clamp(x, y);
      panel.style.left = p.x + 'px';
      panel.style.top = p.y + 'px';
      pos = p;
      if (save) { try { sessionStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} }
    }
    function defaultPos() {
      const vw = document.documentElement.clientWidth, vh = window.innerHeight;
      const w = panel.offsetWidth, ht = panel.offsetHeight;
      const narrow = vw <= 480;
      return { x: narrow ? (vw - w) / 2 : vw - w - 20, y: vh - ht - (narrow ? 84 : 92) };
    }
    let drag = null;
    head.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('a,button')) return;
      drag = { id: e.pointerId, dx: e.clientX - panel.offsetLeft, dy: e.clientY - panel.offsetTop };
      try { head.setPointerCapture(e.pointerId); } catch (err) {}
      panel.classList.add('zbf-dragging');
      e.preventDefault();
    });
    head.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      place(e.clientX - drag.dx, e.clientY - drag.dy, false);
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      panel.classList.remove('zbf-dragging');
      place(pos.x, pos.y, true);
    };
    head.addEventListener('pointerup', endDrag);
    head.addEventListener('pointercancel', endDrag);
    head.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 40 : 12;
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!d || e.target !== head) return;
      e.preventDefault();
      place(panel.offsetLeft + d[0], panel.offsetTop + d[1], true);
    });
    window.addEventListener('resize', () => { if (!panel.hidden && pos) place(pos.x, pos.y, false); });

    /* ---- 開關 ---- */
    function open() {
      panel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      if (!started) { started = true; welcome(); }
      const p = pos || defaultPos();
      place(p.x, p.y, false);
      const r = panel.getBoundingClientRect(), b = fab.getBoundingClientRect();
      panel.style.transformOrigin = (b.left + b.width / 2 - r.left) + 'px ' + (b.top + b.height / 2 - r.top) + 'px';
      if (!reduced()) { panel.classList.remove('zbf-in'); void panel.offsetWidth; panel.classList.add('zbf-in'); }
      if (window.matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true });
    }
    function close(returnFocus) {
      panel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
      if (returnFocus) fab.focus();
    }
    fab.addEventListener('click', () => (panel.hidden ? open() : close(false)));
    closeBtn.addEventListener('click', () => close(true));
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(true); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
