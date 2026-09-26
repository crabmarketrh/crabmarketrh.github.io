// The tide pools: a toy that plays the whole game out. Two islands, two pools, one rival who will help itself.
(function () {
  const { C, el, still } = SH; SH.mount(); buildProps();
  const $ = (id) => document.getElementById(id), R = C.raid, money = (v) => '$' + v.toFixed(2);
  const TAKE = (R.takePct || 50) / 100, FLOOR = Number(R.minPool || 1), FULL = 60, PAY = 5.5;  // sizes a real pool reaches: below the floor a raid cannot happen, and a raid only pays well above it
  const me = { gx: GC, gy: GC, tier: 3, traits: SH.hero(), seed: 4242, pool: 0 };
  const them = { gx: GC, gy: GC, tier: 3, traits: rollTraits(rnd(8112)), seed: 5150, pool: 0 };
  const seaMine = makeSea($('seaMine'), [me], { follow: true }), seaThem = makeSea($('seaThem'), [them], { follow: true });
  let wallet = 0, burned = 0, myCd = 0, theirCd = 0, warned = 0, hour = 0, lastTick = 0;
  const fx = $('raidFx').getContext('2d'); let flights = [], shout = null;
  // The canvas was a fixed 900x420 buffer stretched to whatever width the layout gave it, so every coin was
  // drawn into a squashed space and landed off its target. Match the buffer to the box and draw in CSS pixels.
  function sizeFx() { const c = $('raidFx'), r = c.getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    fx.setTransform(dpr, 0, 0, dpr, 0, 0); fx.imageSmoothingEnabled = false; }
  sizeFx(); addEventListener('resize', sizeFx);

  function show(text) { $('story').textContent = text; }
  function paint() {
    me.pool = Math.min(1, state.mine / FULL); them.pool = Math.min(1, state.them / FULL);
    $('myPool').textContent = money(state.mine); $('myWallet').textContent = money(wallet);
    $('theirPool').textContent = money(state.them); $('wouldTake').textContent = money(state.them * TAKE);
    $('burned').textContent = burned.toLocaleString('en-US');
    $('claim').disabled = state.mine <= 0;
    const safe = state.mine < FLOOR, cd = Math.max(0, myCd - hour);
    $('myWhen').textContent = safe ? 'too small to raid' : cd ? 'safe for ' + cd + 'h' : 'anyone can raid it';
    $('myWhen').className = 'cdchip ' + (safe || cd ? 'on' : 'off');
    $('theirWhen').textContent = state.them < FLOOR ? 'too small to raid' : Math.max(0, theirCd - hour) ? 'you raided it, wait ' + (theirCd - hour) + 'h' : 'you can raid it now';
    $('theirWhen').className = 'cdchip ' + (state.them < FLOOR || theirCd > hour ? 'off' : 'on');
    const ok = state.them >= FLOOR && theirCd <= hour;
    $('raid').disabled = !ok; $('raid').title = ok ? '' : state.them < FLOOR ? 'Their pool is too small to raid' : 'You raided them recently';
  }
  const state = { mine: 0, them: 0 };

  // coins flying from one pool to the other, and a shout over the island that lost them
  function fly(dir, n) { const box = $('raidFx').getBoundingClientRect();
    const mine = $('pondMine').getBoundingClientRect(), theirs = $('pondThem').getBoundingClientRect(), purse = $('myWallet').getBoundingClientRect();
    // claiming empties your own pool into your wallet, so the coins travel down the card, not across to the rival
    const from = dir === 'in' ? theirs : mine, to = dir === 'in' ? mine : dir === 'claim' ? purse : theirs, t0 = performance.now();
    const fy = dir === 'claim' ? .42 : .42, ty = dir === 'claim' ? .5 : .42, arc = dir === 'claim' ? 38 : 70;
    for (let k = 0; k < n; k++) flights.push({ t0: t0 + k * 55, x0: from.left - box.left + from.width / 2, y0: from.top - box.top + from.height * fy, x1: to.left - box.left + to.width / 2, y1: to.top - box.top + to.height * ty, dur: 620, gold: dir !== 'claim' });
    shout = { t0, x: from.left - box.left + from.width / 2, y: from.top - box.top + from.height * .3, text: dir === 'in' ? 'TAKEN!' : dir === 'claim' ? 'CLAIMED!' : 'RAIDED!', safe: dir === 'claim' }; }
  function drawFx(now) {
    const c = $('raidFx'); fx.clearRect(0, 0, c.width, c.height);
    flights = flights.filter((f) => now < f.t0 + f.dur);
    for (const f of flights) { if (now < f.t0) continue; const u = (now - f.t0) / f.dur, x = f.x0 + (f.x1 - f.x0) * u, y = f.y0 + (f.y1 - f.y0) * u - Math.sin(u * Math.PI) * 70;
      fx.fillStyle = '#12222f'; fx.fillRect(x - 6, y - 6, 12, 12); fx.fillStyle = f.gold === false ? '#5fd3a0' : '#ffc93c'; fx.fillRect(x - 4, y - 4, 8, 8); fx.fillStyle = f.gold === false ? '#d6f7e8' : '#fff3b0'; fx.fillRect(x - 3, y - 3, 3, 3); }
    if (shout) { const u = (now - shout.t0) / 1400; if (u > 1) shout = null; else { fx.font = '22px Silkscreen, monospace'; fx.textAlign = 'center'; fx.globalAlpha = u < .7 ? 1 : (1 - u) / .3;
      fx.fillStyle = '#12222f'; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) fx.fillText(shout.text, shout.x + dx, shout.y - u * 26 + dy); fx.fillStyle = shout.safe ? '#5fd3a0' : '#ff6b57'; fx.fillText(shout.text, shout.x, shout.y - u * 26); fx.globalAlpha = 1; } }
  }

  function claim() { if (state.mine <= 0) return; wallet += state.mine; state.mine = 0; warned = 0;
    if (!still) fly('claim', 6); show('Claimed. That money is in your wallet now and nobody can touch it.'); paint();
    const purse = $('myWallet'); purse.classList.remove('paid'); void purse.offsetWidth; purse.classList.add('paid'); }
  function raid() { if ($('raid').disabled) return; const take = state.them * TAKE; state.them -= take; state.mine += take; burned += Number(String(R.fee).replace(/,/g, '')) || 0; theirCd = hour + (R.cooldownHours || 12);
    if (!still) fly('in', 6); show('You raided their pool for ' + money(take) + ' and burned ' + R.fee + ' ' + C.token.symbol + '. It is in your pool now, so it can be taken straight back.'); paint(); }
  function hourPasses() {
    hour++; state.mine += PAY; state.them += PAY * 1.4;
    if (state.mine >= FLOOR && myCd <= hour && !warned) { warned = hour; show('Their crab has spotted your pool. Claim it, or lose half of it.'); }
    else if (warned && hour > warned && state.mine >= FLOOR && myCd <= hour) { const take = state.mine * TAKE; state.mine -= take; state.them += take; myCd = hour + (R.cooldownHours || 12); warned = 0;
      if (!still) fly('out', 6); show('They raided you for ' + money(take) + '. Claiming is how you stop that.'); }
    else if (!warned) show('An hour passed. ' + money(PAY) + ' dropped into your pool.');
    paint();
  }
  // ---- the board: who is worth raiding, and when. LIVE (contracts.crabs + sea.feed set): real pools from the
  // keeper's sea feed, cooldowns from the raids feed (a pool hit less than cooldownHours ago waits); the crab is
  // drawn from its real collection row. Otherwise example rows. The Raid button stays a pointer until the wallet
  // pages exist: raiding is a transaction, and this site never asks for a wallet.
  const LIVE = !!(C.contracts && C.contracts.crabs && C.sea && C.sea.feed);
  function renderBoard(rows, live) {
    const host = $('boardRows'); host.textContent = '';
    rows.forEach((row) => {
      const tr = el('tr', { class: row.cd ? 'cool' : '' }, [
        el('td', {}, [el('div', { class: 'who' }, [SH.piece(row.traits, { level: row.lv, seed: row.id, label: '' }), el('b', { text: '#' + row.id.toLocaleString('en-US') })])]),
        el('td', { text: String(row.lv) }),
        el('td', { class: 'amt', text: money(row.pool) }),
        el('td', {}, [el('span', { class: 'cdchip ' + (row.cd ? 'off' : 'on'), text: row.cd ? 'in ' + row.cd + 'h' : 'now' })]),
        el('td', {}, [el('button', { class: 'btn sm', type: 'button', disabled: true, text: R.live ? 'Raid' : 'Opens with ' + C.token.symbol })]),
      ]);
      host.append(tr);
    });
    if (live) $('boardTag').textContent = 'The real board: ' + rows.length + ' pool' + (rows.length === 1 ? '' : 's') + ' worth raiding, updated every 10 minutes.' + (rows.length ? '' : ' Nothing above the floor right now.');
    else if (R.live) $('boardTag').textContent = 'Updated every hour.';
  }
  function sampleBoard() {
    const r = rnd(20260920), rows = [];
    for (let k = 0; k < 8; k++) { const lv = 1 + Math.floor(r() * 5), pool = Math.round((FLOOR + 1 + r() * r() * 400) * 100) / 100, cd = r() < .3 ? 1 + Math.floor(r() * (R.cooldownHours || 12)) : 0;
      rows.push({ id: 1 + Math.floor(r() * C.collection.supply), lv, pool, cd, traits: rollTraits(r) }); }
    rows.sort((a, b) => b.pool - a.pool);
    renderBoard(rows, false);
  }
  async function liveBoard() {
    const [feed, rowsArt, raids] = await Promise.all([
      fetch(C.sea.feed, { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      fetch('/art/collection.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      R.feed ? fetch(R.feed, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).catch(() => []) : Promise.resolve([]),
    ]);
    const now = Math.floor(Date.now() / 1000), cool = (R.cooldownHours || 12) * 3600, lastHit = {};
    for (const x of raids) if (x && x.fromId != null) lastHit[x.fromId] = Math.max(lastHit[x.fromId] || 0, x.t || 0);
    const rows = (feed.crabs || []).filter((c) => c.awake && !c.immune && c.pool >= FLOOR && rowsArt[c.id - 1]).map((c) => {
      const left = lastHit[c.id] ? lastHit[c.id] + cool - now : 0;
      return { id: c.id, lv: c.level, pool: c.pool, cd: left > 0 ? Math.ceil(left / 3600) : 0, traits: decodePiece(rowsArt[c.id - 1]) };
    }).sort((a, b) => b.pool - a.pool).slice(0, 40);
    renderBoard(rows, true);
  }
  if (LIVE) liveBoard().catch(() => { sampleBoard(); $('boardTag').textContent = 'The live board could not be read just now; these are example rows.'; }); else sampleBoard();

  { const f = document.getElementById('guardFloor'); if (f) f.textContent = String((R.takePct || 50) - (R.guardCapPct || 0)); }
  $('claim').addEventListener('click', claim); $('raid').addEventListener('click', raid);
  paint(); seaMine.draw(1000, true); seaThem.draw(1000, true);
  if (C.raid.live) { $('liveState').textContent = 'Raiding is live. '; $('liveState').append(el('a', { href: '/tides/#raids', text: 'Every raid is listed here.' })); }
  if (still) { hourPasses(); return; }
  let on = true; if ('IntersectionObserver' in window) new IntersectionObserver((es) => { on = es[0].isIntersecting; }).observe($('pondMine'));
  let artAt = 0, fxWas = true; (function loop(now) { if (on && !document.hidden) { if (now - lastTick > 2600) { lastTick = now; hourPasses(); } if (now - artAt > 110) { artAt = now; seaMine.draw(now, false); seaThem.draw(now, false); } const fxBusy = flights.length > 0 || !!shout; if (fxBusy || fxWas) drawFx(now); fxWas = fxBusy; } requestAnimationFrame(loop); })(0);  // islands at the art's step, coins at full rate on their own layer
})();
