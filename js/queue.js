// The line for the list: crabs from the collection queue at the market stall, the sign over it carries the real
// number of wallets on the list, and the ones who have signed wait on the beach for the mint.
// FACTS: the number is list/count.json, a static file on our own host (NEVER the list Worker: its daily budget is
// shared with applying). Nobody walks in unless that number really went up, or the visitor really got on the list.
// The crabs in the line are pictures, not the applicants: no wallet is ever drawn here except the visitor's own.
// Mounts on every [data-queue] section. With data-tags it also carries the two paper tags (the list page).
(function () {
  if (!window.SH || !window.Beach) return;
  const { C, still } = SH, { INK, PAPER, GOLD, BUTTER, sprite, hopOf } = Beach;
  const H = 64, SHORE = 22, FEET = 50, PITCH = 20, STALL_W = 32;

  // The band is never `hidden` while it waits: a hidden element has no box, so it would never be seen coming and never mount.
  // It holds its height in CSS instead, which also means nothing below it jumps when the scene arrives.
  document.querySelectorAll('[data-queue]').forEach((host) => { if (SH.stage() === 'token' || C.mint.closed) { host.hidden = true; return; } SH.lazy(host, () => mount(host)); });   // once the launch is over nobody is waiting for anything

  function mount(host) {
    if (typeof buildProps === 'function' && typeof PROP !== 'undefined' && !PROP.stall) { try { buildProps(); } catch (e) { /* the scene still works without props */ } }
    const cv = host.querySelector('canvas'), x = cv.getContext('2d'), say = host.querySelector('.vh'), tags = host.hasAttribute('data-tags');
    let count = 0, shown = null, flip = null, flashT = 0, stallX = 0, lineN = 0, lounge = [], actors = [], seed = 5, plate = null;
    const lineX = (i) => stallX - 8 - PITCH * (i + 1);   // place i in the line, 0 = at the stall

    const S = Beach.strip(host, cv, { H, shore: SHORE, edges: [8, 14, 19], feet: FEET, seed: 4711,
      z: (cssW) => (cssW < 640 ? 2 : 3),
      keepClear: (S) => [0, S.W],   // the whole strip is stage: washed-up things would sit under somebody's feet
      onLayout(S, cssW) {
        // wide: the stall sits right of centre with the line running left and the signed crabs to its right.
        // The two tags (when present) float over the ends, so the scene keeps to the middle.
        const room = tags ? Math.floor(cssW / 2 - 96 * S.z - 22 - Math.max(20, (cssW - 1160) / 2 + 20)) : 999;
        host.classList.toggle('stacked', tags && room < 190); host.style.setProperty('--mc-room', room + 'px');
        const mid = Math.round(S.W / 2), wide = S.W > 300;
        stallX = wide ? mid + 6 : mid - 4;
        const edge = tags && !host.classList.contains('stacked') ? Math.round(mid - 96) : 4;
        lineN = Math.max(2, Math.min(9, Math.floor((stallX - 8 - edge) / PITCH)));
        const right = tags && !host.classList.contains('stacked') ? mid + 96 : S.W - 4, n = Math.max(1, Math.min(7, Math.floor((right - stallX - STALL_W - 6) / 24)));
        lounge = []; for (let i = 0; i < n; i++) lounge.push({ x: stallX + STALL_W + 4 + i * 24 + (i % 2 ? 3 : 0), y: FEET + (i % 2 ? 3 : -4), taken: null });
        cast();
      },
      frame });
    const { big, tiny, tinyW } = S.pen;

    // ---- the cast. Built once per layout, a few sprites per idle slice so the page never stalls.
    // A sprite costs a few milliseconds to paint, and a cast is sixteen crabs with three poses each. So a crab is painted
    // when it is first drawn, a pose when it is first needed, and never more than two paintings in one frame.
    let budget = 0;
    function actor(traits, o) { return { t: traits, img: null, shut: null, wave: null, x: 0, y: FEET, tx: 0, hop: 0, waveT: 0, emote: null, ...o }; }
    function pose(a, which) { if (a[which]) return a[which]; if (budget <= 0) return a.img; budget--; a[which] = which === 'img' ? sprite(a.t) : which === 'shut' ? sprite(a.t, 'closed') : a.t.held === 'nothing' ? sprite(a.t, null, true) : a.img || sprite(a.t); return a[which]; }
    const someone = () => rollTraits(rnd(seed++ * 7919 + 13));
    function cast() {
      const keepMe = actors.filter((a) => a.me);
      actors = [];
      for (let i = 0; i < lineN; i++) actors.push(actor(someone(), { x: lineX(i), tx: lineX(i), place: i }));
      lounge.forEach((sp, i) => { const a = actor(someone(), { x: sp.x, tx: sp.x, y: sp.y, place: -1, spot: i, nap: i === lounge.length - 1 }); sp.taken = a; actors.push(a); });
      if (keepMe.length) { const me = keepMe[0]; me.place = lineN - 1; me.x = me.tx = lineX(lineN - 1); actors = actors.filter((a) => a.place !== lineN - 1 || a === me); actors.push(me); }
    }

    // ---- someone joins: the line shuffles up one, the crab at the stall has signed and goes to wait on the beach
    function join(traits, mine, position) {
      if (still) { if (mine) { const tail = actors.find((a) => a.place === lineN - 1); if (tail) { Object.assign(tail, actor(traits, { x: tail.x, tx: tail.tx, y: tail.y, place: tail.place, me: true })); plate = position ? '#' + position : null; } } S.redraw(); return; }
      const now = performance.now(), front = actors.find((a) => a.place === 0);
      if (front) { let sp = lounge.find((l) => !l.taken); if (!sp) { const old = lounge[0].taken; if (old) { old.tx = S.W + 40; old.leaving = true; old.spot = -1; } sp = lounge.shift(); lounge.push(sp); sp.taken = null; } sp.taken = front; front.place = -1; front.tx = sp.x; front.ty = sp.y; front.hop = now; front.waveT = now + 700; }
      actors.forEach((a) => { if (a.place > 0) { a.place--; a.tx = lineX(a.place); } });
      const a = actor(traits, { x: Math.max(-36, lineX(lineN - 1) - 78), tx: lineX(lineN - 1), place: lineN - 1, me: !!mine }); actors.push(a);
      if (mine) { actors.forEach((o) => { if (o !== a) o.me = false; }); plate = position ? '#' + position : null; cheerT = now + 2600; }
    }
    let cheerT = 0;

    // ---- the number
    function setCount(n, live) {
      if (!(n > 0) || n === count) return; const was = count; count = n;
      if (say) say.textContent = n.toLocaleString('en-US') + ' wallets are on the list.';
      if (live && was && n > was && !still) { for (let k = 0; k < Math.min(3, n - was); k++) setTimeout(() => join(someone(), false), k * 2600); }
    }
    const readCount = (live) => { if (!C.list.countFile) return; fetch(C.list.countFile, { cache: 'no-store' }).then((r) => r.json()).then((d) => { if (d && d.count > count) setCount(d.count, live); }).catch(() => {}); };

    // ---- words (the list page only). One sentence per stage, read from the stage.
    function words() {
      if (!tags) return; const st = SH.stage(), o = SH.isOpen(), $ = (s) => host.querySelector(s);
      const L = { pre: ['The list is not open yet', 'It opens on our X account first.'], list: ['The line', 'Your crab walks in when your post checks out.'], listShut: ['The list has closed', 'Everyone here mints before the public.'], mint: ['The list has minted first', 'The mint is open now.'], token: ['The list minted first', 'The mint has run.'] }[st];
      $('.q-label').textContent = o.list && st !== 'list' ? 'The line' : L[0]; $('.q-sub').textContent = o.list && st !== 'list' ? 'Your crab walks in when your post checks out.' : L[1];
      mintWords();
    }
    function mintWords() {
      if (!tags) return; const box = host.querySelector('.q-right'), b = host.querySelector('.q-mint'), sub = host.querySelector('.q-when'), t = SH.mintAt();
      if (!t || SH.stage() === 'token') { box.hidden = true; return; } box.hidden = false;
      if (SH.isOpen().mint) { b.textContent = 'The mint is open'; sub.textContent = SH.roundLine(); return; }
      if (SH.mintDue()) { b.textContent = 'Mint: any minute now'; sub.textContent = 'The link shows up on this site first.'; return; }
      const s = Math.max(0, Math.ceil((t - SH.now()) / 1000)), p2 = (n) => String(n).padStart(2, '0');
      const time = Math.floor(s / 86400) + 'd ' + p2(Math.floor(s % 86400 / 3600)) + 'h ' + p2(Math.floor(s % 3600 / 60)) + 'm ' + p2(s % 60) + 's';
      if (!b.firstElementChild) { b.textContent = 'Mint in '; b.append(SH.el('span', { class: 'q-time' })); } b.firstElementChild.textContent = time; sub.textContent = SH.mintWhen();
    }

    // ---- one frame
    function drawActor(a, now, i) {
      const moving = Math.abs(a.tx - a.x) > .6 || (a.ty != null && Math.abs(a.ty - a.y) > .6);
      const up = moving ? Math.floor(now / 190 + i) % 2 : hopOf(now, a.hop), ax = Math.round(a.x), ay = Math.round(a.y);
      const blink = !moving && (a.nap || (Math.floor(now / 160) + i * 11) % 29 === 0);
      const im = pose(a, 'img') && pose(a, blink ? 'shut' : now < a.waveT ? 'wave' : 'img'); if (!im) return;
      S.pen.shadow(ax, ay, moving ? 0 : up); x.drawImage(im, ax, ay - 30 - up);
      if (a.nap && !moving && !still) { const ph = (now / 800) % 3; x.globalAlpha = ph > 2.2 ? .4 : 1; tiny('Z', ax + 25 + Math.round(ph), ay - 22 - Math.round(ph * 3), PAPER); x.globalAlpha = 1; }
      if (a.emote) { const u = (now - a.emote.t0) / 900; if (u > 1) a.emote = null; else { x.fillStyle = INK; x.fillRect(ax + 27, ay - 29 - Math.round(u * 5), 5, 7); tiny(a.emote.ch, ax + 28, ay - 28 - Math.round(u * 5), GOLD); } }
      if (a.me && plate) { const w = tinyW(plate) + 6, px = ax + 16 - Math.round(w / 2), py = ay - 41 - up; S.pen.sign(px, py, w, 9, GOLD); tiny(plate, px + 3, py + 2, INK); }
    }
    function frame(now, dt) {
      budget = still ? 99 : 2; S.base(now);
      // the stall, and the sign over it
      const stall = (() => { try { return propImg('stall', now); } catch (e) { return null; } })(), text = count ? String(count) : '';
      if (text && shown !== null && shown !== text && !flip && !still) { flip = { t0: now, from: shown }; flashT = now + 900; actors.forEach((a, i) => { if (a.place >= 0) a.hop = now + i * 70; }); }
      if (text) shown = text;
      let s = 1, show = text; if (flip) { const u = (now - flip.t0) / 300; if (u >= 1) flip = null; else { s = Math.abs(1 - 2 * u); show = u < .5 ? flip.from : text; } }
      for (const a of actors) { const step = 2.2 * dt; if (Math.abs(a.tx - a.x) > .6) a.x += Math.sign(a.tx - a.x) * Math.min(step, Math.abs(a.tx - a.x)); if (a.ty != null && Math.abs(a.ty - a.y) > .6 && Math.abs(a.tx - a.x) < 30) a.y += Math.sign(a.ty - a.y) * Math.min(step * .4, Math.abs(a.ty - a.y)); }
      actors = actors.filter((a) => !(a.leaving && a.x > S.W + 36));
      if (cheerT && now < cheerT) actors.forEach((a, i) => { if (!a.me && Math.floor((cheerT - now) / 240) % actors.length === i && now - a.hop > 320) a.hop = now; });
      // depth order: further up the beach first, and the stall in between at its own depth
      const order = actors.slice().sort((p, q) => (p.y + (p.me ? .5 : 0)) - (q.y + (q.me ? .5 : 0)) || p.x - q.x); let stallDrawn = false;   // the visitor's own crab stands in front of its neighbours
      const drawStall = () => { stallDrawn = true; if (stall) { x.fillStyle = 'rgba(40,25,10,.25)'; x.fillRect(stallX + 3, FEET - 1, 27, 2); x.drawImage(stall, stallX, FEET - 27); }
        if (show) { const w = show.length * 10 + 6, bx = stallX + 16 - Math.round(w / 2); S.pen.post(stallX + 16, 18, FEET - 25); const by = S.pen.sign(bx, 2, w, 18, now < flashT ? BUTTER : PAPER, s); if (s >= .8) for (let k = 0; k < show.length; k++) big(show[k], bx + 4 + k * 10, by + 3, INK, now < flashT ? BUTTER : PAPER); } };
      order.forEach((a, i) => { if (!stallDrawn && a.y > FEET - 2) drawStall(); drawActor(a, now, i); }); if (!stallDrawn) drawStall();
      const lab = 'ON THE LIST'; tiny(lab, stallX + 16 - Math.round(tinyW(lab) / 2), FEET + 6, INK);
      if (tags && Math.floor(now / 1000) !== frame.sec) { frame.sec = Math.floor(now / 1000); mintWords(); }
    }

    // ---- poke anyone
    const hit = (ev) => { const [lx, ly] = S.at(ev); return actors.slice().reverse().find((a) => lx > a.x + 4 && lx < a.x + 28 && ly > a.y - 30 && ly < a.y + 3); };
    cv.addEventListener('pointermove', (ev) => { cv.style.cursor = hit(ev) ? 'pointer' : ''; });
    cv.addEventListener('click', (ev) => { const a = hit(ev); if (!a) return; const now = performance.now(); a.hop = now; a.waveT = now + 600; a.emote = { ch: a.nap ? '?' : '!', t0: now }; if (still) S.redraw(now); });

    // ---- the visitor's own crab, the moment the Worker says yes. list.js announces it; nothing else can.
    document.addEventListener('crabjoined', (ev) => {
      if (!tags) return; const d = ev.detail || {}; if (!d.wallet) return;
      const go = () => { if (d.position) setCount(Math.max(count, Number(d.position)), false); join(SH.traitsOf(SH.seedOf(d.wallet)), true, d.position); };
      const r = host.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight) { host.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' }); setTimeout(go, still ? 0 : 650); } else go();
    });
    document.addEventListener('crabstage', words);

    words(); S.start(); readCount(false);
    if (!still) setInterval(() => { if (!document.hidden && S.visible()) readCount(true); }, 90000);
    if (still && tags) setInterval(mintWords, 1000);
  }
})();
