// The island shop: try items on a live island and watch the crab's share, the burn and the slots add up. A toy first, a price list second.
// Reads SHELL_CONFIG.items = { capPct, slots: 'level', list: [{ id, name, bonus: '0.05x', price: '4,000', limit: 0 | 222, left: null | n, blurb }] } and nothing else.
// Art: window.itemSprite(id) gives a small canvas; island objects passed to makeSea take items: [ids]. Both are optional here: without them the page still works.
// Rules shown (owner's decisions): the whole price is burned, slots = shell level, one of each per crab, total item bonus capped at capPct% of the level weight.
(function () {
  const { C, el, still } = SH; SH.mount(); buildProps();
  const $ = (id) => document.getElementById(id), T = C.token, sym = T.symbol, LV = T.levels || 5, IT = C.items || {}, LIST = Array.isArray(IT.list) ? IT.list.filter((i) => i && i.id) : [];
  // Never write a sentence about what is live. Ask SH.stage() and pick one, so this cannot go stale the day
  // the mint opens the way it did the day the list did.
  const LIVE_LINE = { pre: 'Items are not on sale yet, so try them on for free.', list: 'Items are not on sale yet, so try them on for free.', mint: 'Items go on sale when ' + T.symbol + ' does. Try them on for free until then.', token: 'Try any item on a level 5 island before you burn anything for it.' };
  { const n = $('shLive'); if (n) n.textContent = LIVE_LINE[SH.stage()] || LIVE_LINE.pre; }
  const num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return isFinite(n) && n >= 0 ? n : 0; };
  const x = (v) => +v.toFixed(2) + 'x', full = (n) => Math.round(n).toLocaleString('en-US'), capPct = num(IT.capPct) || 100;
  const weightOf = (L) => num((T.levelWeights || [])[L - 1]) || 0;
  if (!LIST.length) { $('shEmpty').hidden = false; $('shShop').hidden = true; return; }

  // ---- state, shareable as ?lv=5&i=disco,hottub
  const Q = new URLSearchParams(location.search); let level = Math.max(1, Math.min(LV, Math.round(num(Q.get('lv'))) || 3));
  let worn = [...new Set((Q.get('i') || '').split(',').filter((id) => LIST.some((i) => i.id === id)))];
  const me = () => ({ gx: GC, gy: GC, tier: level, traits: SH.hero(), seed: 88, items: worn.slice() });

  // ---- the island. It is rebuilt whenever the level or the items change, so it never depends on how the engine caches an island.
  let sea = null; const canvas = $('shSea');
  function rebuild() { sea = makeSea(canvas, [me()], { follow: true }); if (still) sea.draw(3000, true); }
  if (!still) { let seen = true; if ('IntersectionObserver' in window) new IntersectionObserver((es) => { seen = es[0].isIntersecting; }).observe(canvas); let artAt = 0; (function loop(now) { if (seen && !document.hidden && sea && now - artAt > 110) { artAt = now; sea.draw(now, false); } requestAnimationFrame(loop); })(0); }

  // ---- cards
  // sprites: each one is scaled by the largest whole number that fits the picture box, and redrawn over time (some items move)
  const BOX = 112, live = [];
  const raw = (id, now) => { try { return typeof itemSprite === 'function' ? itemSprite(id, now) : null; } catch (e) { return null; } };
  const sprite = (id) => { let src = raw(id, 0); if (!src) { src = el('canvas', { width: 16, height: 16 }); const g = src.getContext('2d'); g.fillStyle = '#ffe58f'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#12222f'; g.fillRect(7, 3, 2, 7); g.fillRect(7, 12, 2, 2); }
    const c = el('canvas', { class: 'px', width: src.width, height: src.height, 'aria-hidden': 'true' }), k = Math.max(1, Math.floor(BOX / Math.max(src.width, src.height))); c.style.width = src.width * k + 'px'; c.style.height = src.height * k + 'px'; c.getContext('2d').drawImage(src, 0, 0); live.push({ id, c }); return c; };
  const edition = (i) => (!num(i.limit) ? 'Open edition' : i.left != null && i.left !== '' ? full(num(i.left)) + ' left of ' + full(num(i.limit)) : full(num(i.limit)) + ' ever made');
  const cards = LIST.map((i) => {
    const btn = el('button', { class: 'btn sm', type: 'button', onclick: () => toggle(i.id) }), why = el('span', { class: 'sh-why' });
    // the immunity item is the only one of its kind, so it gets the whole row rather than a lonely last cell
    const card = el('article', { class: 'card sh-card' + (num(i.limit) ? ' sh-ltd' : '') + (i.immune ? ' sh-fort' : '') }, [el('div', { class: 'sh-pic' }, [sprite(i.id)]), num(i.limit) ? el('span', { class: 'sh-ed', text: 'Limited' }) : null, el('h3', { text: i.name || i.id }), i.blurb ? el('p', { text: i.blurb }) : null,
      el('dl', { class: 'sh-facts' }, [el('dt', { text: 'Share' }), el('dd', { text: '+' + x(num(i.bonus)) }), el('dt', { text: 'Burn' }), el('dd', { text: i.price ? i.price + ' ' + sym : 'set before launch' }), el('dt', { text: 'Edition' }), el('dd', { text: edition(i) })]), btn, why]);
    $('shCards').append(card); return { i, card, btn, why };
  });

  const item = (id) => LIST.find((i) => i.id === id), bonusOf = (ids) => ids.reduce((a, id) => a + num(item(id).bonus), 0), capOf = (L) => weightOf(L) * capPct / 100, soldOut = (i) => i.left != null && i.left !== '' && num(i.left) === 0;
  const fits = (id) => !weightOf(level) || bonusOf(worn) + num(item(id).bonus) <= capOf(level) + 1e-9;
  // dropping a level closes slots and lowers the cap: the newest items come off until the island is legal again (on the real contract levels never go down)
  const trim = () => { worn = worn.slice(0, level); while (worn.length && weightOf(level) && bonusOf(worn) > capOf(level) + 1e-9) worn.pop(); };
  function toggle(id) { const k = worn.indexOf(id); if (k >= 0) worn.splice(k, 1); else if (worn.length < level && !soldOut(item(id)) && fits(id)) worn.push(id); render(true); }
  const lvBtns = []; for (let L = 1; L <= LV; L++) { const b = el('button', { type: 'button', text: String(L), 'aria-label': 'Level ' + L + ': ' + L + (L === 1 ? ' item slot' : ' item slots'), onclick: () => { level = L; trim(); render(true); } }); $('shLv').append(b); lvBtns.push(b); }
  $('shClear').addEventListener('click', () => { worn = []; render(true); });
  $('shCopy').addEventListener('click', async () => { const url = location.origin + location.pathname + '?lv=' + level + (worn.length ? '&i=' + worn.join(',') : ''); try { await navigator.clipboard.writeText(url); $('shMsg').textContent = 'Link copied. It opens the shop with this island.'; } catch (e) { $('shMsg').textContent = url; } });

  function render(changed) {
    const base = weightOf(level), cap = capOf(level), bonus = bonusOf(worn), burned = worn.reduce((a, id) => a + num(item(id).price), 0), atCap = cap > 0 && bonus >= cap - 1e-9;
    $('shTag').textContent = 'Level ' + level + (worn.length ? ', ' + worn.length + (worn.length === 1 ? ' item' : ' items') : '');
    $('shShare').textContent = base ? x(base + bonus) : 'set before launch';
    const small = innerWidth <= 620;
    $('shMath').textContent = small && base && worn.length ? x(base) + ' level + ' + x(bonus) + ' items' + (atCap ? ' (at the cap)' : '') : !base ? 'The level weights are not set yet.' : !worn.length ? 'Level ' + level + ' weight only. No items yet.' : x(base) + ' for level ' + level + ' + ' + x(bonus) + ' from items' + (atCap ? '. That is the most a level ' + level + ' crab can carry.' : '. Room left under the cap: ' + x(cap - bonus) + '.');
    $('shBurn').textContent = full(burned) + ' ' + sym; $('shCap').style.width = (cap ? Math.min(100, bonus / cap * 100) : 0) + '%'; $('shCap').classList.toggle('full', atCap);
    const slots = $('shSlots'); slots.textContent = ''; for (let s = 0; s < LV; s++) slots.append(el('i', { class: s < worn.length ? 'on' : s < level ? 'free' : 'shut', title: s < level ? '' : 'Opens at level ' + (s + 1) }));
    slots.setAttribute('aria-label', worn.length + ' of ' + level + ' slots used');
    lvBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === level - 1)));
    cards.forEach(({ i, card, btn, why }) => { const on = worn.includes(i.id), sold = soldOut(i), fullUp = !on && worn.length >= level, over = !on && !fullUp && !fits(i.id); card.classList.toggle('on', on); btn.textContent = on ? 'Take it off' : 'Try it on'; btn.disabled = !on && (fullUp || sold || over); btn.setAttribute('aria-pressed', String(on)); why.textContent = on ? 'On the island' : sold ? 'All gone.' : over ? 'Over the limit for level ' + level + '.' + (level < LV ? ' Level up first.' : '') : fullUp ? (level < LV ? 'No free slot. Level ' + (level + 1) + ' opens one more.' : 'All ' + LV + ' slots are full.') : ''; });
    if (changed) { $('shMsg').textContent = ''; history.replaceState(null, '', '?lv=' + level + (worn.length ? '&i=' + worn.join(',') : '')); }
    rebuild();
  }
  trim(); render(false);
  if (!still && typeof itemSprite === 'function') { let seenCards = true, last = 0; if ('IntersectionObserver' in window) new IntersectionObserver((es) => { seenCards = es[0].isIntersecting; }).observe($('shCards'));
    (function tick(now) { if (seenCards && !document.hidden && now - last > 140) { last = now; live.forEach(({ id, c }) => { const src = raw(id, now); if (src) { const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0); } }); } requestAnimationFrame(tick); })(0); }
})();
