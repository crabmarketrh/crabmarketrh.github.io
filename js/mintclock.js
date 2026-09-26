// The mint clock: a strip of beach under the header. Four crabs from the collection each mind the signpost for one
// unit of time, and each has the temper of its unit: the days crab sleeps, the seconds crab never stops.
// FACTS: the date is config.mint.opensAt (through SH.mintAt) and nothing else. Whether the mint is open is
// SH.isOpen() and nothing else. With no date set this file does nothing and the band stays hidden.
// CRISP: everything is drawn in whole logical pixels on a small canvas and scaled by a whole number (z), so a digit
// stroke is never 2 pixels wide in one place and 3 in another. Never size this canvas with a percentage.
(function () {
  const host = document.getElementById('mintclock'); if (!host || !window.SH || !SH.mintAt) return;
  const { C, still } = SH; let T = SH.mintAt();
  if (!T || SH.stage() === 'token' || C.mint.closed) return;
  const $ = (id) => document.getElementById(id), cv = $('mcCanvas'), x = cv.getContext('2d');
  const { INK, PAPER, BUTTER, GOLD, sprite, hopOf } = Beach;
  const H = 68, UNIT = 32, PITCH = 40, BW = 24, BH = 18, BOARD_Y = 5, CRAB_Y = 25, FEET = 55, LABEL_Y = 60, SHORE = 30;

  // ---- the four keepers. Real collection art, picked by hand so the four read apart at a glance.
  const find = (list, name) => list.find((c) => c[0] === name);
  const mk = (o) => normalise({ pat: 0, altColor: null, mouth: 'smile', claws: 'even', held: 'nothing', mark: 'none', extra: 'none', scene: 'sky', ...o, shellColor: find(SHELL_COLORS, o.sc), body: find(BODY_COLORS, o.b) });
  const KEEP = [
    { unit: 'DAYS', t: mk({ shell: 'mushroom', sc: 'crimson', b: 'tide', eyes: 'plain' }), mood: 'sleeper', poke: 'Z' },
    { unit: 'HOURS', t: mk({ shell: 'tophat', sc: 'violet', b: 'plum', eyes: 'shades', held: 'drink' }), mood: 'cool', poke: '?' },
    { unit: 'MINS', t: mk({ shell: 'can', sc: 'teal', b: 'lemon', eyes: 'big' }), mood: 'alert', poke: '!' },
    { unit: 'SECS', t: SH.hero(), mood: 'busy', poke: '!' },
  ];
  function dress(k) { k.img = sprite(k.t); k.shut = sprite(k.t, 'closed'); k.wave = k.t.held === 'nothing' ? sprite(k.t, null, true) : k.img; k.hop = 0; k.waveT = 0; k.awakeT = 0; k.emote = null; k.flip = null; k.shown = null; }
  KEEP.forEach(dress);

  // ---- the stage comes from the beach kit; this file only supplies the actors
  let x0 = 0;
  const S = Beach.strip(host, cv, { H, shore: SHORE, edges: [12, 19, 25], feet: FEET, tick: 1000,
    z: (cssW) => (cssW < 640 || innerHeight < 700 ? 2 : cssW >= 1500 && innerHeight >= 1000 ? 4 : 3),   // a short window gets the small beach, so the button under it stays on screen
    keepClear: () => [x0 - 6, x0 + 3 * PITCH + UNIT + 6],   // nothing washes up in front of the keepers
    onLayout(S, cssW) {
      // the two paper tags float beside the keepers only while there is honest room for them; otherwise the words stack
      const room = Math.floor(cssW / 2 - ((3 * PITCH + UNIT) / 2) * S.z - 22 - Math.max(20, (cssW - 1160) / 2 + 20));
      host.classList.toggle('stacked', room < 200); host.style.setProperty('--mc-room', room + 'px');
      x0 = Math.round(S.W / 2 - (3 * PITCH + UNIT) / 2);
    },
    frame });
  const { big, tiny, tinyW } = S.pen;

  // ---- someone from the collection wanders past behind the signs now and then. Crabs walk sideways, which is
  // the one walk cycle that needs no leg animation at all.
  let walker = null, nextWalk = 9000, walkSeed = 31;
  function walk(now) {
    if (still || state !== 'count' || left() < 70000) { walker = null; return; }
    if (!walker && now > nextWalk) { const dir = walkSeed % 2 ? 1 : -1; walker = { img: sprite(rollTraits(rnd(walkSeed++ * 7919))), x: dir > 0 ? -34 : S.W + 2, dir, t0: now }; }
    if (!walker) return;
    walker.x += walker.dir * (now - (walker.last || now)) / 95; walker.last = now;
    if (walker.x < -40 || walker.x > S.W + 8) { walker = null; nextWalk = now + 16000 + (walkSeed % 5) * 3000; return; }
    const wx = Math.round(walker.x), bob = Math.floor(now / 190) % 2;
    x.fillStyle = 'rgba(40,25,10,.22)'; x.fillRect(wx + 6, FEET - 8, 20, 2);
    x.drawImage(walker.img, wx, FEET - 8 - 31 - bob);
  }

  // ---- time
  let state = 'count';   // count -> open (the mint is on) or due (the hour has come and there is no link yet)
  const left = () => T - SH.now();
  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
  function parts() { const s = Math.max(0, Math.ceil(left() / 1000)); return [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60]; }

  // ---- one keeper and its sign
  function board(k, i, now, text, fill) {
    const bx = x0 + i * PITCH + (UNIT - BW) / 2; let s = 1, show = text;
    if (k.flip) { const u = (now - k.flip.t0) / 300; if (u >= 1) k.flip = null; else { s = Math.abs(1 - 2 * u); show = u < .5 ? k.flip.from : text; } }
    S.pen.post(bx + BW / 2, BOARD_Y + BH - 2, CRAB_Y + 6);
    const by = S.pen.sign(bx, BOARD_Y, BW, BH, fill, s);
    if (s < .8) return;
    if (show.length === 1) big(show, bx + 8, by + 3, INK, fill); else { big(show[0], bx + 3, by + 3, INK, fill); big(show[1], bx + 13, by + 3, INK, fill); }
  }
  function keeper(k, i, now) {
    const kx = x0 + i * PITCH, up = hopOf(now, k.hop);
    const asleep = k.mood === 'sleeper' && state === 'count' && now > k.awakeT && left() > 60000;
    const blink = !asleep && k.mood !== 'cool' && (Math.floor(now / 160) + i * 7) % 26 === 0;
    S.pen.shadow(kx, FEET, up);
    x.drawImage(asleep || blink ? k.shut : now < k.waveT ? k.wave : k.img, kx, CRAB_Y - up);
    const lw = tinyW(k.unit); tiny(k.unit, kx + Math.round((UNIT - lw) / 2), LABEL_Y, INK);
    if (asleep && !still) { const ph = (now / 800) % 3, zy = Math.round(ph * 3); x.globalAlpha = ph > 2.2 ? .4 : 1; tiny('Z', kx + 25 + Math.round(ph), CRAB_Y + 8 - zy, PAPER); x.globalAlpha = 1; }
    if (k.emote) { const u = (now - k.emote.t0) / 900; if (u > 1) k.emote = null; else { x.globalAlpha = u > .7 ? .5 : 1; x.fillStyle = INK; x.fillRect(kx + 27, CRAB_Y + 1 - Math.round(u * 5), 5, 7); tiny(k.emote.ch, kx + 28, CRAB_Y + 2 - Math.round(u * 5), GOLD); x.globalAlpha = 1; } }
    if (k.mood === 'busy' && state === 'count' && left() < 60000 && !still) { const ph = Math.floor(now / 120) % 4; x.fillStyle = '#9fdcff'; x.fillRect(kx + 1 - ph, CRAB_Y + 14 + ph, 1, 2); x.fillRect(kx + 30 + ph, CRAB_Y + 15 + ph, 1, 2); }
  }

  const burst = (now, n) => S.burst(now, n, x0, x0 + 3 * PITCH + UNIT, FEET - 6);

  // ---- words. The band says one thing per state, and every one of them is read from the stage.
    const dayUTC = () => { const d = new Date(T); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]; };
  const hourUTC = () => { const d = new Date(T); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' UTC'; };
  function words() {
    const st = SH.stage(), pub = SH.publicHour(), listLine = st === 'list' ? 'The list mints first' + (pub ? ', everyone else from ' + pub : '') + '.' : st === 'listShut' ? 'The list has closed. Wallets on it mint first' + (pub ? ', everyone else from ' + pub : '') + '.' : '';
    const say = { count: ['The mint opens in', listLine], due: ['Any minute now', 'The mint link shows up here and on our X account first.'], open: ['The mint is open', SH.roundLine()] }[state];
    $('mcLabel').textContent = say[0]; $('mcSub').textContent = say[1]; $('mcSub').hidden = !say[1];
    $('mcWhen').textContent = state === 'open' ? 'Opened' : 'Opens'; $('mcDate').textContent = dayUTC(); $('mcHour').textContent = hourUTC();
    const local = new Date(T), same = local.getTimezoneOffset() === 0, loc = $('mcLocal'); loc.hidden = same;
    if (!same) loc.textContent = local.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + local.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' where you are';
  }
  function spoken(p) {
    if (state !== 'count') { $('mcText').textContent = $('mcLabel').textContent + '.'; return; }
    const n = (v, w) => v + ' ' + w + (v === 1 ? '' : 's');
    $('mcText').textContent = 'The mint opens in ' + n(p[0], 'day') + ', ' + n(p[1], 'hour') + ', ' + n(p[2], 'minute') + ' and ' + n(p[3], 'second') + ', on ' + dayUTC() + ' at ' + hourUTC() + '.';
  }

  // ---- the moment itself
  let partyT = 0;
  function arrive(now, live) {
    state = SH.isOpen().mint ? 'open' : 'due'; words(); spoken();
    KEEP.forEach((k, i) => { k.flip = { t0: now + i * 90, from: k.shown || '00' }; });
    if (state === 'open') { document.dispatchEvent(new Event('crabstage')); if (live && !still) { partyT = now; burst(now, 40); setTimeout(() => burst(performance.now(), 30), 1500); const cta = $('heroCta'); if (cta) { cta.classList.add('nudge'); setTimeout(() => cta.classList.remove('nudge'), 9000); } } }
  }
  // The owner can move the date, or publish the mint link a few minutes late. A tab left open would never know, so
  // near the hour (and while waiting for the link) the published config is read again. A static file on our own host.
  let lastCheck = 0;
  function recheck(now) {
    const l = left(), every = state === 'due' ? 60000 : l < 3600000 ? 300000 : 0; if (!every || now - lastCheck < every || state === 'open') return; lastCheck = now;
    fetch('/config.js?cb=' + Math.floor(Date.now() / 60000), { cache: 'no-store' }).then((r) => r.text()).then((txt) => {
      const m = /mint:\s*\{\s*opensAt:\s*'([^']*)'\s*,\s*url:\s*'([^']*)'/.exec(txt); if (!m) return;
      const t2 = Date.parse(m[1]); if (m[2]) C.mint.url = m[2];
      if (t2 && t2 !== T) { C.mint.opensAt = m[1]; T = t2; if (left() > 0) { state = 'count'; KEEP.forEach((k) => { k.shown = null; }); } words(); }
      if (state === 'due' && SH.isOpen().mint) arrive(performance.now(), true);
    }).catch(() => {});
  }

  // ---- one frame
  function frame(now, dt) {
    if (state === 'count' && left() <= 0) arrive(now, true);
    { const pub = !!(SH.publicAt() && SH.now() >= SH.publicAt()); if (frame.pub !== undefined && pub !== frame.pub) words(); frame.pub = pub; }
    S.surge = partyT && now - partyT < 3400 ? Math.round(13 * Math.sin(Math.PI * (now - partyT) / 3400)) : 0;
    S.base(now); walk(now);
    const p = parts(), hot = state === 'count' && left() < 60000, flash = hot && left() < 10000 && (left() % 1000) > 880;
    KEEP.forEach((k, i) => {
      const text = state === 'open' ? 'MINT'[i] : state === 'due' ? '00' : pad(p[i]);
      if (k.shown !== null && k.shown !== text && !k.flip) {
        if (i === 3 && state === 'count') { if (!still) k.hop = now; }   // the seconds sign just changes: a flip every second would never sit still
        else if (!still) { k.flip = { t0: now, from: k.shown }; k.hop = now; k.waveT = now + 700; if (k.mood === 'sleeper') { k.awakeT = now + 3200; k.emote = { ch: '!', t0: now }; } }
        if (hot && !still) KEEP.forEach((o, j) => { if (j !== 3) o.hop = now + (j % 2) * 120; });
      }
      k.shown = text;
      if (partyT && now - partyT < 6500 && Math.floor((now - partyT) / 260) % 4 === i) k.hop = k.hop > now - 300 ? k.hop : now;
      keeper(k, i, now);
    });
    S.drawCoins(now, dt);   // in front of the crabs, behind the signs: the four letters are the whole point of the moment
    KEEP.forEach((k, i) => board(k, i, now, k.shown, flash ? '#ffffff' : state === 'open' ? GOLD : hot ? BUTTER : PAPER));
    if (p[3] !== frame.sec) { frame.sec = p[3]; spoken(p); }
    recheck(now);
  }

  // ---- poke a keeper
  function hit(ev) { const [lx, ly] = S.at(ev); if (ly < CRAB_Y || ly > FEET + 3) return -1; const i = Math.floor((lx - x0) / PITCH); return i >= 0 && i < 4 && lx - x0 - i * PITCH < UNIT ? i : -1; }
  cv.addEventListener('pointermove', (ev) => { cv.style.cursor = hit(ev) >= 0 ? 'pointer' : ''; });
  cv.addEventListener('click', (ev) => { const i = hit(ev); if (i < 0) return; const k = KEEP[i], now = performance.now(); k.hop = now; k.waveT = now + 600; k.emote = { ch: k.mood === 'sleeper' && now > k.awakeT ? '?' : k.poke === 'Z' ? '!' : k.poke, t0: now }; if (k.mood === 'sleeper') k.awakeT = now + 2600; if (still) S.redraw(now); });

  // ---- go
  if (left() <= 0) { state = SH.isOpen().mint ? 'open' : 'due'; }
  host.hidden = false; words();
  // someone who arrives in the first minutes of the mint still gets the moment, once
  let fresh = false; try { fresh = state === 'open' && -left() < 900000 && !sessionStorage.getItem('crabMinted'); if (fresh) sessionStorage.setItem('crabMinted', '1'); } catch (e) { /* private window */ }
  S.start();
  if (fresh && !still) { partyT = performance.now(); burst(partyT, 40); }
})();
