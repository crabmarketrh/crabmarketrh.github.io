// The beach kit: what every strip of beach on this site is made of. The mint clock, the list queue and the tide clock
// are all the same stage with different actors, so the stage lives here once.
// CRISP: a strip is a small canvas in whole logical pixels, scaled by a whole number (z). Never size one with a
// percentage, and never draw text into one with a web font: both put uneven strokes on the screen.
// Needs the art files (Painter, drawCrab, resolve, rnd, propImg, painterCanvas) and ui.js (SH.still).
window.Beach = (function () {
  const INK = '#12222f', PAPER = '#fffaf0', BUTTER = '#ffe58f', GOLD = '#ffc93c', SAND = '#f1dfae', SEA = ['#0c2d4a', '#124a70', '#1f7aa0', '#3fb5c4'];

  // ---- two tiny fonts, drawn as rectangles. 8x12 for signs, 3x5 for labels.
  const SEG = { 0: 'abcdef', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  const BAR = { a: [0, 0, 8, 2], g: [0, 5, 8, 2], d: [0, 10, 8, 2], f: [0, 0, 2, 7], b: [6, 0, 2, 7], e: [0, 5, 2, 7], c: [6, 5, 2, 7] };
  const BIG = {
    1: ['...##...', '..###...', '.####...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '.######.', '.######.'],
    M: ['##....##', '###..###', '########', '########', '##.##.##', '##.##.##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##'],
    I: ['.######.', '.######.', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '.######.', '.######.'],
    N: ['##....##', '###...##', '###...##', '####..##', '####..##', '##.##.##', '##.##.##', '##..####', '##..####', '##...###', '##...###', '##....##'],
    T: ['########', '########', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
    ':': ['........', '........', '........', '...##...', '...##...', '........', '........', '...##...', '...##...', '........', '........', '........'],
    '#': ['........', '..#..#..', '..#..#..', '########', '########', '..#..#..', '..#..#..', '########', '########', '..#..#..', '..#..#..', '........'],
  };
  const TINY = { A: '.#.#.#####.##.#', B: '##.#.###.#.###.', C: '.###..#..#...##', D: '##.#.##.##.###.', E: '####..##.#..###', F: '####..##.#..#..', G: '.###..#.##.#.##', H: '#.##.#####.##.#', I: '###.#..#..#.###', K: '#.##.###.#.##.#', L: '#..#..#..#..###', M: '#.########.##.#', N: '##.#.##.##.##.#', O: '####.##.##.####', P: '##.#.###.#..#..', R: '##.#.###.#.##.#', S: '.###...#...###.', T: '###.#..#..#..#.', U: '#.##.##.##.####', X: '#.##.#.#.#.##.#', Y: '#.##.#.#..#..#.', Z: '###..#.#.#..###', '!': '.#..#..#.....#.', '?': '##...#.#.....#.', '+': '....#.###.#....', '#': '#.#####.#####.#', '0': '####.##.##.####', '1': '.#.##..#..#.###', '2': '##...#.#.#..###', '3': '##...#.#...###.', '4': '#.##.####..#..#', '5': '####..##...###.', '6': '.###..####.####', '7': '###..#.#..#..#.', '8': '####.#####.####', '9': '####.####..###.' };
  TINY.W = '#.##.##.#####.#';

  function pen(x) {
    const P = {
      big(ch, ox, oy, col, paper) {
        x.fillStyle = col;
        if (BIG[ch]) { BIG[ch].forEach((row, r) => { for (let c = 0; c < 8; c++) if (row[c] === '#') x.fillRect(ox + c, oy + r, 1, 1); }); return; }
        const on = SEG[ch]; if (!on) return;
        for (const s of on) { const b = BAR[s]; x.fillRect(ox + b[0], oy + b[1], b[2], b[3]); }
        // soften the outer corners by one pixel wherever two strokes meet, the way the site's headline font does
        x.fillStyle = paper || PAPER; const has = (s) => on.includes(s);
        if (has('a') && has('f')) x.fillRect(ox, oy, 1, 1); if (has('a') && has('b')) x.fillRect(ox + 7, oy, 1, 1);
        if (has('d') && has('e')) x.fillRect(ox, oy + 11, 1, 1); if (has('d') && has('c')) x.fillRect(ox + 7, oy + 11, 1, 1);
      },
      tiny(text, ox, oy, col) { x.fillStyle = col; let cx = ox; for (const ch of String(text)) { const g = TINY[ch]; if (g) for (let i = 0; i < 15; i++) if (g[i] === '#') x.fillRect(cx + (i % 3), oy + Math.floor(i / 3), 1, 1); cx += 4; } },
      tinyW: (text) => String(text).length * 4 - 1,
      // a paper sign with the site's hard shadow, in miniature. s squashes it for a flip (1 = full height).
      sign(bx, by, w, h, fill, s) { const hh = Math.max(2, Math.round(h * (s == null ? 1 : s))), y = by + Math.round((h - hh) / 2); x.fillStyle = INK; x.fillRect(bx + 1, y + 1, w + 1, hh + 1); x.fillRect(bx, y, w, hh); x.fillStyle = fill; x.fillRect(bx + 1, y + 1, w - 2, hh - 2); return y; },
      post(px, y0, y1) { x.fillStyle = '#5a3a1a'; x.fillRect(px - 2, y0, 4, y1 - y0); x.fillStyle = '#9a6a3a'; x.fillRect(px - 1, y0, 2, y1 - y0); },
      shadow(kx, feet, up) { up = up || 0; x.fillStyle = 'rgba(40,25,10,.28)'; x.fillRect(kx + 5 + up, feet, 22 - up * 2, 2); x.fillRect(kx + 7 + up, feet + 2, 18 - up * 2, 1); },
      coin(cx, cy) { x.fillStyle = INK; x.fillRect(cx, cy - 1, 3, 5); x.fillRect(cx - 1, cy, 5, 3); x.fillStyle = GOLD; x.fillRect(cx, cy, 3, 3); x.fillStyle = '#fff3b0'; x.fillRect(cx, cy, 1, 1); },
    };
    return P;
  }

  // one crab from the collection as a 32x32 sprite, with no ground shadow (the strip draws its own, so a hop lifts the crab and not its shadow)
  const sprite = (t, eyes, wave) => { const Q = Painter(1); drawCrab(Q, { ...resolve(t), eyes: eyes || t.eyes, wave: !!wave }); return painterCanvas(Q); };
  // the hop every actor shares: up one, up two, down one. Returns how many pixels off the ground.
  const hopOf = (now, t0) => { const e = now - t0; return e < 0 || e > 300 ? 0 : e < 80 ? 1 : e < 220 ? 2 : 1; };

  // ---- a strip. o = { H, shore, edges:[3], z(cssW) -> 2|3|4, keepClear(S) -> [x0,x1] left empty of washed-up things, onLayout(S, cssW), frame(now, dt, S), tick }
  function strip(host, cv, o) {
    const x = cv.getContext('2d'), still = SH.still, S = { x, host, cv, W: 0, H: o.H, z: 3, still, surge: 0, pen: pen(x), coins: [] };
    let bg = null;
    S.layout = function () {
      const cssW = host.clientWidth; if (!cssW) return;
      S.z = o.z ? o.z(cssW) : cssW < 640 ? 2 : 3;
      S.W = Math.ceil(cssW / S.z); cv.width = S.W; cv.height = S.H; cv.style.width = S.W * S.z + 'px'; cv.style.height = S.H * S.z + 'px'; cv.style.marginLeft = Math.floor((cssW - S.W * S.z) / 2) + 'px';
      x.imageSmoothingEnabled = false; if (o.onLayout) o.onLayout(S, cssW);
      // the still part of the beach, painted once per size: sand, a little grain, and whatever washed up
      bg = document.createElement('canvas'); bg.width = S.W; bg.height = S.H; const g = bg.getContext('2d'), r = rnd(o.seed || 2222);
      g.fillStyle = SAND; g.fillRect(0, 0, S.W, S.H);
      for (let i = 0; i < S.W * 1.4; i++) { g.fillStyle = r() < .5 ? '#fbf0cc' : '#d9c48a'; g.fillRect(Math.floor(r() * S.W), o.shore + 6 + Math.floor(r() * (S.H - o.shore - 6)), r() < .3 ? 2 : 1, 1); }
      const keep = o.keepClear ? o.keepClear(S) : null, clear = (px, w) => !keep || px + w < keep[0] || px > keep[1];
      const washed = ['star', 'shellpile', 'rock', 'bottle', 'drift', 'star', 'bucket|#e2413b', 'shellpile', 'beachball'], feet = o.feet || S.H - 13;
      for (let i = 0, n = Math.floor(S.W / 46); i < n; i++) { const name = washed[Math.floor(r() * washed.length)], im = (() => { try { return propImg(name, 0); } catch (e) { return null; } })(), px = Math.floor(r() * (S.W - 16)), py = feet - 12 + Math.floor(r() * 14); if (im && clear(px, im.width)) g.drawImage(im, px, py - im.height + 8); }
      if (o.paintBg) o.paintBg(g, S);
    };
    // the sand, then the sea over it: four bands with a slow swell and a foam line that laps the sand. S.surge pushes the whole sea up the beach.
    S.base = function (now) {
      const t = still ? 0 : now, E = o.edges; x.drawImage(bg, 0, 0);
      for (let cx = 0; cx < S.W; cx += 2) {
        const lap = Math.round(1.6 * Math.sin(t / 1900) + 1.2 * Math.sin(cx * .07 + t / 1300)) + S.surge, shore = o.shore + lap; let top = 0;
        for (let k = 0; k < 4; k++) { const y1 = k < 3 ? E[k] + Math.round(1.3 * Math.sin(cx * (.05 + k * .02) + t / (1500 + k * 400) + k * 2)) + Math.round(S.surge * (k + 1) / 5) : shore; if (y1 > top) { x.fillStyle = SEA[k]; x.fillRect(cx, top, 2, y1 - top); top = y1; } }
        x.fillStyle = '#f4fbff'; x.fillRect(cx, shore, 2, 1); if ((cx / 2 + Math.floor(t / 700)) % 5 < 2) x.fillRect(cx, shore - 2, 2, 1);
        x.fillStyle = '#d9c08a'; x.fillRect(cx, shore + 1, 2, 2 + (lap < 0 ? 1 : 0));
      }
      const r = rnd(77); x.fillStyle = 'rgba(244,251,255,.7)';   // glints, drifting
      for (let i = 0; i < S.W / 24; i++) { const gx = Math.floor(r() * S.W), gy = 2 + Math.floor(r() * (E[2] - 4)), ph = (Math.floor(t / 500) + i) % 6; if (ph < 2) x.fillRect((gx + Math.floor(t / 900)) % S.W, gy, ph ? 3 : 2, 1); }
    };
    S.shoreAt = (cx, now) => o.shore + Math.round(1.6 * Math.sin((still ? 0 : now) / 1900) + 1.2 * Math.sin(cx * .07 + (still ? 0 : now) / 1300)) + S.surge;
    // coins, for the moments that earn them
    S.burst = function (now, n, xa, xb, y) { const r = rnd(now | 1); for (let i = 0; i < n; i++) S.coins.push({ x: xa + r() * (xb - xa), y, vx: (r() - .5) * 3.4, vy: -(3.2 + r() * 3.6), t0: now + r() * 700 }); };
    S.drawCoins = function (now, dt) { S.coins = S.coins.filter((c) => c.y < S.H + 6); for (const c of S.coins) { if (now < c.t0) continue; c.vy += .34 * dt; c.x += c.vx * dt; c.y += c.vy * dt; S.pen.coin(Math.round(c.x), Math.round(c.y)); } };
    // where on the logical canvas a pointer event landed
    S.at = (ev) => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / S.z, (ev.clientY - r.top) / S.z]; };

    let lastNow = 0;
    S.redraw = function (now) { now = now || performance.now(); const dt = Math.min(3, (now - (lastNow || now)) / 80) || 1; lastNow = now; if (bg) o.frame(now, dt, S); };
    S.start = function () {
      S.layout();
      if ('ResizeObserver' in window) { let lastW = host.clientWidth; new ResizeObserver(() => { if (host.clientWidth !== lastW) { lastW = host.clientWidth; S.layout(); if (still) S.redraw(); } }).observe(host); }
      let visible = true; if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(host);
      S.visible = () => visible;
      if (still) { S.redraw(); if (o.tick) setInterval(() => { if (!document.hidden) S.redraw(); }, o.tick); return S; }   // no motion asked for: what changes still changes, nothing else moves
      let artAt = 0; (function loop(now) { if (visible && !document.hidden && now - artAt > 78) { artAt = now; S.redraw(now); } requestAnimationFrame(loop); })(0);
      return S;
    };
    return S;
  }
  return { INK, PAPER, BUTTER, GOLD, SAND, pen, sprite, hopOf, strip };
})();
