// The tides page: the public record of every hourly tide. Before launch it is an honest empty state.
// Config keys it reads (all optional, empty = not live):
//   contracts.engine        address of the contract that runs the tide
//   tides.feed              URL of a JSON file the keeper writes after every tide (newest or oldest first, either works):
//                           [{ "t": 1790000000, "potUsd": 41.67, "crabs": 870, "tx": "0x…" }]
//                           t = unix seconds of the tide. potUsd = the USDG the pot bought and handed out, counted as dollars. potUsd 0 = an empty hour (still listed).
//   links.explorerTx        prefix for a transaction link, the tx hash is added to the end
//   links.explorerAddress   prefix for an address link
(function () {
  const { C, el } = SH; SH.mount();
  const $ = (id) => document.getElementById(id), live = !!(C.contracts && C.contracts.engine), feed = C.tides && C.tides.feed, L = C.links || {}, PAGE = 48, SYM = (C.payouts && C.payouts.symbol) || 'USDG';
  const SYM_TOKEN = (C.token && C.token.symbol) || '$CRAB';
  const usd = (v) => (v <= 0 ? '$0.00' : v < 0.01 ? 'under $0.01' : '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const p2 = (n) => String(n).padStart(2, '0'), when = (t) => { const d = new Date(t * 1000); return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate()) + ' ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()); };

  // ---- the clock: time to the next full hour. It is a real clock, but before launch nothing happens at zero and the page says so.
  function tick() { const now = Date.now(), left = 3600000 - (now % 3600000), m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60; $('tdDigits').textContent = p2(m) + ':' + p2(s); $('tdBar').style.width = (100 - left / 36000) + '%'; }
  tick(); setInterval(tick, 1000);
  // the note names what is actually missing, read from the one helper rather than guessed from an address
  $('tdClockNote').textContent = live
    ? 'At :00 the pot goes shopping. Anyone can start the tide, and our bot does it too, so it can land a little after the hour.'
    : SH.stage() === 'token' ? 'The token is live and the engine is being connected, so this clock is still only showing the rhythm.'
    : 'There is no ' + SYM_TOKEN + ' yet, so nothing happens at :00 and this clock only shows the rhythm.';

  if (live) { const p = $('tdEngine'); p.textContent = 'The tide is run by this contract: '; p.append(L.explorerAddress ? el('a', { href: L.explorerAddress + C.contracts.engine, rel: 'noopener', target: '_blank', class: 'td-addr', text: C.contracts.engine }) : el('code', { class: 'td-addr', text: C.contracts.engine }), '. Check it against the docs before you trust any number here.'); }

  // ---- one row. cells carry a data-l label so a phone can show the row as a small card
  const cell = (label, kids) => el('span', { role: 'cell', 'data-l': label }, kids);
  function row(r) {
    const empty = !(r.potUsd > 0);
    return el('div', { class: 'td-row' + (empty ? ' td-empty' : ''), role: 'row' }, [
      cell('When (UTC)', when(r.t)), cell('The pot, in ' + SYM, empty ? 'Empty. Nobody traded that hour.' : usd(r.potUsd)),
      cell('Crabs paid', empty ? '0' : (r.crabs || 0).toLocaleString('en-US')),
      cell('Check it', r.tx && L.explorerTx ? el('a', { href: L.explorerTx + r.tx, rel: 'noopener', target: '_blank', text: 'Transaction' }) : r.tx ? el('code', { class: 'td-addr', text: r.tx.slice(0, 10) + '…' }) : 'No transaction'),
    ]);
  }
  // before launch: the shape of a row, with no numbers in it, so nobody mistakes it for a result
  function ghost() { return el('div', { class: 'td-row td-ghost', role: 'row' }, [cell('When (UTC)', 'The hour'), cell('The pot, in ' + SYM, 'How much ' + SYM + ' it bought'), cell('Crabs paid', 'How many were awake'), cell('Check it', 'The transaction')]); }

  function show(list) {
    const rows = list.filter((r) => r && isFinite(r.t)).sort((a, b) => b.t - a.t), host = $('tdRows'); let shown = 0;
    const paid = rows.reduce((a, r) => a + (r.potUsd > 0 ? r.potUsd : 0), 0), empties = rows.filter((r) => !(r.potUsd > 0)).length;
    $('tTides').textContent = rows.length.toLocaleString('en-US'); $('tPaid').textContent = usd(paid); $('tEmpty').textContent = empties.toLocaleString('en-US'); $('tLast').textContent = rows.length ? when(rows[0].t) + ' UTC' : 'None yet';
    $('tdState').hidden = rows.length > 0; $('tdTiles').hidden = !rows.length; host.textContent = '';
    const more = () => { rows.slice(shown, shown + PAGE).forEach((r) => host.append(row(r))); shown = Math.min(rows.length, shown + PAGE); $('tdMore').hidden = shown >= rows.length; };
    $('tdMore').onclick = more; more();
  }

  $('tdTiles').hidden = true; // four tiles that all say 'nothing' only push the record down; they appear with the first tide
  (function tideFeed() {
    if (!live || !feed) {
      $('tdRows').append(ghost());
      // The page's written default assumes no token at all. Once one exists, that sentence is false, so say
      // which of the two things is actually missing rather than blaming the token for the engine.
      if (live && SH.stage() === 'token') $('tdState').textContent = 'The token is live. The record of tides is being connected, and until it is you can follow every tide on the contract itself.';
      else if (live) $('tdState').textContent = 'No tides yet. The contract that runs the tide is deployed, and the first tide comes after ' + SYM_TOKEN + ' launches.';   // the engine exists before the token does
      else if (C.contracts && C.contracts.token) $('tdState').textContent = 'No tides yet. ' + SYM_TOKEN + ' is live, but the contract that runs the tide is not connected yet, so the pot has not filled and no crab has been paid.';
      return;
    }
    $('tdState').textContent = 'Loading the tides.';
    fetch(feed, { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((j) => { const list = Array.isArray(j) ? j : j.tides || []; if (!list.length) { $('tdState').textContent = 'No tides yet. The first one lands at the next full hour after trading starts.'; $('tdRows').append(ghost()); } else show(list); })
      .catch(() => { $('tdState').hidden = false; $('tdState').textContent = 'The record could not be loaded just now. The tides themselves do not depend on this page: they are on the chain, at the contract listed below.'; });
  })();

  // ---- the raid feed: who took what from whose pool. Same shape as the tides record, same keeper pattern.
  //      config.raid = { live, startsText, takePct, fee, cooldownHours, minPool, feed }
  //      feed rows: [{ "t": 1790000000, "fromId": 1180, "byId": 402, "usd": 4.20, "tx": "0x…" }]  fromId = the pool raided, byId = the raider.
  (function raidFeed() {
    const R = C.raid || {}, rFeed = R.feed, host = $('rdRows'), state = $('rdState');
    const crab = (id) => 'Crab #' + (id == null ? '?' : id);
    const rRow = (r) => el('div', { class: 'td-row', role: 'row' }, [
      cell('When (UTC)', when(r.t)),
      cell('What happened', [el('b', { text: crab(r.byId) }), ' raided ', el('b', { text: crab(r.fromId) }), "'s pool"]),
      cell('Taken', usd(r.usd || 0)),
      cell('Check it', r.tx && L.explorerTx ? el('a', { href: L.explorerTx + r.tx, rel: 'noopener', target: '_blank', text: 'Transaction' }) : r.tx ? el('code', { class: 'td-addr', text: r.tx.slice(0, 10) + '…' }) : 'No transaction'),
    ]);
    const rGhost = () => el('div', { class: 'td-row td-ghost', role: 'row' }, [cell('When (UTC)', 'The hour'), cell('What happened', 'Which crab raided which pool'), cell('Taken', 'How much ' + SYM + ' it took'), cell('Check it', 'The transaction')]);
    const rShow = (list) => {
      const rows = list.filter((r) => r && isFinite(r.t)).sort((a, b) => b.t - a.t); let shown = 0; host.textContent = ''; state.hidden = rows.length > 0;
      const more = () => { rows.slice(shown, shown + PAGE).forEach((r) => host.append(rRow(r))); shown = Math.min(rows.length, shown + PAGE); $('rdMore').hidden = shown >= rows.length; };
      $('rdMore').onclick = more; more();
    };
    if (!R.live) { state.textContent = 'No raids yet. Raiding is switched off, and it starts ' + (R.startsText || 'after launch') + '. Until then, pay waits in a crab\'s tide pool and nobody can touch it.'; host.append(rGhost()); return; }
    if (!rFeed) { state.textContent = 'Raiding is open. The record of raids is being connected, and until it is you can follow every raid on the contract itself.'; host.append(rGhost()); return; }
    state.textContent = 'Loading the raids.';
    fetch(rFeed, { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((j) => { const list = Array.isArray(j) ? j : j.raids || []; if (!list.length) { state.textContent = 'Raiding is open, and nobody has raided a pool yet.'; host.append(rGhost()); } else rShow(list); })
      .catch(() => { state.hidden = false; state.textContent = 'The raid record could not be loaded just now. The raids themselves do not depend on this page: they are on the chain.'; });
  })();
})();
