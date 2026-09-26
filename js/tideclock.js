// The tide clock's picture: the hour as a tide. The water climbs the beach as the hour runs out, and at :00 a wave
// washes over the tide pool. What it leaves behind is the whole lesson of the project in one picture: the awake crab
// gets paid, the sleeping crab next to it gets nothing.
// FACTS: before the token is live every crab is asleep, so the wave leaves nothing and the picture says so. Coins only
// ever appear for a real tide (token and engine both set) or in a demo the visitor starts, which is labelled as one.
// Mounts inside every [data-tideclock] box, in place of the plain progress bar. The digits stay real text.
(function () {
  if (!window.SH || !window.Beach) return;
  const { C, still, el } = SH, { INK, PAPER, GOLD, sprite, hopOf } = Beach;
  const H = 52, SHORE = 9, FEET = 41, RISE = 13;   // two clear rows under the labels, so they never sit on the border
  const SYM = (C.payouts && C.payouts.symbol) || 'USDG', pays = () => !!(SH.isOpen().token && C.contracts.engine);

  document.querySelectorAll('[data-tideclock]').forEach((box) => SH.lazy(box, () => mount(box)));

  function mount(box) {
    if (typeof buildProps === 'function' && typeof PROP !== 'undefined' && !PROP.pool) { try { buildProps(); } catch (e) { /* the pool is drawn plainly without it */ } }
    const bar = box.querySelector('.bar'), host = el('div', { class: 'tidescene' }), cv = el('canvas', { class: 'px', 'aria-hidden': 'true' }); host.append(cv);
    if (bar) { bar.before(host); bar.hidden = true; } else box.append(host); box.classList.add('has-scene');   // the bar stays in the page, hidden: the pages' own clocks still write its width
    const play = el('button', { class: 'btn sm tideplay', type: 'button', text: 'Play a tide' }), demoNote = el('span', { class: 'lab tidedemo', hidden: true, text: 'A demo. After launch this happens for real, on the hour.' });
    host.after(play, demoNote);
    const x = cv.getContext('2d'); let cx = 0, waveT = 0, demo = false, fullUntil = 0, floats = [];
    const hero = SH.hero(), other = rollTraits(rnd(2248 * 7));
    const A = { img: sprite(hero), shut: sprite(hero, 'closed'), wave: sprite(hero, null, true), money: sprite(hero, 'money'), hop: 0 }, B = { shut: sprite(other, 'closed') };

    const S = Beach.strip(host, cv, { H, shore: SHORE, edges: [3, 5, 7], feet: FEET, seed: 99, tick: 1000,
      z: (cssW) => (cssW < 280 ? 2 : 3), keepClear: (S) => [0, S.W], onLayout(S) { cx = Math.round(S.W / 2); }, frame });
    const { tiny, tinyW } = S.pen;

    function tide(now, asDemo) { if (waveT) return; waveT = now; demo = !!asDemo; demoNote.hidden = !demo; play.disabled = true; }
    play.addEventListener('click', () => { tide(performance.now(), true); if (still) { fullUntil = performance.now() + 4000; A.hop = 0; S.redraw(); setTimeout(() => { waveT = 0; demoNote.hidden = true; play.disabled = false; S.redraw(); }, 4000); } });

    function frame(now) {
      const ms = SH.now() % 3600000, p = ms / 3600000;
      if (!waveT && ms < 1500 && !still) tide(now, false);
      // the wave: up over the pool in a second, back down in four
      let wave = 0; const paying = waveT && (demo || pays());
      if (waveT && !still) { const u = (now - waveT) / 5200; if (u >= 1) { waveT = 0; demoNote.hidden = true; play.disabled = false; } else { wave = u < .2 ? u / .2 : 1 - (u - .2) / .8; if (u > .2 && !frame.paid) { frame.paid = true; if (paying) { S.burst(now, 9, cx - 8, cx + 8, FEET - 12); A.hop = now; fullUntil = now + 9000; floats.push({ t0: now + 500, text: '+' + SYM }); } } } } else frame.paid = false;
      const rise = Math.round(p * RISE); S.surge = Math.round(rise + wave * (FEET - SHORE - rise - 3));
      S.base(now);
      // the pool, in the sand between them. After a paying tide it glints for a while: that is pay, waiting.
      const pool = (() => { try { return propImg('pool', now); } catch (e) { return null; } })();
      if (pool) x.drawImage(pool, cx - 10, FEET - 13); else { x.fillStyle = '#3fb5c4'; x.fillRect(cx - 7, FEET - 4, 14, 5); }
      if (now < fullUntil || (still && fullUntil)) { S.pen.coin(cx - 4, FEET - 5); S.pen.coin(cx + 2, FEET - 3); }
      // left: the crab that was woken. Right: the one that was not.
      const awake = pays() || (waveT && demo) || (still && fullUntil > now), up = hopOf(now, A.hop), glad = now < fullUntil && now - A.hop < 2600;
      S.pen.shadow(cx - 44, FEET, up); x.drawImage(awake ? (glad ? A.money : (Math.floor(now / 160) % 27 === 0 ? A.shut : A.img)) : A.shut, cx - 44, FEET - 30 - up);
      S.pen.shadow(cx + 12, FEET, 0); x.drawImage(B.shut, cx + 12, FEET - 30);
      const zed = (kx) => { if (still) { tiny('Z', kx + 25, FEET - 24, PAPER); return; } const ph = (now / 800) % 3; x.globalAlpha = ph > 2.2 ? .4 : 1; tiny('Z', kx + 25 + Math.round(ph), FEET - 22 - Math.round(ph * 3), PAPER); x.globalAlpha = 1; };
      if (!awake) zed(cx - 44); zed(cx + 12);
      const la = awake ? 'AWAKE' : 'ASLEEP'; tiny(la, cx - 28 - Math.round(tinyW(la) / 2), FEET + 4, INK); tiny('ASLEEP', cx + 28 - Math.round(tinyW('ASLEEP') / 2), FEET + 4, INK);
      S.drawCoins(now, 1);
      floats = floats.filter((f) => now < f.t0 + 1600); for (const f of floats) { if (now < f.t0) continue; const u = (now - f.t0) / 1600, w = tinyW(f.text) + 4, fx = cx - 28 - Math.round(w / 2), fy = FEET - 36 - Math.round(u * 5); x.globalAlpha = u > .75 ? .5 : 1; x.fillStyle = INK; x.fillRect(fx, fy, w, 9); tiny(f.text, fx + 2, fy + 2, '#9af0c0'); x.globalAlpha = 1; }
    }
    S.start();
  }
})();
