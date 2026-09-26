// Home page: the living island in the hero, the crab marquee, and the galleries further down (built only when scrolled near).
(function () {
  const { C, el, still, piece, paintPiece, traitsOf, lazy } = SH;
  SH.mount();
  buildProps();

  // ---- copy that depends on numbers the team has (or has not) fixed yet
  const T = C.token;

  // ---- hero: one crab, its island, and the same crab as the NFT
  const HERO_SEED = 20260919;
  const me = { gx: GC, gy: GC, tier: 3, traits: SH.hero(), seed: 4242 };
  const sea = makeSea(document.getElementById('heroSea'), [me], { follow: true, night: () => true });
  const nft = document.getElementById('heroNft').getContext('2d'), tag = document.getElementById('heroTag'), lv = document.getElementById('heroLv');
  const NAMES = ['Asleep: not woken yet', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5: top shell'];
  let auto = !still, lastSwitch = 0, visible = true, fg = null, fgKey = '';
  const buttons = NAMES.map((_, i) => { const b = el('button', { type: 'button', text: String(i), 'aria-label': NAMES[i], 'aria-pressed': String(i === me.tier), onclick: () => { auto = false; setTier(i); } }); lv.append(b); return b; });
  // the burn button: what it costs comes from config, and says so in words when it is not set
  const burnBtn = document.getElementById('heroBurn'), say = document.getElementById('heroSay'), SYM = T.symbol, STEP = [T.wakeCost].concat(T.levelCosts || []), WT = T.levelWeights || [];
  const ladder = el('a', { href: '/token/#ladder', class: 'small', text: 'See the whole ladder', hidden: true }); say.after(ladder);
  function setTier(i) {
    me.tier = i; tag.textContent = NAMES[i]; buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const gift = ((C.items && C.items.list) || []).find((x) => x.id === 'hottub'), decorated = (me.items || []).length > 0;
    burnBtn.textContent = i === 0 ? 'Burn ' + (STEP[0] ? STEP[0] + ' ' : '') + SYM + ': wake it up' : i < 5 ? 'Burn ' + (STEP[i] || '') + ' more: level ' + (i + 1) : gift && !decorated ? 'Burn ' + gift.price + ': add a hot tub' : 'Start again';
    burnBtn.classList.toggle('nudge', i === 0);
    say.textContent = i === 0 ? 'Asleep. It earns nothing until you wake it.' : 'Awake, level ' + i + (WT[i - 1] ? '. Its share of every hourly pot: ' + WT[i - 1] : '') + '.'; ladder.hidden = i < 5; if (i === 5 && decorated) { say.textContent = 'Level 5 with a hot tub: ' + (WT[4] || '') + ' + ' + gift.bonus + '.'; ladder.textContent = 'See every item in the shop'; ladder.href = '/shop/'; } else { ladder.textContent = 'See the whole ladder'; ladder.href = '/token/#ladder'; }
  }
  function drawNft(frame) { const t = me.tier === 0 ? { ...me.traits, eyes: 'closed' } : me.traits, key = t.eyes + me.seed; if (key !== fgKey) { fg = Painter(1); drawCrab(fg, { ...resolve(t), shadow: 'rgba(40,25,10,.35)' }); fgKey = key; } drawScene(nft, t.scene, 7, frame); fg.blit(nft); drawLevel(nft, me.tier, frame); }

  // ---- effects layer over the sea: coins fly in, the island flashes, the tide leaves something behind
  const fx = document.getElementById('heroFx').getContext('2d'), FW = 368, FH = 240, CX = FW / 2, CY = FH * .54;
  let coins = [], floats = [], ring = -1, wave = -1, lastTide = 0, busy = false, tided = false;
  const px = (x, y, w, h, c) => { fx.fillStyle = c; fx.fillRect(Math.round(x), Math.round(y), w, h); };
  function coin(x, y) { px(x - 1, y - 3, 6, 10, '#12222f'); px(x - 3, y - 1, 10, 6, '#12222f'); px(x - 2, y - 2, 8, 8, '#12222f'); px(x - 1, y - 1, 6, 6, '#ffc93c'); px(x, y, 2, 2, '#fff3b0'); px(x + 3, y + 3, 2, 2, '#e09a1f'); }
  function word(text, x, y, a, c) { fx.globalAlpha = a; fx.font = '16px Silkscreen, monospace'; fx.textAlign = 'center'; fx.fillStyle = '#12222f'; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) fx.fillText(text, x + dx, y + dy); fx.fillStyle = c; fx.fillText(text, x, y); fx.globalAlpha = 1; }
  function burn(byUser) {
    if (busy) return; if (byUser) auto = false;
    if (me.tier === 5 && !(me.items || []).length && C.items && !still) { busy = true; const t0 = performance.now(); for (let k = 0; k < 10; k++) coins.push({ t0: t0 + k * 40, x0: CX - 70 + (k * 37) % 140, y0: FH + 8, x1: CX - 10 + (k * 13) % 20, y1: CY - 4 + (k * 7) % 8, dur: 520, lift: 46 + (k * 11) % 30 }); setTimeout(() => { me.items = ['hottub']; setTier(5); ring = performance.now(); floats.push({ t0: ring, text: 'HOT TUB!', x: CX, y: CY - 26, c: '#ffc93c' }); busy = false; tided = false; lastSwitch = ring; lastTide = ring; }, 920); return; }
    if (me.tier === 5) me.items = [];
    const next = me.tier >= 5 ? 0 : me.tier + 1;
    if (still || next === 0) { setTier(next); lastSwitch = performance.now(); if (still) { sea.draw(3000, true); drawNft(4); } return; }
    busy = true; const t0 = performance.now(), n = 8 + next * 2;
    for (let k = 0; k < n; k++) coins.push({ t0: t0 + k * 40, x0: CX - 70 + (k * 37) % 140, y0: FH + 8, x1: CX - 10 + (k * 13) % 20, y1: CY - 4 + (k * 7) % 8, dur: 520, lift: 46 + (k * 11) % 30 });
    setTimeout(() => { setTier(next); ring = performance.now(); floats.push({ t0: ring, text: next === 1 ? 'AWAKE!' : 'LEVEL ' + next + '!', x: CX, y: CY - 26, c: '#ffc93c' }); busy = false; tided = false; lastSwitch = ring; lastTide = ring; }, n * 40 + 520);
  }
  burnBtn.addEventListener('click', () => burn(true));
  // name your crab: the island and the NFT become the visitor's own crab as they type
  function tide(now) { wave = now; lastTide = now; setTimeout(() => { if (me.tier === 0) return; const t = performance.now(); floats.push({ t0: t, text: '+ ' + ((C.payouts && C.payouts.symbol) || 'USDG'), x: CX, y: CY - 30, c: '#9af0c0' }); }, 900); }
  function drawFx(now) {
    fx.clearRect(0, 0, FW, FH);
    if (wave >= 0) { const u = (now - wave) / 1500; if (u > 1) wave = -1; else for (let y = 0; y < FH; y += 6) { const x = u * (FW + 160) - 80 - y * .45 + Math.sin(y * .3 + now / 200) * 4; px(x, y, 14, 2, 'rgba(255,255,255,.75)'); px(x - 22, y + 2, 8, 2, 'rgba(255,255,255,.4)'); } }
    coins = coins.filter((c) => now < c.t0 + c.dur); for (const c of coins) { if (now < c.t0) continue; const u = (now - c.t0) / c.dur; coin(c.x0 + (c.x1 - c.x0) * u, c.y0 + (c.y1 - c.y0) * u - Math.sin(u * Math.PI) * c.lift); }
    if (ring >= 0) { const u = (now - ring) / 600; if (u > 1) ring = -1; else { const r = 8 + u * 70; for (let k = 0; k < 28; k++) { const a = k / 28 * 6.283; px(CX + Math.cos(a) * r * 1.5, CY + Math.sin(a) * r * .75, 4, 4, k % 2 ? '#fff' : '#ffc93c'); } if (u < .25) px(0, 0, FW, FH, 'rgba(255,255,255,' + (.5 - u * 2) + ')'); } }
    floats = floats.filter((f) => now < f.t0 + 1500); for (const f of floats) { if (now < f.t0) continue; const u = (now - f.t0) / 1500; word(f.text, f.x, f.y - u * 26, u < .7 ? 1 : (1 - u) / .3, f.c); }
  }
  setTier(3); lastTide = -5800; // open in full colour with a tide landing almost at once; the story restarts from asleep after the top level
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(document.querySelector('.stage'));
  if (still) { sea.draw(3000, true); drawNft(4); }
  else { let artAt = 0, fxWas = true; (function loop(now) {
    if (visible && !document.hidden) {
      if (auto && !busy && now - lastSwitch > (me.tier === 0 ? 2600 : 5200)) { lastSwitch = now; burn(false); }
      if (!busy && me.tier > 0 && wave < 0 && (now - lastTide > (auto ? 1200 : 7000) && !(auto && tided) || Date.now() % 3600000 < 1200)) { tided = true; tide(now); }
      // Pixel art only changes every 90ms, so redrawing it every frame cost ~20% of a phone CPU for identical frames.
      // Full rate only while a burn or a tide is animating; the coin effects always run at full rate.
      if (busy || wave >= 0 || now - artAt > 90) { artAt = now; sea.draw(now, false); drawNft(Math.floor(now / 90)); }
      const fxBusy = coins.length > 0 || floats.length > 0 || ring >= 0 || wave >= 0; if (fxBusy || fxWas) drawFx(now); fxWas = fxBusy;
    }
    requestAnimationFrame(loop);
  })(0); }

  // ---- status cell: one honest fact about where things stand, from config
  function paintStatus() { const st = document.getElementById('heroStatus'), say = (label, value) => { st.querySelector('dt').textContent = label; st.querySelector('dd').lastChild.textContent = value; st.classList.add('on'); }; const o = SH.isOpen(); if (o.token) say(T.symbol + ' is', 'Live'); else if (o.mint) say('the mint is', 'Open'); else if (C.mint.closed) say('the mint is', 'Minted out'); else if (o.list) say('the list is', 'Open');
    // list closed, mint not open yet: the page's default ("the list opens / Soon") would be false here (audit 2026-09-26)
    else if (C.list.closed) { const t = SH.mintAt(), d = t && new Date(t), p2 = (n) => String(n).padStart(2, '0'); st.querySelector('dt').textContent = 'the mint opens'; st.querySelector('dd').lastChild.textContent = d ? p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ' UTC' : 'Soon'; } }
  paintStatus();
  // ---- the two halves: the hero crab at the top level
  paintPiece(document.getElementById('duoNft').getContext('2d'), SH.hero(), { level: 5, seed: 3, frame: 10 });
  if (C.contracts.token) document.getElementById('tokenState').textContent = C.token.symbol + ' is live. The address is in the docs and on the token page.';
  // ---- tide clock: counts down to the top of the hour
  (function () { const d = document.getElementById('tideDigits'), bar = document.getElementById('tideBar'); if (C.contracts.token) document.getElementById('tideNote').textContent = 'If nobody trades in an hour, that hour pays nothing.';
    const tick = () => { const now = Date.now(), left = 3600000 - (now % 3600000), m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000); d.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); bar.style.width = (100 - left / 36000) + '%'; }; tick(); setInterval(tick, 1000); })();
  // ---- how many are on the list, from a static file we host. Never the Worker: its daily budget is shared with applying.
  // The same request measures how far this visitor's clock is from ours, for the mint clock. no-store, because a
  // copy from the browser's cache carries the Date it was stored with and would report a gap that is not there.
  const t0 = Date.now();
  if (C.list.countFile) fetch(C.list.countFile, { cache: 'no-store' }).then((r) => { const d = Date.parse(r.headers.get('date') || ''); if (d) SH.setSkew(d + 500 - (t0 + Date.now()) / 2); /* the CDN already rewrites Date to now; adding Age ran the site up to 10 min fast on mint day */ return r.json(); }).then((d) => { if (d && d.count > 0) { const n = document.getElementById('listCount'); n.hidden = false; n.textContent = Number(d.count).toLocaleString('en-US') + ' already on the list'; } }).catch(() => {});
  // ---- the last pot, from the keeper's public record (same feed as /tides/). Stays blank until the feed exists.
  if (C.tides && C.tides.feed) fetch(C.tides.feed).then((r) => r.json()).then((rows) => { const last = rows.slice().sort((p, q) => q.t - p.t)[0]; if (last && last.potUsd != null) { const n = document.getElementById('potLine'); n.textContent = 'Last tide: $' + Number(last.potUsd).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' in ' + ((C.payouts && C.payouts.symbol) || 'USDG') + ' shared by ' + Number(last.crabs).toLocaleString('en-US') + ' crabs. '; n.append(el('a', { href: '/tides/', text: 'Every tide', style: 'color:inherit' })); } }).catch(() => {});
  // once the token is live the bar's call to action is already 'Buy $CRAB', so a second $CRAB button would repeat it
  if (SH.stage() === 'token') document.getElementById('stickyAlt').hidden = true;
  // ---- phone: show the action bar once the hero buttons scroll away
  (function () { const bar = document.getElementById('sticky'), cta = document.querySelector('[data-check="cta"]'); if (!bar || !cta || !('IntersectionObserver' in window)) return; new IntersectionObserver((es) => bar.classList.toggle('on', !es[0].isIntersecting)).observe(cta); })();
  const idle = window.requestIdleCallback ? (f) => requestIdleCallback(f, { timeout: 1200 }) : (f) => setTimeout(f, 200);
  idle(() => {
  // ---- marquee of crabs
  const r = rnd(99173);
  for (const id of ['lane1', 'lane2']) { const lane = document.getElementById(id), row = []; for (let i = 0; i < 16; i++) row.push(piece(rollTraits(r), { seed: i + 3 })); row.forEach((c) => lane.append(c)); row.forEach((c) => { const d = el('canvas', { class: 'px', width: 32, height: 32 }); d.getContext('2d').drawImage(c, 0, 0); lane.append(d); }); }

  // ---- how it works: the same crab through the four steps
  const demo = { ...traitsOf(2248), eyes: 'plain', mouth: 'smile', extra: 'none', held: 'nothing' };
  paintPiece(document.getElementById('how1').getContext('2d'), demo, { level: 0, seed: 3, frame: 20 });
  paintPiece(document.getElementById('how2').getContext('2d'), { ...demo, eyes: 'big' }, { level: 1, seed: 3 });
  paintPiece(document.getElementById('how3').getContext('2d'), { ...demo, eyes: 'happy' }, { level: 5, seed: 3 });
  paintPiece(document.getElementById('how4').getContext('2d'), { ...demo, eyes: 'money', held: 'coin' }, { level: 3, seed: 3 });

  });
  // ---- galleries, built when scrolled near
  { const host = document.getElementById('isles'); for (let k = 0; k < 6; k++) host.append(el('canvas', { class: 'px', role: 'img', 'aria-label': 'A top-level island' })); }
  lazy(document.getElementById('isles'), () => { const sr = rnd(977), host = document.getElementById('isles'); for (let k = 0; k < 6; k++) { const c = host.children[k]; makeSea(c, [{ gx: GC, gy: GC, tier: 5, traits: rollTraits(sr), seed: 1000 + k * 37 }], { follow: true }).draw(5000 + k * 900, true); } });
  const blank = (name) => el('canvas', { class: 'px', width: 32, height: 32, role: 'img', 'aria-label': SHELL_NAMES[name] });
  { const host = document.getElementById('shells'); SHELL_LIST.forEach(([name]) => host.append(el('figure', {}, [blank(name), el('figcaption', { text: SHELL_NAMES[name] })]))); const lh = document.getElementById('legends'); LEGENDARY.forEach((name) => lh.append(el('figure', {}, [blank(name), el('figcaption', { text: SHELL_NAMES[name] })]))); }
  lazy(document.getElementById('shells'), () => { const sr = rnd(11), host = document.getElementById('shells'); const jobs = SHELL_LIST.map(([name], i) => () => { const t = normalise({ ...rollTraits(sr), shell: name, held: 'nothing', extra: 'none', eyes: ['plain', 'big', 'happy'][i % 3] }); paintPiece(host.children[i].firstChild.getContext('2d'), t, { seed: i }); }); (function batch() { jobs.splice(0, 8).forEach((f) => f()); if (jobs.length) requestAnimationFrame(batch); })(); }); // eight tiles a frame, so the page never stalls
  lazy(document.getElementById('legends'), () => {
    const host = document.getElementById('legends'), items = LEGENDARY.map((name, i) => { const t = legendTraits(name), c = host.children[i].firstChild, P = Painter(1); drawCrab(P, { ...resolve(t), shadow: 'rgba(40,25,10,.35)' }); return { t, c, P, seed: i + 200 }; });
    const draw = (f) => items.forEach((L) => { const x = L.c.getContext('2d'); drawScene(x, L.t.scene, L.seed, f); L.P.blit(x); sparkle(x, L.seed, f); });
    draw(4); if (still) return; let on = true, last = 0; new IntersectionObserver((es) => { on = es[0].isIntersecting; }).observe(host);
    (function loop(now) { if (on && !document.hidden && now - last > 110) { last = now; draw(Math.floor(now / 90)); } requestAnimationFrame(loop); })(0);
  });
  // ---- the item wall: every shop item, its name and what it adds (sprites are scaled by a whole number so they stay crisp)
  { const host = document.getElementById('itemwall'), list = (C.items && C.items.list) || []; list.forEach((it) => { const c = el('canvas', { class: 'px', role: 'img', 'aria-label': it.name }); host.append(el('figure', { class: it.immune ? 'wide' : null }, [el('a', { class: 'itembox' + (it.limit ? ' ltd' : ''), href: '/shop/?lv=5&i=' + it.id, 'aria-label': 'See the ' + it.name + ' on a live island' }, [c, it.limit ? el('span', { text: it.limit + ' ever' }) : null]), el('figcaption', {}, [el('b', { text: it.name }), el('span', { text: '+' + it.bonus + ' · burn ' + it.price }), it.immune ? el('em', { class: 'why', text: it.blurb }) : null])])); });
    // the items are drawn moving, as they are in the shop: the disco ball turns, the hot tub steams, the kraken waves
    const paintItems = (now) => list.forEach((it, i) => { const s = itemSprite(it.id, now), c = host.children[i].querySelector('canvas'), k = 144, z = Math.max(1, Math.floor(140 / Math.max(s.width, s.height))); if (c.width !== k) { c.width = k; c.height = k; } else if (c._s === s) return; c._s = s; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, k, k); x.drawImage(s, Math.round((k - s.width * z) / 2), Math.round((k - s.height * z) / 2), s.width * z, s.height * z); });
    lazy(host, () => { paintItems(0); if (still) return; let on = true, last = 0; if ('IntersectionObserver' in window) new IntersectionObserver((es) => { on = es[0].isIntersecting; }).observe(host); (function loop(now) { if (on && !document.hidden && now - last > 110) { last = now; paintItems(now); } requestAnimationFrame(loop); })(0); }); }
  // ---- drag to compare: one crab, asleep and at the top level, framed the same way
  lazy(document.getElementById('cmp'), () => {
    const box = document.getElementById('cmp'), range = document.getElementById('cmpR'), t = traitsOf(2207), mk = (id, tier) => makeSea(document.getElementById(id), [{ gx: GC, gy: GC, tier, traits: t, seed: 5150 }], { follow: true, viewTier: 5, night: () => true });
    const A = mk('cmpA', 0), B = mk('cmpB', 5); range.addEventListener('input', () => box.style.setProperty('--cut', range.value + '%'));
    if (still) { A.draw(3000, true); B.draw(3000, true); return; }
    let on = true, hinted = false; new IntersectionObserver((es) => { on = es[0].isIntersecting; if (on && !hinted) { hinted = true; const t0 = performance.now(); (function sway(now) { const u = (now - t0) / 1600; if (u > 1 || range.matches(':active')) return; range.value = 44 + Math.sin(u * Math.PI * 2) * 22; box.style.setProperty('--cut', range.value + '%'); requestAnimationFrame(sway); })(t0); } }, { threshold: .6 }).observe(box);
    let artAt = 0; (function loop(now) { if (on && !document.hidden && now - artAt > 110) { artAt = now; A.draw(now, false); B.draw(now, false); } requestAnimationFrame(loop); })(0);  // same 110ms step as /sea/
  });
  // ---- what happens when: the states come from config
  function paintWhen() { const lede = document.getElementById('whenLede'), SAY = {
      pre: 'Nothing is live yet. When a step opens, it changes here first.',
      list: 'The list is open. The mint and the token come next, and each one changes here first.',
      listShut: 'The list has closed. The mint comes next, and it changes here first.',
      mint: 'The mint is open. The token comes next, and it changes here first.',
      mintShut: 'The mint has closed. The token comes next, and it changes here first.',
      token: C.token.symbol + ' is live. Every step is done.',
    }; if (lede) lede.textContent = SAY[SH.stage()];
    const live = document.getElementById('faqLive'), LIVE = {
      pre: 'No. There is no mint and no token today. The list is the first thing to open. If you see a token with our name before we announce it here, it is fake.',
      list: 'Only the list. There is no mint and no token today' + (SH.mintAt() && !SH.mintDue() ? ', and the mint opens ' + SH.mintWhen() : '') + '. If you see a token with our name before we announce it here, it is fake.',
      listShut: 'Not yet. The list has closed and the mint is next' + (SH.mintAt() && !SH.mintDue() ? ', on ' + SH.mintWhen() : '') + '. There is no token today. If you see a token with our name before we announce it here, it is fake.',
      mint: 'The mint is open. There is no token yet. If you see a token with our name before we announce it here, it is fake.',
      mintShut: 'The mint has closed. There is no token yet. If you see a token with our name before we announce it here, it is fake.',
      token: 'Yes. The mint has run and ' + C.token.symbol + ' is live. The only real address is the one on this site.',
    }; if (live) live.textContent = LIVE[SH.stage()];
    const L = document.getElementById('whenList'); if (!L) return; const set = (step, cls, text) => { const li = L.querySelector('[data-step="' + step + '"]'); li.className = cls; li.querySelector('em').textContent = text; };
    const o = SH.isOpen();
    if (o.list) set('list', 'on', 'Open now');
    else if (C.list.closed) set('list', 'done', 'Closed');
    if (o.mint) set('mint', 'on', 'Open now');
    else if (C.mint.closed) set('mint', 'done', 'Minted out');
    else if (SH.mintDue()) set('mint', '', 'Any minute now');
    else if (SH.mintAt()) set('mint', '', 'Opens ' + new Date(SH.mintAt()).toUTCString().slice(5, 22) + ' UTC');
    if (o.token) set('token', 'on', 'Live');
    // Each step's button follows the stage too: the live step gets the coral action, a finished step loses its
    // button, and a step still to come only explains itself. Written once, these went stale at every later stage.
    const go = (step, text, href, primary) => { const a = L.querySelector('[data-step="' + step + '"] .whengo'); if (!a) return; if (!text) { a.hidden = true; return; } a.hidden = false; a.textContent = text; a.href = href; a.classList.toggle('go', !!primary); };
    if (o.list) go('list', 'Get on the list', '/list/', true); else if (C.list.closed) go('list'); else go('list', 'Make your card', '/list/', false);
    if (o.mint) go('mint', 'Mint now', C.mint.url || '/docs/#mint', true); else if (C.mint.closed) go('mint'); else if (C.links.opensea) go('mint', 'See the drop on OpenSea', C.links.opensea, false); else go('mint', 'How the mint works', '/docs/#mint', false);
    if (o.token) { go('token', 'Buy ' + C.token.symbol, C.links.buy || '/token/#buy', true); const a = L.querySelector('[data-step="token"] .whengo'); if (a && C.links.buy) { a.target = '_blank'; a.rel = 'noopener'; } }
    else go('token', 'How the token works', '/token/', false); }
  paintWhen();
  // the mint clock reaching zero changes the stage under an open page; these two are the home page's share of that
  document.addEventListener('crabstage', () => { paintStatus(); paintWhen(); });
})();
