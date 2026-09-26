// The list page, stage one: make and save your card. The "paste your post" check switches on when config.list.url is set.
(function () {
  const { C, el, seedOf, traitsOf, paintPiece } = SH; SH.mount();
  const $ = (id) => document.getElementById(id), card = $('card'), x = card.getContext('2d'), msg = $('msg'); x.imageSmoothingEnabled = false;
  const B32 = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  async function passOf(addr) { const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(addr.toLowerCase()))); let s = ''; for (let i = 0; i < 5; i++) s += B32[d[i] % B32.length]; return 'CRAB-' + s; }
  function draw(o) {
    const t = o ? traitsOf(seedOf(o.wallet)) : SH.hero(), bg = (typeof FLAT !== 'undefined' && FLAT[t.scene]) || '#8fd3ff';
    x.fillStyle = '#12222f'; x.fillRect(0, 0, 1200, 675); x.fillStyle = bg; x.fillRect(14, 14, 1172, 647);
    const tmp = el('canvas', { width: 32, height: 32 }); paintPiece(tmp.getContext('2d'), t, { seed: 5 }); x.fillStyle = '#12222f'; x.fillRect(46, 60, 556, 556); x.drawImage(tmp, 54, 68, 540, 540);
    x.fillStyle = '#12222f'; x.fillRect(626, 60, 528, 556); x.fillStyle = '#fffaf0'; x.fillRect(634, 68, 512, 540); x.save(); x.translate(26, -16); x.scale(1, 1);
    x.fillStyle = '#12222f'; x.font = '46px Silkscreen, monospace'; x.fillText("I'M ON", 640, 190); x.fillText('THE LIST', 640, 246);
    x.font = '700 30px Nunito, sans-serif'; x.fillStyle = '#41586a'; x.fillText(C.collection.supply.toLocaleString('en-US') + ' hermit crabs + the ' + C.token.symbol, 640, 312); x.fillText('token. The list mints first.', 640, 352);
    x.fillStyle = '#12222f'; x.font = '34px Silkscreen, monospace'; x.fillText(o ? '@' + o.handle : '@you', 640, 440);
    x.fillStyle = '#ff6b57'; x.fillRect(640, 470, 400, 84); x.fillStyle = '#fff'; x.font = '42px Silkscreen, monospace'; x.fillText(o ? o.pass : 'CRAB-?????', 660, 528);
    x.fillStyle = '#12222f'; x.font = '24px Silkscreen, monospace'; x.fillText(C.name.toUpperCase(), 640, 600);
    if (window.CrabHunt && CrabHunt.found() >= CrabHunt.total) { x.fillStyle = '#12222f'; x.fillRect(904, 566, 204, 44); x.fillStyle = '#ffc93c'; x.fillRect(908, 570, 196, 36); x.fillStyle = '#12222f'; x.font = '18px Silkscreen, monospace'; x.fillText('LEGEND HUNTER', 918, 595); }
    x.restore();
  }
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(); fonts.then(() => draw(null)); draw(null);
  $('form').addEventListener('submit', async (e) => {
    e.preventDefault(); const wallet = $('wallet').value.trim(), handle = $('handle').value.trim().replace(/^@/, '');
    if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) { msg.textContent = 'That does not look like a wallet address. It starts with 0x and has 42 characters.'; $('wallet').focus(); return; }
    if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) { msg.textContent = 'That does not look like an X handle. Letters, numbers and underscores only.'; $('handle').focus(); return; }
    const pass = await passOf(wallet); last = { wallet, handle, pass }; draw(last); $('make').className = 'btn'; $('make').textContent = 'Remake the card'; $('after').hidden = false; step(open ? 2 : 1);
    $('echo').hidden = false; $('echo').textContent = 'Check it, first to last character: ' + wallet;
    setOpen(open); $('already').hidden = !open && !shut; if (shut) { $('after').hidden = true; msg.textContent = 'The list has closed, so this card is now just a card. The mint is next.'; }
    $('posttext').textContent = postText(pass);
    msg.textContent = open ? 'Card ready. Send or copy it into a post on X, add the text, then paste the link to your post below.' : 'Card ready. You can keep it now. Posting opens when the list opens.';
    if (open) { $('send').hidden = false; $('send').disabled = false; $('send').textContent = 'Put me on the list'; }
  });
  let last = null; document.addEventListener('crabhunt', () => draw(last));
  // The page renders from the one shared signal; only the Worker decides whether an actual claim is accepted.
  // Never re-derive this from config here: doing so is how a half-done close left this page inviting people.
  let open = SH.isOpen().list;
  const W = (C.list.url || '').replace(/\/$/, '');
  // NOT stage() === 'listShut': stage() ranks the mint above a closed list, so on mint day that test is false and the
  // page fell back to its pre-launch 'not open yet' text. A closed list stays closed whatever opens after it.
  const shut = !open && !!C.list.closed, mintOn = SH.isOpen().mint, mintOver = !!C.mint.closed; // read the config flag, not stage(): a closed list stays closed whatever comes after it
  function setOpen(isOpen, count) {
    open = isOpen;
    if (count != null && count > 0) { const n = document.getElementById('listCount'); n.hidden = false; n.textContent = count.toLocaleString('en-US') + ' on the list'; }
    $('posturl').disabled = !open;
    $('postnote').textContent = open ? 'It must be a public post from @' + $('handle').value.replace(/^@/, '') + '. A protected account cannot be checked.' : 'This opens when the list opens.';
    if (open) { $('state').textContent = 'The list is open. Make your card, post it on X, then paste the link.' + (SH.mintAt() && SH.now() < SH.mintAt() ? ' The mint opens ' + SH.mintWhen() + '.' : ''); if (last) { $('send').hidden = false; step(2); } }
    else if (shut) { $('state').textContent = mintOver ? 'The list has closed and the mint is over. It did its job: everyone on it minted first. There is nothing left to apply for.' : mintOn ? 'The list has closed, and the mint is open now. Wallets on the list mint first.' : 'The list has closed. We are checking the posts now, and the mint date will be announced here and on our X account first.'; $('postnote').textContent = 'The list is closed, so a new post cannot get you on it.'; }
  }
  setOpen(open);
  if (C.list.countFile) fetch(C.list.countFile).then((r) => r.json()).then((d) => d && d.count > 0 && setOpen(open, d.count)).catch(() => {});

  // step 4: hand the post to the Worker, which checks X itself
  async function send() {
    const url = $('posturl').value.trim();
    if (!/^https?:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/i.test(url)) { $('postnote').textContent = 'That does not look like a link to a post. It looks like https://x.com/you/status/1234567890'; $('posturl').focus(); return; }
    $('send').disabled = true; $('send').textContent = 'Checking your post...';
    try {
      const r = await fetch(W + '/claim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ wallet: last.wallet, handle: last.handle, url }) });
      const d = await r.json().catch(() => ({}));
      if (d && d.ok) { $('done').hidden = false; $('done').textContent = (d.already ? 'You were already on the list. ' : (d.message || 'You are on the list. ')) + (d.position ? 'You are number ' + Number(d.position).toLocaleString('en-US') + '.' : ''); $('send').hidden = true; $('posturl').disabled = true; $('already').hidden = true; step(3);
        // a new spot, not a repeat: the visitor's own crab walks into the line under the form
        if (!d.already && !d.replaced) document.dispatchEvent(new CustomEvent('crabjoined', { detail: { wallet: last.wallet, position: d.position } })); }
      else { const missedText = shared && d && d.error && d.error.includes(last.pass);
        $('postnote').textContent = missedText ? 'X posted your picture without the words. The code has to be in the text of the post too, not only on the card. Add the text to your post, then paste the link again.' : ((d && d.error) || 'That did not work. Try again in a moment.');
        $('send').disabled = false; $('send').textContent = 'Put me on the list'; }
    } catch (e) { $('postnote').textContent = 'We could not reach the checker. Try again in a moment.'; $('send').disabled = false; $('send').textContent = 'Put me on the list'; }
  }
  $('send').addEventListener('click', send);
  $('already').addEventListener('click', async () => {
    if (!last) return; const b = $('already'); b.disabled = true; b.textContent = 'Checking...';
    try { const r = await fetch(W + '/check?wallet=' + last.wallet); const d = await r.json();
      if (d && d.ok && d.on) { $('done').hidden = false; $('done').textContent = 'This wallet is already on the list. Nothing more to do.'; b.hidden = true; $('send').hidden = true; step(3); }
      else { b.textContent = 'Not on the list yet'; } }
    catch (e) { b.disabled = false; b.textContent = 'Could not check, try again'; }
  });
  $('posturl').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  // deliberately NO link: a URL makes X draw its own preview, which looks like a finished post and is why most people skipped attaching their card
  const postText = (pass) => "I'm on the list for " + (C.list.xHandle ? '@' + C.list.xHandle.replace(/^@/, '') : C.name) + '. ' + C.collection.supply.toLocaleString('en-US') + ' hermit crabs + the ' + C.token.symbol + ' token on ' + C.collection.chainName + '.\n\nMy pass: ' + pass;
  const lis = [...document.querySelectorAll('#steps li')]; function step(n) { lis.forEach((li, i) => { if (i <= n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); }); } step(0);
  $('copytext').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('posttext').textContent); $('copytext').textContent = 'Copied'; } catch (e) { $('copytext').textContent = 'Select the text and copy it'; } });
  const saveCard = () => card.toBlob((b) => { const a = el('a', { href: URL.createObjectURL(b), download: 'my-list-card.png' }); document.body.append(a); a.click(); a.remove(); });
  $('save').addEventListener('click', saveCard);
  let shared = false;
  const cardFile = async () => new File([await new Promise((r) => card.toBlob(r))], 'my-list-card.png', { type: 'image/png' });
  (async () => { try { const f = await cardFile(); if (navigator.canShare && navigator.canShare({ files: [f] })) { $('sharecard').hidden = false; $('copycard').className = 'btn sm'; } } catch (e) { /* no share sheet here */ } })();
  $('sharecard').addEventListener('click', async () => {
    const btn = $('sharecard');
    try { await navigator.share({ files: [await cardFile()], text: $('posttext').textContent });
      shared = true; btn.textContent = 'Sent. Now paste the text'; msg.textContent = 'Some apps take only the picture, so check the words are in your post before you send it.'; }
    catch (e) { if (e && e.name === 'AbortError') return; $('copycard').className = 'btn go sm'; btn.hidden = true; msg.textContent = 'That did not work here. Copy the card instead.'; }
  });
  $('copycard').addEventListener('click', async () => {
    const btn = $('copycard');
    try {
      const blob = await new Promise((r) => card.toBlob(r));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      btn.textContent = 'Copied. Paste it into X'; setTimeout(() => { btn.textContent = 'Copy the card'; }, 4000);
    } catch (e) { $('save').hidden = false; saveCard(); btn.textContent = 'Saved as a picture instead'; }
  });

})();
