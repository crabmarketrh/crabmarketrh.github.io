// Shared page chrome and art helpers. Needs config.js and the three art files loaded first.
(function () {
  const C = window.SHELL_CONFIG;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, attrs, kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) { const v = attrs[k]; if (v == null || v === false) continue; if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k === 'html') n.innerHTML = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v); }
    for (const c of [].concat(kids || [])) if (c != null) n.append(c);
    return n;
  };

  // ---- seeds: any text (a name, a wallet, a number) becomes one repeatable crab
  function seedOf(text) { let h = 0x811c9dc5; const s = String(text).trim().toLowerCase(); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0 || 1; }
  const traitsOf = (seed) => rollTraits(rnd(seed));
  // the face of the project: an orange crab in a coral snail shell (chosen by hand, used in the hero, the icon and the share image)
  const hero = () => normalise({ shell: 'snail', pat: 0, shellColor: SHELL_COLORS.find((c) => c[0] === 'coral'), altColor: null, body: BODY_COLORS.find((c) => c[0] === 'ember'), eyes: 'big', mouth: 'smile', claws: 'even', held: 'nothing', mark: 'none', extra: 'none', scene: 'sky' });

  // ---- one NFT image on a 32x32 canvas
  function paintPiece(ctx, traits, o = {}) {
    const t = o.level === 0 ? { ...traits, eyes: 'closed' } : traits;
    drawScene(ctx, t.scene, o.seed || 1, o.frame || 0);
    const P = Painter(1); drawCrab(P, { ...resolve(t), shadow: 'rgba(40,25,10,.35)' }); P.blit(ctx);
    if (t.legendary) sparkle(ctx, o.seed || 1, o.frame || 5);
    if (o.level != null) drawLevel(ctx, o.level, o.frame || 0);
  }
  function piece(traits, o = {}) { const c = el('canvas', { class: 'px', width: 32, height: 32, role: 'img', 'aria-label': o.label || 'A pixel hermit crab' }); paintPiece(c.getContext('2d'), traits, o); return c; }

  // ---- run fn the first time el is near the viewport (keeps the first paint fast)
  function lazy(node, fn) { if (!node) return; if (!('IntersectionObserver' in window)) return fn(); const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: '500px' }); io.observe(node); }

  // ---- the official accounts, as small marks drawn here so the page asks nothing of anyone else
  const MARK = {
    X: 'M3 3 L9 3 L21 21 L15 21 Z M15 3 L21 3 L3 21 L9 21 Z',
    OpenSea: 'M12 2 L12 17 M13 4 L20 15 L13 15 Z M11 7 L6 15 L11 15 Z M3 17 L21 17 L18 21 L6 21 Z',
    Telegram: 'M21 4 L2 11.5 L8.5 13.5 L11 20 L14 15.5 L19 19 Z M8.5 13.5 L18 7 L11 15 Z',
    Discord: 'M4.4 19 C2.9 13.9 3.5 8.8 6.1 6 C7.6 5.3 9.1 4.9 10.4 4.8 L11 6.1 C12.3 5.9 13.7 5.9 15 6.1 L15.6 4.8 C16.9 4.9 18.4 5.3 19.9 6 C22.5 8.8 23.1 13.9 21.6 19 C19.9 20.4 18 21.1 16.3 21.4 L15.1 19.2 C16 18.9 16.8 18.5 17.4 18 L16.4 17.4 C14.6 18.3 11.4 18.3 9.6 17.4 L8.6 18 C9.2 18.5 10 18.9 10.9 19.2 L9.7 21.4 C8 21.1 6.1 20.4 4.4 19 Z M9.5 13.4 A1.5 2 0 1 0 9.51 13.4 M14.5 13.4 A1.5 2 0 1 0 14.51 13.4',
  };
  function mark(name) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    const pth = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pth.setAttribute('d', MARK[name]); pth.setAttribute('fill', 'currentColor'); s.append(pth); return s; }
  const socials = () => [['X', C.links.x], ['Telegram', C.links.telegram], ['Discord', C.links.discord], ['OpenSea', C.links.opensea]].filter((s) => s[1]);

  // ---- the clock. A visitor's own clock can be minutes out, and a countdown that ends early or late is a false
  // statement about the mint. The home page measures the gap against our own host once and keeps it for the tab.
  let skew = 0; try { skew = +sessionStorage.getItem('crabSkew') || 0; } catch (e) { /* private window */ }
  const now = () => Date.now() + skew;
  function setSkew(ms) { skew = Math.abs(ms) < 2000 ? 0 : Math.round(ms); try { sessionStorage.setItem('crabSkew', String(skew)); } catch (e) { /* private window */ } }
  // When the mint opens, in ms, or 0 for 'no date yet'. On the local preview server only, ?mint=+90 puts it 90
  // seconds away, &url=1 pretends the mint link is set and &url=0 that it is not, so the last minute can be watched without waiting for it.
  const BOOT = Date.now(), DEV = location.hostname === '127.0.0.1', Q = new URLSearchParams(location.search);
  if (DEV && Q.get('url') === '0') C.mint.url = '';   // &url=0: the link is not set, whatever config says (the 'due' check)
  else if (DEV && Q.get('url') && !C.mint.url) C.mint.url = 'https://example.invalid/mint';
  function mintAt() { const q = DEV && Q.get('mint'); if (q) return /^[+ ]?-?\d+$/.test(q) ? BOOT + Number(q) * 1000 : Date.parse(q) || 0; const t = Date.parse(C.mint.opensAt || ''); return isNaN(t) ? 0 : t; }
  // the one way the site writes the date, so three pages cannot drift into three formats
  // The public round, which opens after the list rounds. Its hour is printed wherever the site says who may mint now.
  const publicAt = () => { const t = Date.parse(C.mint.publicAt || ''); return isNaN(t) ? 0 : t; };
  const hourOf = (t) => { const d = new Date(t), p2 = (n) => String(n).padStart(2, '0'); return p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ' UTC'; };
  const publicHour = () => (publicAt() ? hourOf(publicAt()) : '');
  // who can mint right now, only ever used while the mint is open: before the public hour the list alone, after it everyone
  function roundLine() { const p = publicAt(); if (!p) return 'Wallets on the list mint first.';
    return now() < p ? 'List wallets only for now. Everyone else from ' + publicHour() + '.' : 'Open to everyone now, up to ' + C.collection.perWallet + ' per wallet.'; }
  function mintWhen() { const t = mintAt(); if (!t) return ''; const d = new Date(t), p2 = (n) => String(n).padStart(2, '0'); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()] + ', ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ' UTC'; }
  // The hour has come but there is no mint link: the mint is DUE, not open. Nothing may say 'open' or 'mint now'.
  const mintDue = () => !!(mintAt() && now() >= mintAt() && !C.mint.url);

  // ---- what stage the project is actually at. Every sentence about "is it live" must read this and nothing else.
  const isOpen = () => ({
    list: !!(C.list.url && C.list.open && !C.list.closed),  // closed always wins: a half-done close must never leave the site inviting people the Worker is refusing
    // A mint is open when there is somewhere to mint AND its hour has come. The link can be published days early
    // without opening anything, and an hour that arrives with no link opens nothing either (see mintDue).
    // and it is over once mint.closed is set, whether or not the token exists yet: at the seal every 'Mint a crab' would
    // otherwise point at a dead drop (the same hole list.closed fixed for the list)
    mint: !!(C.mint.url && (!mintAt() || now() >= mintAt()) && !C.mint.closed),
    token: !!C.contracts.token,
  });
  function stage() { const o = isOpen(); return o.token ? 'token' : o.mint ? 'mint' : C.mint.closed ? 'mintShut' : o.list ? 'list' : C.list.closed ? 'listShut' : 'pre'; }
  // The site's one primary action, from the stage. Every 'Get on the list' button used to be written into the HTML,
  // so the day the list closed about twenty of them, the header on every page included, would have kept inviting
  // people to a list the Worker refuses, and on mint day not one of them would have said 'mint'.
  function cta() { const s = stage(), sym = C.token.symbol;
    if (s === 'token') return C.links.buy ? { text: 'Buy ' + sym, href: C.links.buy, ext: true } : { text: 'Buy ' + sym, href: '/token/#buy' };   // owner 2026-09-25: straight to Pons (links.buy); our own box only until that link is set
    if (s === 'mint') return C.mint.url ? { text: 'Mint a crab', href: C.mint.url, ext: true } : { text: 'Mint a crab', href: '/docs/#mint' };
    if (s === 'mintShut') return { text: 'My crabs', href: '/#my' };   // owner 2026-09-26 17:3xZ: wallet + wake/level at the centre of the main page; OpenSea stays the secondary button
    if (s === 'listShut') return C.links.x ? { text: 'Follow for the mint', href: C.links.x, ext: true } : { text: 'How the mint works', href: '/docs/#mint' };
    return { text: 'Get on the list', href: '/list/' }; }
  // the closing bands were written for the list stage; after it, their headline and line follow the stage too
  const BAND = {
    listShut: ['The mint is next.', 'The list has closed and we are checking the posts. The mint date goes out on our X account first.'],
    mint: ['The mint is open.', 'Every crab arrives asleep. Wake yours when ' + C.token.symbol + ' launches, and it starts earning at the next tide.'],
    mintShut: ['Minted out. The token is next.', 'The mint has closed. ' + C.token.symbol + ' launches within hours, and the real link appears here first.'],
    token: [C.token.symbol + ' is live.', 'Wake a crab and it starts earning at the next tide. Check the address on this site before you buy anything.'],
  };
  function applyCta() { const c = cta();
    if (C.list.closed) document.querySelectorAll('[data-listonly]').forEach((n) => { n.hidden = true; });   // a way onto the list, once the list is over
    document.querySelectorAll('[data-cta]').forEach((a) => { a.textContent = c.text; a.href = c.href; if (c.ext) { a.target = '_blank'; a.rel = 'noopener'; } else { a.removeAttribute('target'); } });
    applyOs();
    document.querySelectorAll('[data-when="public"]').forEach((n) => { if (publicAt()) n.textContent = publicHour(); });
    const b = BAND[stage()]; if (b) document.querySelectorAll('[data-check="ctaband"]').forEach((sec) => { const h = sec.querySelector('h2'), l = sec.querySelector('.lede'); if (h) h.textContent = b[0]; if (l) l.textContent = b[1]; }); }
  // The OpenSea button: where the crabs are bought, from the first day of the list to long after the mint. One place,
  // from the stage, like cta(). The drop page exists before the mint, so the button points there early: people can see
  // the stages and set a reminder. data-os="short" takes the short label (the hero's two-up row on a phone).
  // data-os="alt" is the hero's second button: when the first already goes to OpenSea it explains the token instead.
  function osCta() { const u = C.links.opensea, s = stage(); if (!u) return null;
    if (s === 'mint') return { text: 'Mint now on OpenSea', short: 'Mint on OpenSea', href: C.mint.url || u, hot: true };
    if (s === 'mintShut' || s === 'token') return { text: 'Buy a crab on OpenSea', short: 'Crabs on OpenSea', href: u };
    return { text: 'Preview the drop on OpenSea', short: 'Preview on OpenSea', href: u }; }
  function applyOs() { const o = osCta(), dup = stage() === 'mint' || stage() === 'mintShut';
    document.querySelectorAll('[data-os]').forEach((a) => {
      if (a.dataset.os === 'alt' && (dup || !o)) { a.textContent = 'How ' + C.token.symbol + ' works'; a.href = '/token/'; a.removeAttribute('target'); a.classList.remove('os', 'go', 'nudge'); a.hidden = false; return; }
      if (!o) { a.hidden = true; return; }
      a.hidden = false; a.textContent = a.dataset.os === 'long' || !a.dataset.os ? o.text : o.short; a.href = o.href; a.target = '_blank'; a.rel = 'noopener';
      a.classList.add('os'); a.classList.toggle('go', !!o.hot); a.classList.toggle('nudge', !!o.hot && !still); }); }
  const STANDING = {
    pre: 'Nothing is live yet. There is no token and no mint today, so anything using our name to sell you one is fake. The real links will only ever appear on this site.',
    listShut: 'The list has closed and we are checking the posts. There is no token and no mint yet, so anything using our name to sell you one is fake. The real links will only ever appear on this site.',
    list: 'The list is open, and that is all. There is no token and no mint yet, so anything using our name to sell you one is fake. The real links will only ever appear on this site.',
    mint: 'The mint is open. There is no token yet, so anything using our name to sell you one is fake. The real links will only ever appear on this site.',
    mintShut: 'The mint has closed. There is no token yet, so anything using our name to sell you one is fake. The real links will only ever appear on this site.',
    token: 'Contract addresses are listed in the docs. Check them before you sign anything, and trust no address that is not on this site.',
  };

  // ---- header + footer
  const NAV = [['How it works', '/#how'], ['Token', '/token/'], ['My crabs', '/my/'], ['Raids', '/raids/'], ['Shop', '/shop/'], ['List', '/list/'], ['Docs', '/docs/']];
  function mount() {
    const main = document.querySelector('main'); if (main) { if (!main.id) main.id = 'main'; main.tabIndex = -1; document.body.prepend(el('a', { class: 'skip', href: '#' + main.id, text: 'Skip to content' })); }
    const here = location.pathname.replace(/index\.html$/, '');
    const top = document.getElementById('top');
    if (top) {
      const icon = piece(hero(), { label: '' }); icon.setAttribute('aria-hidden', 'true');
      const soc = socials().map(([t, h]) => el('a', { class: 'soc' + (t === 'OpenSea' ? ' os' : ''), href: h, rel: 'noopener', target: '_blank', 'aria-label': t + ' (opens in a new tab)', title: t }, [mark(t)]));
      const nav = el('nav', { class: 'nav', id: 'nav', 'aria-label': 'Main' }, NAV.map(([t, h]) => el('a', { href: h, text: t, 'aria-current': h === here ? 'page' : null })).concat(soc.length ? el('span', { class: 'socs' }, soc) : null).concat(el('a', { class: 'mintchip', id: 'mintchip', href: '/#mintclock', hidden: true }, [el('span', { class: 'ct' }, [el('b', { class: 'cb', text: 'OpenSea' }), el('span', { class: 'cl' })])])).concat(el('a', { class: 'btn go sm', href: '/list/', text: 'Get on the list', 'data-cta': '' })));
      const burger = el('button', { class: 'btn sm burger', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'nav', text: 'Menu', onclick: () => { const open = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', open); } });
      top.className = 'top'; top.append(el('div', { class: 'wrap' }, [el('a', { class: 'brand', href: '/' }, [icon, el('span', { text: C.name })]), burger, nav]));
      nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
    }
    const foot = document.getElementById('foot');
    if (foot) {
      const social = socials();
      foot.append(el('div', { class: 'wrap' }, [
        el('div', {}, [el('p', { class: 'fh', text: C.name }), el('p', { id: 'standing', text: STANDING[stage()] }), el('p', { style: 'margin-top:12px', text: 'Pixel crabs are collectibles. Hourly pay depends on trading volume and can be zero. Nothing here is financial advice.' })]),
        el('div', {}, [el('p', { class: 'fh', text: 'Site' })].concat(NAV.map(([t, h]) => el('a', { href: h, text: t }))).concat([el('a', { href: '/sea/', text: 'The sea' }), el('a', { href: '/meet/', text: 'Meet a crab' }), el('a', { href: '/tides/', text: 'The tides' }), el('a', { href: '/token/#buy', text: 'Where to buy ' + C.token.symbol })])),
        el('div', {}, [el('p', { class: 'fh', text: 'Follow' })].concat(social.length ? social.map(([t, h]) => el('a', { href: h, text: t, rel: 'noopener', target: '_blank' })).concat(el('p', { style: 'margin-top:10px', text: 'These are the only official accounts. Anything else using our name is fake.' })) : [el('p', { text: 'Official accounts will be linked here at launch.' })])),
      ]));
    }
    document.querySelectorAll('[data-cfg]').forEach((n) => { const v = n.dataset.cfg.split('.').reduce((o, k) => (o ? o[k] : ''), C); if (v !== '' && v != null) n.textContent = typeof v === 'number' ? v.toLocaleString('en-US') : v; });
    applyCta(); chip(); setInterval(chip, 1000);
  }
  // The header chip: the way to OpenSea on every page, in the header that follows the visitor down the page, with how
  // long until the mint (minutes are enough up here; the home page has the seconds). Sky and the boat like every OpenSea
  // button on the site, with the word on it: a bare countdown read as a label, not a link (owner 2026-09-25). Hidden while
  // the mint is open, when the coral 'Mint a crab' is the OpenSea button; once the mint is over it says 'Buy a crab'.
  // Without an OpenSea link it is the plain butter countdown pointing at the mint clock. CSS decides where it shows:
  // two lines from 1240px, a full button in the phone menu, and the sail mark (a sky square) in between.
  function chip() { const c = document.getElementById('mintchip'); if (!c) return; const t = mintAt(), os = C.links.opensea, s = stage(), nav = c.closest('.nav');
    let line = '', when = '';
    if (isOpen().mint || (os && cta().href === os)) line = '';   // the coral button already goes to OpenSea: one door, not two
    else if (s === 'mintShut' || s === 'token') line = os ? 'Buy a crab' : '';
    else if (t) { when = 'The mint opens ' + mintWhen() + '. ';
      if (mintDue()) line = 'Mint: any minute';
      else { const sec = Math.max(0, Math.ceil((t - now()) / 1000)), d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60);
        line = 'Mint in ' + (d ? d + 'd ' + h + 'h' : h ? h + 'h ' + m + 'm' : m ? m + 'm' : sec + 's'); } }
    c.hidden = !line; if (nav) nav.classList.toggle('haschip', !!line && !!os);   // the sail mark stands down while the chip shows (both at once wrap the nav)
    if (!line) return;
    c.querySelector('.cl').textContent = line; c.querySelector('.cb').hidden = !os; c.classList.toggle('os', !!os);
    const href = os || '/#mintclock'; if (c.getAttribute('href') !== href) { c.href = href; if (os) { c.target = '_blank'; c.rel = 'noopener'; } else { c.removeAttribute('target'); c.removeAttribute('rel'); } }
    const label = os ? when + (line === 'Buy a crab' ? 'Buy a crab on OpenSea' : 'See the drop on OpenSea') + ' (opens in a new tab)' : when + 'See the mint clock';
    if (c.getAttribute('aria-label') !== label) { c.setAttribute('aria-label', label); c.title = os ? when + 'Opens OpenSea in a new tab' : when.trim(); } }
  // The stage can change while a page is open: the mint clock reaches zero. Whoever notices says so with this event.
  document.addEventListener('crabstage', () => { applyCta(); chip(); const s = document.getElementById('standing'); if (s) s.textContent = STANDING[stage()]; });

  window.SH = { C, still, el, seedOf, traitsOf, hero, paintPiece, piece, lazy, mount, stage, isOpen, cta, osCta, publicAt, publicHour, roundLine, now, setSkew, mintAt, mintDue, mintWhen };
})();
