// The sea: a sample archipelago you can drag around. After launch the same page reads the real crabs.
// LIVE = contracts.crabs is set AND sea.feed names the JSON the keeper writes (keeper/README.md): then every island
// is a real crab, drawn from its real collection row (art/collection.json, the same rows the pictures were made
// from), with its real level, items and tide pool. Type a wallet address to see only that wallet's crabs. If the
// feed cannot be read the page falls back to the sample and says so, never to a blank sea.
(function () {
  const { C, el, still, paintPiece, seedOf, traitsOf } = SH; SH.mount(); buildProps();
  const LIVE = !!(C.contracts && C.contracts.crabs && C.sea && C.sea.feed);
  let live = null, page = 0; // { at, crabs, rows }
  const isAddr = (s) => /^0x[0-9a-fA-F]{40}$/.test(String(s || '').trim());
  const itemsOf = (mask) => ITEM_IDS.filter((_, i) => mask & (1 << i));
  const money = (v) => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  async function loadLive() {
    const [feed, rows] = await Promise.all([fetch(C.sea.feed, { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }), fetch('/art/collection.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })]);
    if (!feed || !Array.isArray(feed.crabs) || !Array.isArray(rows)) throw new Error('shape');
    live = { at: feed.at, crabs: feed.crabs.filter((c) => c && c.owner && rows[c.id - 1]), rows };
  }
  /// which real crabs fill the grid: one wallet's, or the top of the collection by awake, pool, level
  function chooseLive() {
    const all = live.crabs, n = COLS * ROWS;
    const list = mine && isAddr(mine.name) ? all.filter((c) => c.owner.toLowerCase() === mine.name.toLowerCase()) : all.slice();
    list.sort((a, b) => (b.awake - a.awake) || (b.pool - a.pool) || (b.level - a.level) || (a.id - b.id));
    const pages = Math.max(1, Math.ceil(list.length / n)); page = ((page % pages) + pages) % pages;
    return { chosen: list.slice(page * n, page * n + n), total: list.length, pages };
  }
  const $ = (id) => document.getElementById(id), view = $('view'), canvas = $('sea');
  const SMALL = matchMedia('(max-width:700px), (pointer:coarse)').matches, COLS = SMALL ? 4 : 6, ROWS = SMALL ? 3 : 4, W = SMALL ? 1240 : 1800, H = SMALL ? 840 : 1100; // a phone gets a smaller sea: half the islands, half the pixels
  // how a young collection tends to look: many asleep, a few at the top
  const MIX = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5];
  const MINE = SMALL ? 5 : 8; let sea, isles, mine = null, zoom = 1, ox = 0, oy = 0, picked = -1, seed = 20260919;
  function build() {
    const r = rnd(seed); isles = [];
    if (live) {
      const { chosen } = chooseLive();
      chosen.forEach((c, k) => { const cx = k % COLS, cy = Math.floor(k / COLS); isles.push({ gx: 20 + cx * 30 + (cy % 2) * 12 + Math.floor(r() * 7) - 3, gy: 20 + cy * 30 + Math.floor(r() * 7) - 3, tier: c.awake ? c.level : 0, traits: decodePiece(live.rows[c.id - 1]), seed: c.id, id: c.id, items: itemsOf(c.items), live: c, mine: !!(mine && isAddr(mine.name)) }); });
      if (!isles.length) isles.push({ gx: 20, gy: 20, tier: 0, traits: traitsOf(1), seed: 1, id: 0, items: [], empty: true });
      sea = makeSea(canvas, isles, { W, H }); sea.draw(1000, true); picked = -1; return;
    }
    for (let k = 0; k < COLS * ROWS; k++) { const cx = k % COLS, cy = Math.floor(k / COLS); isles.push({ gx: 20 + cx * 30 + (cy % 2) * 12 + Math.floor(r() * 7) - 3, gy: 20 + cy * 30 + Math.floor(r() * 7) - 3, tier: MIX[Math.floor(r() * MIX.length)], traits: rollTraits(r), seed: 100 + Math.floor(r() * 90000), id: 1 + Math.floor(r() * C.collection.supply) }); const I = isles[isles.length - 1], n = I.tier ? Math.floor(r() * (I.tier + 1)) : 0, ids = ITEM_IDS.slice().sort(() => r() - .5); I.items = ids.slice(0, n); }
    if (mine) { const k = MINE; Object.assign(isles[k], { traits: traitsOf(mine.seed), seed: mine.seed % 100000, tier: Math.max(isles[k].tier, 3), mine: true, name: mine.name }); }
    sea = makeSea(canvas, isles, { W, H }); sea.draw(1000, true); picked = -1;
  }
  function place() { const vw = view.clientWidth, vh = view.clientHeight, cw = W * zoom, ch = H * zoom; ox = Math.min(0, Math.max(vw - cw, ox)); oy = Math.min(0, Math.max(vh - ch, oy)); canvas.style.width = cw + 'px'; canvas.style.transform = 'translate(' + Math.round(ox) + 'px,' + Math.round(oy) + 'px)'; }
  function centreOn(px, py) { ox = view.clientWidth / 2 - px * zoom; oy = view.clientHeight / 2 - py * zoom; place(); }
  function setZoom(z) { const vw = view.clientWidth, vh = view.clientHeight, cx = (vw / 2 - ox) / zoom, cy = (vh / 2 - oy) / zoom; zoom = Math.max(1, Math.min(3, Math.round(z))); centreOn(cx, cy); }
  function show(i) {
    picked = i; const I = isles[i], t = I.traits, cat = Object.fromEntries(((C.items && C.items.list) || []).map((x) => [x.id, parseFloat(x.bonus)])), lw = parseFloat((C.token.levelWeights || [])[I.tier - 1]) || 0, bonus = Math.round(Math.min((I.items || []).reduce((a, id) => a + (cat[id] || 0), 0), lw * ((C.items && C.items.capPct) || 100) / 100) * 100) / 100;
    paintPiece($('nft').getContext('2d'), t, { level: I.tier, seed: I.seed, frame: 6 });
    if (I.live) {
      const c = I.live, lvw = C.token.levelWeights && C.token.levelWeights[c.level - 1];
      $('cMine').hidden = false; $('cMine').textContent = I.mine ? 'Your crab' : 'Real crab'; $('cMine').className = I.mine ? 'mine' : 'mine plain'; $('cName').textContent = 'Crab #' + c.id;
      $('cLine').textContent = !c.awake ? (c.level ? 'Asleep, level ' + c.level + ' kept. It earns nothing until its owner burns ' + C.token.symbol + ' to wake it.' : 'Asleep, never woken. It earns nothing until its owner burns ' + C.token.symbol + ' to wake it.')
        : 'Awake at level ' + c.level + (lvw ? ', share ' + (c.power / 100) + 'x' : '') + (c.immune ? ', un-raidable' : '') + '. Tide pool: ' + money(c.pool) + (c.pool > 0 ? ', waiting to be claimed.' : '.');
      const names = Object.fromEntries(((C.items && C.items.list) || []).map((i) => [i.id, i.name])), dl = $('cTraits'); dl.textContent = '';
      [I.items.length ? ['Items', I.items.map((id) => names[id] || id).join(', ')] : null, ['Owner', c.owner.slice(0, 6) + '…' + c.owner.slice(-4)], ['Shell', t.legend ? SHELL_NAMES[t.shell] : SHELL_NAMES[t.shell]], ['Body', t.body[0]], ['Eyes', t.eyes], t.held !== 'nothing' ? ['Holding', t.held] : null, t.extra && t.extra !== 'none' ? ['Accessory', t.extra] : null, ['Backdrop', t.scene], t.legend ? ['Legend', 'yes'] : null].filter(Boolean).forEach(([k, v]) => dl.append(el('dt', { text: k }), el('dd', { text: v })));
      return;
    }
    if (I.empty) { $('cMine').hidden = false; $('cMine').textContent = 'No crabs'; $('cMine').className = 'mine plain'; $('cName').textContent = mine ? mine.name.slice(0, 10) + '…' : ''; $('cLine').textContent = 'This wallet holds no crab yet.'; $('cTraits').textContent = ''; return; }
    $('cMine').hidden = false; $('cMine').textContent = I.mine ? 'Your island (sample)' : 'Sample crab'; $('cMine').className = I.mine ? 'mine' : 'mine plain'; $('cName').textContent = I.mine ? I.name.slice(0, 18) : 'Crab #' + I.id; $('cLine').textContent = I.tier === 0 ? 'Asleep. A crab like this earns nothing until its owner burns ' + C.token.symbol + ' to wake it.' : 'Awake at level ' + I.tier + (C.token.levelWeights && C.token.levelWeights[I.tier - 1] ? ', share ' + C.token.levelWeights[I.tier - 1] + (bonus ? ' + ' + bonus + 'x from items' : '') : '') + '. A crab like this would be paid every hour into its tide pool.';
    const names = Object.fromEntries(((C.items && C.items.list) || []).map((i) => [i.id, i.name])); const rows = [(I.items && I.items.length) ? ['Items', I.items.map((id) => names[id] || id).join(', ')] : null, ['Shell', SHELL_NAMES[t.shell]], ['Body', t.body[0]], ['Eyes', t.eyes], t.held !== 'nothing' ? ['Holding', t.held] : null, t.extra !== 'none' ? ['Accessory', t.extra] : null, ['Backdrop', t.scene]].filter(Boolean), dl = $('cTraits'); dl.textContent = ''; rows.forEach(([k, v]) => dl.append(el('dt', { text: k }), el('dd', { text: v })));
  }
  function pick(clientX, clientY) { const b = view.getBoundingClientRect(), x = (clientX - b.left - ox) / zoom, y = (clientY - b.top - oy) / zoom; let best = -1, bd = 1e9; isles.forEach((I, i) => { const p = sea.at(I.gx, I.gy), d = Math.hypot((p.sx - x) / 2, p.sy + 4 - y); if (d < bd) { bd = d; best = i; } }); if (bd < 46) show(best); }
  // drag to pan; a press that barely moves is a click
  let drag = null;
  view.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; drag = { x: e.clientX, y: e.clientY, ox, oy, moved: 0 }; view.setPointerCapture(e.pointerId); view.classList.add('grab'); });
  view.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy)); ox = drag.ox + dx; oy = drag.oy + dy; place(); });
  const end = (e) => { if (!drag) return; const d = drag; drag = null; view.classList.remove('grab'); if (d.moved < 6) pick(e.clientX, e.clientY); };
  view.addEventListener('pointerup', end); view.addEventListener('pointercancel', () => { drag = null; view.classList.remove('grab'); });
  view.addEventListener('keydown', (e) => { const s = 60, k = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key]; if (k) { e.preventDefault(); ox += k[0]; oy += k[1]; place(); } if (e.key === '+' || e.key === '=') setZoom(zoom + 1); if (e.key === '-') setZoom(zoom - 1); });
  view.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setZoom(zoom + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
  $('zin').addEventListener('click', () => setZoom(zoom + 1)); $('zout').addEventListener('click', () => setZoom(zoom - 1));
  $('shuffle').addEventListener('click', () => { if (live) page++; else seed = (seed * 31 + 7) % 1e9; build(); start(); });
  function start() { zoom = mine ? 2 : 1; const best = live ? 0 : mine ? MINE : isles.reduce((a, I, i) => (I.tier > isles[a].tier ? i : a), 0), p = sea.at(isles[best].gx, isles[best].gy); centreOn(p.sx, p.sy); show(best); }
  $('find').addEventListener('submit', (e) => { e.preventDefault(); const name = $('who').value.trim(); if (!name) return; if (live && !isAddr(name)) { $('demoTag').textContent = 'Type a wallet address (0x…) to see its crabs.'; return; } page = 0; mine = { name, seed: seedOf(name) }; build(); start(); history.replaceState(null, '', '?me=' + encodeURIComponent(name)); view.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' }); });
  { const q = new URLSearchParams(location.search).get('me'); if (q) { mine = { name: q.slice(0, 64), seed: seedOf(q) }; $('who').value = mine.name; } }
  addEventListener('resize', place);
  $('demoTag').textContent = 'Filling the sea...';
  const boot = () => { build(); start(); if (live) { const d = new Date(live.at * 1000), p2 = (n) => String(n).padStart(2, '0'), { total, pages } = chooseLive(); $('demoTag').textContent = 'The real sea as of ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ' UTC' + (mine && isAddr(mine.name) ? ': ' + total + ' crab' + (total === 1 ? '' : 's') + ' in this wallet' : ': ' + total + ' crabs') + (pages > 1 ? ', page ' + (page + 1) + ' of ' + pages : '') + '.'; $('who').placeholder = 'a wallet address, 0x…'; } else $('demoTag').textContent = 'A sample sea. After the mint, this shows the real one.' + (LIVE ? ' (The live feed could not be read just now.)' : ''); };
  if (LIVE) loadLive().catch(() => { live = null; }).then(() => requestAnimationFrame(() => setTimeout(boot, 30))); else requestAnimationFrame(() => setTimeout(boot, 30));
  let on = true; if ('IntersectionObserver' in window) new IntersectionObserver((es) => { on = es[0].isIntersecting; }).observe(view);
  let lastDraw = 0; if (!still) (function loop(now) { if (sea && on && !document.hidden && !drag && now - lastDraw > (SMALL ? 160 : 110)) { lastDraw = now; sea.draw(now, false); } requestAnimationFrame(loop); })(0);
})();
