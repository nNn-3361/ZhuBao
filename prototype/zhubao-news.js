/* 主頁「最新消息」：一次一張卡片，每 6 秒自動換下一張，可以左右滑或按箭頭，點卡片放大成彈窗看全文。
   內容整理自新竹市政府與衛福部疾管署的官方公告，改寫成給爸媽看的白話。 */
(function () {
  const TAGS = {
    vax: ['疫苗', '#2F5470', '#E3ECF2'],
    health: ['健康', '#8E3A33', '#F6E3E1'],
    money: ['補助', '#7A4F0B', '#F6E9CC'],
    care: ['托育', '#6B3655', '#F3E8EE']
  };
  const NEWS = [
    { tag: 'vax', src: '衛福部疾管署', date: '11/3',
      title: '幼兒第一次打流感疫苗，要打 2 劑才完整',
      sum: '滿 6 個月、還沒上小學，今年 10 月前從沒打過流感疫苗的幼兒，要打 2 劑，中間隔 28 天以上。',
      body: ['疾管署提醒，學齡前幼兒是流感重症的高風險族群。滿 6 個月、還沒上小學，而且今年 10 月以前從來沒打過流感疫苗的「首打族」，要打 2 劑。',
        '未滿 3 歲、今年 10 月以前只打過 1 劑的「再打族」，也要再打第 2 劑。2 劑之間要隔 28 天以上。',
        '截至 11/1，全國約有 6.5 萬名幼兒在等第 2 劑，還有 37 萬名幼兒沒有接種。'],
      you: '寶寶現在 2 個月，還不能打流感疫苗。滿 6 個月（2027/3/10）之後，第一次打要打 2 劑。',
      url: 'https://www.cdc.gov.tw/Bulletin/Detail/mXGXp81PJ_IN6eJ__i5Y3A?typeid=9', page: null },
    { tag: 'health', src: '衛福部疾管署', date: '10/27',
      title: '腸病毒又多 1 例重症，5 歲以下要特別小心',
      sum: '今年累計 8 例腸病毒重症。寶寶如果嗜睡、一直吐或呼吸很快，要儘快到大醫院。',
      body: ['疾管署公布新增 1 例腸病毒併發重症，是北部一名未滿 10 歲的女童，已經出院。今年累計 8 例重症，其中 1 例死亡。',
        '5 歲以下的嬰幼兒是重症高風險族群。如果出現嗜睡、意識不清、手腳無力、肌躍型抽搐（無故驚嚇或全身肌肉突然收縮）、持續嘔吐或呼吸急促，請儘速送到大醫院。',
        '有問題可以撥防疫專線 1922 詢問。'],
      you: '寶寶 2 個月，大人回家先用肥皂洗手、換衣服再抱寶寶。',
      url: 'https://www.cdc.gov.tw/Bulletin/Detail/Tll3Ml65fE-L7yckw9ttxA?typeid=9', page: ['看緊急專線', 'help.html'] },
    { tag: 'vax', src: '衛福部疾管署', date: '10/1',
      title: '公費流感疫苗開打，6 個月內寶寶的爸媽也能打',
      sum: '第一階段公費對象包含 6 個月內嬰兒的爸媽或照顧者、學齡前幼兒、孕婦與長者。',
      body: ['115 年度公費流感疫苗從 10/1 開始接種，今年採購 705 萬多劑，是歷年第一次超過 700 萬劑。',
        '第一階段的公費對象包含 6 個月內嬰兒的雙親或扶養者、學齡前幼兒、孕婦、65 歲以上長者等。全國近 4,000 家合約院所都能打。',
        '合約院所可以在衛生局網頁、疾管署網站、LINE「疾管家」查詢，或撥 1922。'],
      you: '寶寶還不能打流感疫苗，爸媽和主要照顧者先打，就能保護寶寶。',
      url: 'https://www.cdc.gov.tw/Bulletin/Detail/4v-EU-rH3UbhFvRs0tjTqQ?typeid=9', page: null },
    { tag: 'money', src: '新竹市政府', date: '',
      title: '未滿 2 歲的育兒津貼，記得申辦',
      sum: '市府提醒，家裡有未滿 2 歲的寶寶、由自己或家人照顧，記得申辦育兒津貼，別讓權益損失了。',
      body: ['新竹市政府提醒，家中有未滿 2 歲兒童的家庭，記得申辦育兒津貼，不要讓自己的權益損失了。',
        '申辦資格、金額與方式，請以市府公告為準。'],
      you: '你是自己或家人帶寶寶，可以申辦。到補助頁可以看你目前的狀態。',
      url: 'https://www.hccg.gov.tw/hccg/app/data/view?module=news&id=30122&serno=168fff14-5734-45d5-9823-44254b02e80c', page: ['看補助及其他福利', 'benefits.html'] },
    { tag: 'care', src: '新竹市社會處', date: '',
      title: '關東公共托嬰中心開工，東區托育再多一處',
      sum: '東區新的公共托嬰中心已經開工，市府說會用 3 大特色加強東區的托育量能。',
      body: ['新竹市關東公共托嬰中心已經開工，是東區新增的公共托嬰據點。',
        '市府表示，這個公托有 3 大特色，可以加強東區的托育量能。完工與招生時間，請以社會處公告為準。'],
      you: '開放報名時，竹寶會在這裡通知你。',
      url: 'https://society.hccg.gov.tw/ch/home.jsp?id=13&parentpath=0,2&mcustomize=municipalnews_view.jsp&toolsflag=Y&dataserno=92e5e4a3-b53f-4b04-9e5f-d5fed34ba88d&t=MunicipalNews&mserno=201601300041', page: ['看托育', 'childcare.html'] },
    { tag: 'care', src: '新竹市社會處', date: '',
      title: '竹市第一座兒少家庭福利館，預計 117 年完工',
      sum: '新竹市第一座兒少家庭福利館已經啟動，預計民國 117 年完工，也規劃設置公共托嬰中心。',
      body: ['新竹市第一座兒少家庭福利館已經啟動，預計民國 117 年完工。',
        '市府會勘預定地時表示，福利館會再增加一處公共托嬰中心，落實「0-6 歲市府養」政策。'],
      you: '117 年寶寶大約 1 歲多，到時可以多一個托育選擇。',
      url: 'https://society.hccg.gov.tw/ch/home.jsp?id=13&parentpath=0%2C2&mcustomize=municipalnews_view.jsp&toolsflag=Y&dataserno=064dfd9b-7438-4f7c-ae3e-fe2fc7db34ab&t=MunicipalNews&mserno=201601300041', page: ['看托育', 'childcare.html'] }
  ];
  const MS = 6000;
  const GAP = 12;

  const CSS = ''
    + '.zbn{display:flex;flex-direction:column;gap:12px}'
    + '.zbn-vp{position:relative;overflow:hidden;touch-action:pan-y;border-radius:16px;margin-right:-24px;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 40px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 40px),transparent)}'
    + '@media (max-width:760px){.zbn-vp{margin-right:-16px}}'
    + '.zbn-track{display:flex;gap:' + GAP + 'px;transition:transform .5s cubic-bezier(.22,.9,.24,1);will-change:transform}'
    + '.zbn-track.zbn-drag{transition:none}'
    + '.zbn-card{flex:0 0 calc(100% - 44px);box-sizing:border-box;min-height:176px;display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:16px 18px;border-radius:16px;border:1px solid #E4DED2;background:#FCFAF6;font-family:inherit;color:#1F2A24;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease,border-color .2s ease,opacity .35s ease}'
    + '.zbn-card[data-active="false"]{opacity:.55}'
    + '.zbn-card[data-active="true"]:hover{transform:translateY(-3px);border-color:#B9CDBF;box-shadow:0 8px 20px rgba(46,94,78,.12)}'
    + '.zbn-card:active{transform:scale(.98)}'
    + '.zbn-card:focus-visible{outline:2px solid #2E5E4E;outline-offset:2px}'
    + '.zbn-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:#5F6B64}'
    + '.zbn-tag{font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px}'
    + '.zbn-title{font-size:17px;font-weight:600;line-height:1.5}'
    + '.zbn-sum{font-size:14px;line-height:1.7;color:#3D4842;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    + '.zbn-more{margin-top:auto;font-size:13px;font-weight:600;color:#2E5E4E}'
    + '.zbn-bar{display:flex;align-items:center;gap:8px}'
    + '.zbn-dots{display:flex;align-items:center;gap:0;flex:1;min-width:0;margin-left:-8px}'
    + '.zbn-dot{width:22px;height:32px;padding:0;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;-webkit-appearance:none;appearance:none;transition:width .35s cubic-bezier(.22,.9,.24,1)}'
    + 'button.zbn-dot,button.zbn-dot:hover,button.zbn-dot:active,button.zbn-dot:focus,button.zbn-dot:focus-visible{outline:none !important;box-shadow:none !important;transform:none !important;background:transparent !important}' /* 只讓圓點本身有反應，外面的點擊範圍不顯示方框 */
    + '.zbn-dot i{display:block;width:7px;height:7px;border-radius:999px;background:#D3CCBF;overflow:hidden;position:relative;transition:width .35s cubic-bezier(.22,.9,.24,1),background .2s ease,transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease}'
    + '.zbn-dot:hover i{background:#9FBBA8;transform:scale(1.35)}'
    + '.zbn-dot:active i{transform:scale(.8)}'
    + '.zbn-dot:focus-visible i{box-shadow:0 0 0 2px #FCFAF6,0 0 0 4px #2E5E4E}'
    + '.zbn-dot[aria-current="true"]{width:40px}'
    + '.zbn-dot[aria-current="true"] i{width:26px;background:#DCE7DF}'
    + '.zbn-dot[aria-current="true"]:hover i{transform:scale(1.08)}'
    + '.zbn-dot[aria-current="true"]:active i{transform:scale(.94)}'
    + '.zbn-dot[aria-current="true"] i::after{content:"";position:absolute;inset:0;background:#2E5E4E;border-radius:999px;transform-origin:left;transform:scaleX(1)}'
    + '.zbn-run .zbn-dot[aria-current="true"] i::after{animation:zbnFill ' + MS + 'ms linear forwards}'
    + '.zbn-btn{min-height:36px;min-width:36px;padding:0 12px;border-radius:10px;border:1px solid #E4DED2;background:#FCFAF6;color:#2E5E4E;font:600 13px "Noto Sans TC",system-ui,sans-serif;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .22s cubic-bezier(.34,1.56,.64,1),background .15s ease,border-color .15s ease}'
    + '.zbn-btn:hover{background:#E4EEE7;border-color:#2E5E4E;transform:translateY(-2px)}'
    + '.zbn-btn:active{transform:scale(.9)}'
    + '.zbn-btn:focus-visible{outline:2px solid #2E5E4E;outline-offset:2px}'
    + '.zbn-modal{position:fixed;inset:0;z-index:950;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}'
    + '.zbn-modal[hidden]{display:none}'
    + '.zbn-back{position:absolute;inset:0;background:rgba(31,42,36,.42)}'
    + '.zbn-pop{position:relative;width:100%;max-width:560px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;background:#FCFAF6;border-radius:20px;box-shadow:0 24px 60px rgba(31,42,36,.28);padding:20px 22px 22px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;transform-origin:top left;font-family:"Noto Sans TC",system-ui,sans-serif;color:#1F2A24}'
    + '.zbn-pop h3{margin:0;font-size:21px;font-weight:600;line-height:1.5}'
    + '.zbn-pop p{margin:0;font-size:15px;line-height:1.8;color:#3D4842}'
    + '.zbn-head{display:flex;align-items:center;gap:8px}'
    + '.zbn-head .zbn-meta{flex:1}'
    + '.zbn-x{width:40px;height:40px;border-radius:12px;border:0;background:transparent;color:#5F6B64;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s ease,transform .22s cubic-bezier(.34,1.56,.64,1)}'
    + '.zbn-x:hover{background:#E4EEE7;color:#2E5E4E;transform:rotate(90deg)}'
    + '.zbn-x:active{transform:scale(.88)}'
    + '.zbn-x:focus-visible{outline:2px solid #2E5E4E;outline-offset:0}'
    + '.zbn-you{background:#E4EEE7;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:4px}'
    + '.zbn-you b{font-size:12px;color:#2E5E4E}'
    + '.zbn-you span{font-size:14px;line-height:1.7}'
    + '.zbn-acts{display:flex;flex-wrap:wrap;gap:8px}'
    + '.zbn-acts a{min-height:44px;display:inline-flex;align-items:center;padding:0 16px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid #2E5E4E;color:#2E5E4E;transition:transform .22s cubic-bezier(.34,1.56,.64,1),background .15s ease}'
    + '.zbn-acts a:first-child{background:#2E5E4E;color:#fff}'
    + '.zbn-acts a:hover{transform:translateY(-2px)}.zbn-acts a:active{transform:scale(.95)}'
    + '.zbn-acts a:focus-visible{outline:2px solid #2E5E4E;outline-offset:2px}'
    + '.zbn-note{font-size:12px;color:#5F6B64}'
    + '.zbn-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'
    + '@keyframes zbnFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}'
    + '@media (prefers-reduced-motion:reduce){.zbn-track,.zbn-card,.zbn-btn,.zbn-x,.zbn-acts a,.zbn-dot,.zbn-dot i{transition:none !important}.zbn-dot:hover i,.zbn-dot:active i{transform:none !important}.zbn-card:hover,.zbn-btn:hover,.zbn-x:hover{transform:none !important}.zbn-dot i::after{animation:none !important}}';

  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
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
  const meta = (n) => {
    const t = TAGS[n.tag];
    return h('span', { class: 'zbn-meta' }, [
      h('span', { class: 'zbn-tag', style: 'background:' + t[2] + ';color:' + t[1], text: t[0] }),
      h('span', { text: n.src + (n.date ? '・' + n.date : '') })
    ]);
  };

  function mount(host) {
    document.head.appendChild(h('style', { text: CSS }));
    const N = NEWS.length;
    let idx = 0, timer = null, userPaused = reduced();
    const hold = { hover: false, focus: false, press: false, modal: false };

    const cards = NEWS.map((n, i) => h('button', {
      type: 'button', class: 'zbn-card', 'data-active': i === 0 ? 'true' : 'false',
      'aria-roledescription': '消息', 'aria-label': '第 ' + (i + 1) + ' 則，共 ' + N + ' 則：' + n.title + '。點開看全文'
    }, [meta(n), h('span', { class: 'zbn-title', text: n.title }), h('span', { class: 'zbn-sum', text: n.sum }), h('span', { class: 'zbn-more', 'aria-hidden': 'true', text: '點開看全文' })]));
    const track = h('div', { class: 'zbn-track' }, cards);
    const vp = h('div', { class: 'zbn-vp' }, [track]);
    const dots = NEWS.map((n, i) => h('button', { type: 'button', class: 'zbn-dot', 'aria-label': '第 ' + (i + 1) + ' 則：' + n.title, html: '<i></i>' }));
    const pauseBtn = h('button', { type: 'button', class: 'zbn-btn' });
    const live = h('div', { class: 'zbn-sr', 'aria-live': 'polite' });
    const root = h('div', { class: 'zbn', role: 'region', 'aria-roledescription': '輪播', 'aria-label': '最新消息' }, [
      vp, h('div', { class: 'zbn-bar' }, [h('div', { class: 'zbn-dots' }, dots), pauseBtn]), live
    ]);
    host.replaceChildren(root);

    const step = () => cards[0].offsetWidth + GAP;
    function paint(anim) {
      if (!anim) track.classList.add('zbn-drag');
      track.style.transform = 'translate3d(' + (-idx * step()) + 'px,0,0)';
      if (!anim) { void track.offsetWidth; track.classList.remove('zbn-drag'); }
      cards.forEach((c, i) => { c.setAttribute('data-active', i === idx ? 'true' : 'false'); c.tabIndex = i === idx ? 0 : -1; c.setAttribute('aria-hidden', i === idx ? 'false' : 'true'); });
      dots.forEach((d, i) => d.setAttribute('aria-current', i === idx ? 'true' : 'false'));
    }
    const running = () => !userPaused && !hold.hover && !hold.focus && !hold.press && !hold.modal && !document.hidden;
    function schedule() {
      clearTimeout(timer); timer = null;
      root.classList.remove('zbn-run');
      pauseBtn.textContent = userPaused ? '播放' : '暫停';
      pauseBtn.setAttribute('aria-label', userPaused ? '開始自動輪播' : '暫停自動輪播');
      if (!running()) return;
      void root.offsetWidth;
      root.classList.add('zbn-run');
      timer = setTimeout(() => go(idx + 1, false), MS);
    }
    function go(i, byUser) {
      idx = (i + N) % N;
      paint(true);
      if (byUser) live.textContent = '第 ' + (idx + 1) + ' 則：' + NEWS[idx].title;
      schedule();
    }

    dots.forEach((d, i) => d.addEventListener('click', () => go(i, true)));
    pauseBtn.addEventListener('click', () => { userPaused = !userPaused; schedule(); });
    root.addEventListener('mouseenter', () => { hold.hover = true; schedule(); });
    root.addEventListener('mouseleave', () => { hold.hover = false; schedule(); });
    root.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) { hold.focus = true; schedule(); } });
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { hold.focus = false; schedule(); } });
    root.addEventListener('keydown', (e) => {
      if (e.target.closest('.zbn-vp') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault(); go(idx + (e.key === 'ArrowRight' ? 1 : -1), true); cards[idx].focus({ preventScroll: true });
      }
    });
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('resize', () => paint(false));

    /* ---- 左右滑動（手指與滑鼠都可以） ---- */
    let drag = null, suppressClick = false;
    vp.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, on: false };
      hold.press = true; schedule();
    });
    vp.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        drag.on = true;
        try { vp.setPointerCapture(e.pointerId); } catch (err) {}
        track.classList.add('zbn-drag');
      }
      drag.dx = dx;
      const edge = (idx === 0 && dx > 0) || (idx === N - 1 && dx < 0);
      track.style.transform = 'translate3d(' + (-idx * step() + (edge ? dx * 0.35 : dx)) + 'px,0,0)';
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      hold.press = false;
      track.classList.remove('zbn-drag');
      if (d.on) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
        if (d.dx < -50) go(idx + 1, true);
        else if (d.dx > 50) go(idx - 1, true);
        else { paint(true); schedule(); }
      } else schedule();
    };
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('dragstart', (e) => e.preventDefault());

    /* ---- 彈窗：卡片放大成全文 ---- */
    const xBtn = h('button', { type: 'button', class: 'zbn-x', 'aria-label': '關閉', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' });
    const pop = h('div', { class: 'zbn-pop', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'zbn-pop-title' });
    const back = h('div', { class: 'zbn-back' });
    const modal = h('div', { class: 'zbn-modal', hidden: '' }, [back, pop]);
    document.body.appendChild(modal);
    let openFrom = null;

    function fill(n) {
      const acts = [h('a', { href: n.url, target: '_blank', rel: 'noopener', text: '看官方公告' })];
      if (n.page) acts.push(h('a', { href: n.page[1], text: n.page[0] }));
      pop.replaceChildren(
        h('div', { class: 'zbn-head' }, [meta(n), xBtn]),
        h('h3', { id: 'zbn-pop-title', text: n.title })
      );
      n.body.forEach((p) => pop.appendChild(h('p', { text: p })));
      pop.appendChild(h('div', { class: 'zbn-you' }, [h('b', { text: '對你來說' }), h('span', { text: n.you })]));
      pop.appendChild(h('div', { class: 'zbn-acts' }, acts));
      pop.appendChild(h('span', { class: 'zbn-note', text: '來源：' + n.src + '。內容為竹寶整理的白話摘要，以官方公告為準。' }));
    }
    function flip(fromRect, reverse, done) {
      const to = pop.getBoundingClientRect();
      const sx = fromRect.width / to.width, sy = fromRect.height / to.height;
      const t0 = 'translate(' + (fromRect.left - to.left) + 'px,' + (fromRect.top - to.top) + 'px) scale(' + sx + ',' + sy + ')';
      const frames = [{ transform: t0, opacity: 0.6, borderRadius: '16px' }, { transform: 'none', opacity: 1, borderRadius: '20px' }];
      const a = pop.animate(reverse ? frames.slice().reverse() : frames, { duration: reverse ? 260 : 380, easing: reverse ? 'cubic-bezier(.4,0,.6,1)' : 'cubic-bezier(.2,.9,.25,1.05)' });
      back.animate([{ opacity: reverse ? 1 : 0 }, { opacity: reverse ? 0 : 1 }], { duration: reverse ? 260 : 300, fill: 'forwards' });
      a.onfinish = done || null;
    }
    function open(i) {
      openFrom = cards[i];
      fill(NEWS[i]);
      hold.modal = true; schedule();
      modal.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      if (!reduced()) flip(openFrom.getBoundingClientRect(), false);
      xBtn.focus({ preventScroll: true });
    }
    function close() {
      if (modal.hidden) return;
      const finish = () => {
        modal.hidden = true;
        document.documentElement.style.overflow = '';
        hold.modal = false; hold.focus = false; schedule();
        if (openFrom) openFrom.focus({ preventScroll: true });
      };
      if (reduced() || !openFrom) finish();
      else flip(openFrom.getBoundingClientRect(), true, finish);
    }
    cards.forEach((c, i) => c.addEventListener('click', (e) => {
      if (suppressClick) { e.preventDefault(); return; }
      if (i !== idx) { go(i, true); return; }
      open(i);
    }));
    xBtn.addEventListener('click', close);
    back.addEventListener('click', close);
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const f = Array.from(pop.querySelectorAll('a,button'));
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    paint(false);
    schedule();
  }

  function start() {
    const host = document.getElementById('zb-news');
    if (host) mount(host);
  }
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', start) /* 要排在 zhubao-runtime.js 畫完頁面之後 */;
  else start();
})();
