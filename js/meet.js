// Meet a crab: words in, one repeatable crab and island out.
(function () {
  const { C, el, still, seedOf, traitsOf, paintPiece } = SH;
  SH.mount(); buildProps();
  const $ = (id) => document.getElementById(id), input = $('seed'), msg = $('msg');
  const NAMES = ['Asleep: not woken yet', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5: top shell'];
  const WORDS = ['sandy', 'pinchy', 'captain', 'moon', 'pearl', 'bubbles', 'tide', 'nacho', 'pickle', 'biscuit', 'comet', 'mango'];
  const start = new URLSearchParams(location.search).get('s') || 'sandy 22'; // fixed first crab, so a shared screenshot matches what a visitor sees
  const me = { gx: GC, gy: GC, tier: 3, traits: traitsOf(1), seed: 1 };
  const sea = makeSea($('sea'), [me], { follow: true, night: () => true });
  let words = '', fg = null, fgKey = '';
  const buttons = NAMES.map((_, i) => { const b = el('button', { type: 'button', text: String(i), 'aria-label': NAMES[i], onclick: () => setTier(i) }); $('lv').append(b); return b; });
  function setTier(i) { me.tier = i; $('tag').textContent = NAMES[i]; buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); $('lvsay').textContent = i === 0 ? 'Asleep. It earns nothing until you wake it by burning ' + C.token.symbol + '.' : 'Level ' + i + ': bought by burning ' + C.token.symbol + '. ' + (i === 5 ? 'The biggest' : 'A bigger') + ' share of each hourly pot.'; if (still) sea.draw(3000, true); }
  function show(text) {
    words = String(text).trim().slice(0, 64) || 'crab'; input.value = words; const seed = seedOf(words); me.traits = traitsOf(seed); me.seed = seed % 100000; fgKey = '';
    const t = me.traits, M = SHELL_META[t.shell] || {}, rows = [['Shell', SHELL_NAMES[t.shell]], M.pats ? ['Variant', M.pats[t.pat]] : null, t.shellColor ? ['Shell colour', t.shellColor[0]] : null, ['Body', t.body[0]], ['Eyes', t.eyes], ['Mouth', t.extra === 'scarf' ? 'hidden' : t.mouth], ['Claws', t.claws], t.held !== 'nothing' ? ['Holding', t.held] : null, t.mark !== 'none' ? ['Marking', t.mark] : null, t.extra !== 'none' ? ['Accessory', t.extra] : null, ['Backdrop', t.scene]].filter(Boolean);
    const dl = $('traits'); dl.textContent = ''; rows.forEach(([k, v]) => dl.append(el('dt', { text: k }), el('dd', { text: v })));
    history.replaceState(null, '', '?s=' + encodeURIComponent(words)); msg.textContent = ''; if (still) { sea.draw(3000, true); nft(4); }
  }
  function nft(frame) { const t = me.tier === 0 ? { ...me.traits, eyes: 'closed' } : me.traits, key = words + t.eyes; if (key !== fgKey) { fg = Painter(1); drawCrab(fg, { ...resolve(t), shadow: 'rgba(40,25,10,.35)' }); fgKey = key; } const x = $('nft').getContext('2d'); drawScene(x, t.scene, 7, frame); fg.blit(x); drawLevel(x, me.tier, frame); }
  $('form').addEventListener('submit', (e) => { e.preventDefault(); show(input.value); });
  $('dice').addEventListener('click', () => show(WORDS[Math.floor(Math.random() * WORDS.length)] + ' ' + Math.floor(Math.random() * 9999)));
  $('copy').addEventListener('click', async () => { const url = location.origin + location.pathname + '?s=' + encodeURIComponent(words); try { await navigator.clipboard.writeText(url); msg.textContent = 'Link copied. Anyone who opens it meets the same crab.'; } catch (e) { msg.textContent = url; } });
  // a 1200x675 card: the crab big on its own colour, the island beside it
  $('save').addEventListener('click', () => {
    const c = el('canvas', { width: 1200, height: 675 }), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#fffaf0'; x.fillRect(0, 0, 1200, 675); x.fillStyle = '#12222f'; x.fillRect(44, 44, 1124, 599); x.fillStyle = '#fffaf0'; x.fillRect(36, 36, 1124, 599);
    x.fillStyle = '#12222f'; x.fillRect(70, 70, 420, 420); x.drawImage($('nft'), 76, 76, 408, 408);
    const s = $('sea'); const w = 600, h = Math.round(w * s.height / s.width); x.fillStyle = '#12222f'; x.fillRect(524, 70, w + 12, h + 12); x.drawImage(s, 530, 76, w, h);
    x.fillStyle = '#12222f'; x.font = '40px Silkscreen, monospace'; x.fillText(words.slice(0, 26), 70, 560); x.font = '22px Silkscreen, monospace'; x.fillStyle = '#41586a'; x.fillText(SHELL_NAMES[me.traits.shell] + ' · ' + NAMES[me.tier].split(':')[0], 70, 600);
    x.font = '700 24px Nunito, sans-serif'; x.fillStyle = '#41586a'; const line = C.collection.supply.toLocaleString('en-US') + ' crabs + the ' + C.token.symbol + ' token.'; x.fillText(line, 1130 - x.measureText(line).width, 562);
    x.fillStyle = '#12222f'; x.font = '26px Silkscreen, monospace'; const label = C.name + (C.url ? ' · ' + C.url.replace(/^https?:\/\//, '') : ''); x.fillText(label, 1130 - x.measureText(label).width, 600);
    c.toBlob((b) => { const a = el('a', { href: URL.createObjectURL(b), download: 'crab-' + words.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png' }); document.body.append(a); a.click(); a.remove(); msg.textContent = 'Card saved as a picture.'; });
  });
  // one picture of the whole life: asleep, then every level, all framed the same so the island visibly grows
  $('evo').addEventListener('click', () => {
    const c = el('canvas', { width: 1200, height: 675 }), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#12222f'; x.fillRect(0, 0, 1200, 675); x.fillStyle = '#fffaf0'; x.fillRect(10, 10, 1180, 655);
    const tmp = el('canvas', { width: 32, height: 32 }); paintPiece(tmp.getContext('2d'), me.traits, { level: 5, seed: 7, frame: 6 }); x.fillStyle = '#12222f'; x.fillRect(36, 30, 84, 84); x.drawImage(tmp, 40, 34, 76, 76);
    x.fillStyle = '#12222f'; x.font = '34px Silkscreen, monospace'; x.fillText(words.slice(0, 24).toUpperCase(), 140, 70); x.font = '700 22px Nunito, sans-serif'; x.fillStyle = '#41586a'; x.fillText('From asleep to the top shell. Every level is bought by burning ' + C.token.symbol + '.', 140, 104);
    const PW = 368, PH = 240, LAB = ['ASLEEP', 'LEVEL 1', 'LEVEL 2', 'LEVEL 3', 'LEVEL 4', 'LEVEL 5'];
    for (let k = 0; k < 6; k++) { const s = el('canvas'); makeSea(s, [{ gx: GC, gy: GC, tier: k, traits: me.traits, seed: me.seed }], { follow: true, viewTier: 5, night: () => true }).draw(3000, true); const px = 36 + (k % 3) * (PW + 12), py = 132 + Math.floor(k / 3) * (PH + 12); x.fillStyle = '#12222f'; x.fillRect(px - 4, py - 4, PW + 8, PH + 8); x.drawImage(s, px, py, PW, PH); x.fillStyle = '#fffaf0'; x.fillRect(px + 8, py + 8, k ? 96 : 84, 26); x.fillStyle = '#12222f'; x.font = '16px Silkscreen, monospace'; x.fillText(LAB[k], px + 14, py + 27); }
    x.fillStyle = '#12222f'; x.font = '22px Silkscreen, monospace'; const label = C.name.toUpperCase() + (C.url ? ' · ' + C.url.replace(/^https?:\/\//, '') : ''); x.fillText(label, 36, 655 - 8); const line = C.collection.supply.toLocaleString('en-US') + ' crabs + the ' + C.token.symbol + ' token'; x.font = '700 20px Nunito, sans-serif'; x.fillStyle = '#41586a'; x.fillText(line, 1164 - x.measureText(line).width, 655 - 8);
    c.toBlob((b) => { const a = el('a', { href: URL.createObjectURL(b), download: 'crab-life-' + words.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png' }); document.body.append(a); a.click(); a.remove(); msg.textContent = 'Saved: its whole life in one picture.'; });
  });
  setTier(3); show(start);
  let artAt = 0; if (!still) (function loop(now) { if (!document.hidden && now - artAt > 90) { artAt = now; sea.draw(now, false); nft(Math.floor(now / 90)); } requestAnimationFrame(loop); })(0);  // the art steps every 90ms; drawing between steps repainted identical frames
})();
