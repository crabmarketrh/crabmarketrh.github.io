// My crabs: connect a wallet, see your crabs, wake them, level them up and claim their tide pools.
// Vanilla JS, no library: the calldata for the handful of functions this page uses is built by hand (every argument is a
// uint256, a uint8, an address or one uint256[] array). READS go to the chain's public RPC over fetch, so they work
// whatever chain the wallet is on; WRITES go through the wallet (eth_sendTransaction) and need Robinhood Chain.
// Every burn is token.transferFrom(you, dead, amount) inside the collection contract, so an action that burns is two
// confirmations: an approval for exactly that amount, then the action. Nothing here ever asks for a signature that is
// not the transaction you see in the wallet. Addresses come from config.js and nowhere else.
(function () {
  if (!document.getElementById('connect')) return;   // the block lives on /my/ and on the home page; nowhere else
  const { C, el, still, paintPiece } = SH; if (!document.querySelector('header .nav')) SH.mount(); if (typeof buildProps === 'function') buildProps();
  const $ = (id) => document.getElementById(id), sym = C.token.symbol || '$CRAB', DEV = location.hostname === '127.0.0.1', Q = new URLSearchParams(location.search);
  // ---- the chain and the contracts. On 127.0.0.1 only, ?rpc=&chain=&crabs=&engine=&token= point the page at a devnet.
  // two public RPCs: the official one rate-limits bursts (HTTP 429 with no CORS header, which a browser reports as "Failed to fetch"), so every read retries with backoff and rotates to the next endpoint
  const NET = { id: 4663, name: 'Robinhood Chain', rpcs: ['https://rpc.mainnet.chain.robinhood.com', 'https://robinhood-rpc.publicnode.com'], explorer: 'https://robinhoodchain.blockscout.com', symbol: 'ETH' };
  if (DEV) { if (Q.get('rpc')) NET.rpcs = [Q.get('rpc')]; if (Q.get('chain')) NET.id = Number(Q.get('chain')); if (Q.get('explorer')) NET.explorer = Q.get('explorer'); }
  const ADDR = { crabs: (DEV && Q.get('crabs')) || C.contracts.crabs || '', engine: (DEV && Q.get('engine')) || C.contracts.engine || '', token: (DEV && Q.get('token')) || C.contracts.token || '' };
  const HEX_ID = '0x' + NET.id.toString(16), SUPPLY = Number(C.collection.supply) || 2222, DEAD = '0x000000000000000000000000000000000000dEaD';
  const E18 = 10n ** 18n, PAY_DEC = 6n; // $CRAB has 18 decimals; the pay token (USDG) has 6
  const WAKE = 30000n * E18, LADDER = [30000n, 90000n, 210000n, 450000n, 1000000n].map((n) => n * E18), POWER = [100, 150, 220, 320, 500];
  // ---- selectors (cast sig) and the custom errors the contracts throw, in plain words
  const SEL = { wake: '0x93baf48d', levelUp: '0x125d49f6', crabs: '0xbb32303e', claim: '0x6ba4c138', pools: '0x2ace9482', credit: '0xd5d44d80', withdraw: '0x3ccfd60b', balanceOf: '0x70a08231', approve: '0x095ea7b3', allowance: '0xdd62ed3e', totalMinted: '0xa2309ff8', token: '0xfc0c546a' };
  const ERR = { '0x7623fb52': 'That is not your crab.', '0xe7105b21': 'This crab is already awake.', '0x74152682': 'Wake the crab first.', '0x76c80a56': 'Pick a level above the current one, up to 5.', '0x179435b3': sym + ' is not live yet, so nothing can be burned.', '0xd3cbb644': 'No such item.', '0x569059c6': 'This crab already has that item.', '0x848084dd': 'No free slot: one item per level.', '0x52df9fe5': 'That item is sold out.', '0x342fa66d': 'The item bonus cap is reached.', '0x30cd7471': 'That is not your crab.', '0x969bf728': 'Nothing to claim yet.', '0xb5dfd9e5': 'Busy, try again.', '0xfb8f41b2': 'Approve the burn first.', '0xe450d38c': 'Not enough ' + sym + ' in the wallet.' };   // the last two are OpenZeppelin v5 ERC-20 errors the real token throws
  // ---- abi, by hand
  const w = (n) => BigInt(n).toString(16).padStart(64, '0'), wa = (a) => String(a).slice(2).toLowerCase().padStart(64, '0');
  const enc = (sel, ...words) => sel + words.join(''), encArr = (list) => w(32) + w(list.length) + list.map(w).join('');   // one array as the only argument
  const words = (hex) => { const h = String(hex || '').slice(2); const out = []; for (let i = 0; i + 64 <= h.length; i += 64) out.push(h.slice(i, i + 64)); return out; };
  const big = (x) => BigInt('0x' + (x || '0')), addr = (x) => '0x' + x.slice(24);
  // ---- json-rpc over fetch (reads) and the wallet (writes)
  let rpcId = 1, rpcAt = 0; const BACKOFF = [400, 1000, 2000, 4000];
  async function rpc(method, params) {
    let last = null;
    for (let attempt = 0; attempt <= BACKOFF.length; attempt++) {
      const url = NET.rpcs[(rpcAt + attempt) % NET.rpcs.length];
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method, params }) });
        if (r.status === 429 || r.status >= 500) throw new TypeError('http ' + r.status);
        const j = await r.json(); if (j.error) { const e = new Error(j.error.message || 'rpc error'); e.data = j.error.data; throw e; }   // a revert is an answer, not an outage: no retry
        rpcAt = (rpcAt + attempt) % NET.rpcs.length; return j.result;
      } catch (e) { if (!(e instanceof TypeError)) throw e; last = e; if (attempt < BACKOFF.length) await new Promise((res) => setTimeout(res, BACKOFF[attempt])); }
    }
    throw new Error('The chain did not answer (' + ((last && last.message) || 'network') + '). Try again in a moment.');
  }
  const call = (to, data, from) => rpc('eth_call', [Object.assign({ to, data }, from ? { from } : {}), 'latest']);
  function reason(e) {
    let d = e && e.data; if (d && typeof d === 'object') d = d.data || d.originalError && d.originalError.data; if (typeof d !== 'string') d = '';
    if (d.length >= 10 && ERR[d.slice(0, 10)]) return ERR[d.slice(0, 10)];
    if (d.startsWith('0x08c379a0')) { try { const ws = words('0x' + d.slice(10)); const n = Number(big(ws[1])); let s = ''; const hex = ws.slice(2).join('').slice(0, n * 2); for (let i = 0; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16)); if (/allowance|balance|burn failed|transfer/i.test(s)) return 'Not enough ' + sym + ' in the wallet, or the approval did not go through.'; return s; } catch (x) { /* fall through */ } }
    const m = (e && e.message) || ''; if (/user rejected|denied|rejected the request/i.test(m)) return 'You cancelled it in the wallet.'; if (/insufficient funds/i.test(m)) return 'Not enough ETH on ' + NET.name + ' for the network fee.'; return m ? m.slice(0, 140) : 'It did not go through.';
  }
  // ---- words
  const fmtCrab = (v) => Number(v / E18).toLocaleString('en-US'), fmtPay = (v) => '$' + (Number(v) / 10 ** Number(PAY_DEC)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const short = (a) => a.slice(0, 6) + '…' + a.slice(-4), LEGENDS = C.collection.legendIds || [];
  const stateLine = () => ADDR.token ? sym + ' is live. Connect a wallet that holds crabs to wake them, level them up and claim their tide pools.' : sym + ' is not live yet. Connect to see your crabs now; waking and levelling open the moment the token launches, and the real link appears on this site first.';
  // ---- state
  let eth = window.ethereum || null, me = '', chain = '', rows = null, mine = [], pools = {}, credit = 0n, bal = 0n, busy = false, lastLoad = 0;
  function say(kind, html, link) { const log0 = $('myLog'), top = log0.firstElementChild; if (top && top.className === kind && top.firstChild && top.firstChild.textContent === html) return;   // the same line twice says nothing new
    const li = el('li', { class: kind }); li.append(html); if (link) li.append(' ', el('a', { href: link, target: '_blank', rel: 'noopener', text: 'view' })); const log = $('myLog'); log.prepend(li); log.hidden = false; while (log.children.length > 8) log.lastChild.remove(); }
  const txLink = (h) => NET.explorer ? NET.explorer + '/tx/' + h : '';
  function paintState() {
    $('myState').textContent = stateLine();
    const on = !!me; $('connect').hidden = on; $('who').hidden = !on; $('myBar').hidden = !on; $('myGrid').hidden = !on; $('myEmpty').hidden = true;
    if (on) { $('whoAddr').textContent = short(me); $('whoChain').textContent = chain === HEX_ID ? NET.name : 'Wrong network'; $('whoChain').className = 'tag ' + (chain === HEX_ID ? 'ok' : 'warn'); $('switch').hidden = chain === HEX_ID; }
    if (!eth) { $('noWallet').hidden = false; $('connect').hidden = true; }
  }
  // ---- wallet
  async function connect(silent) {
    if (!eth) return;
    try { const acc = await eth.request({ method: silent ? 'eth_accounts' : 'eth_requestAccounts' }); me = (acc && acc[0]) ? acc[0].toLowerCase() : ''; } catch (e) { if (!silent) say('bad', reason(e)); me = ''; }
    try { chain = await eth.request({ method: 'eth_chainId' }); } catch (e) { chain = ''; }
    try { localStorage.setItem('crabWallet', me ? '1' : ''); } catch (e) { /* private window */ }
    paintState(); if (me) load();
  }
  async function switchChain() {
    if (!eth) return;
    try { await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: HEX_ID }] }); }
    catch (e) { if (e && (e.code === 4902 || /unrecognized|not added|4902/i.test(e.message || ''))) { try { await eth.request({ method: 'wallet_addEthereumChain', params: [{ chainId: HEX_ID, chainName: NET.name, rpcUrls: [NET.rpcs[0]], nativeCurrency: { name: 'Ether', symbol: NET.symbol, decimals: 18 }, blockExplorerUrls: NET.explorer ? [NET.explorer] : [] }] }); } catch (x) { say('bad', reason(x)); } } else say('bad', reason(e)); }
    try { chain = await eth.request({ method: 'eth_chainId' }); } catch (e) { /* keep */ } paintState();
  }
  // ---- reads
  async function scan(owner) {
    let n = SUPPLY; try { n = Number(big(words(await call(ADDR.crabs, enc(SEL.totalMinted)))[0])) || SUPPLY; } catch (e) { /* the full supply then */ }
    // one call for the whole collection (measured: 2,222 ids answer in about half a second, 853 KB); a burst of parallel chunks got rate-limited
    const ids = [], list = []; for (let i = 1; i <= n; i++) list.push(i);
    const ws = words(await call(ADDR.crabs, enc(SEL.crabs, encArr(list)))), len = Number(big(ws[1]));
    for (let k = 0; k < len; k++) { const o = 2 + k * 6; if (addr(ws[o]) === owner) ids.push({ id: list[k], level: Number(big(ws[o + 1])), awake: big(ws[o + 2]) === 1n, items: Number(big(ws[o + 3])), immune: big(ws[o + 4]) === 1n, power: Number(big(ws[o + 5])) }); }
    return ids;
  }
  async function load() {
    if (!me || busy) return; const who = me; busy = true; $('myLoading').hidden = false;
    try {
      if (!rows) rows = await fetch('/art/collection.json').then((r) => r.json()).catch(() => null);
      mine = await scan(who); if (me !== who) return;
      pools = {}; credit = 0n; bal = 0n;
      const ids = mine.map((c) => c.id);
      // one read after another: never a burst
      if (ADDR.engine && ids.length) { try { const ws = words(await call(ADDR.engine, enc(SEL.pools, encArr(ids)))); ids.forEach((id, i) => { pools[id] = big(ws[2 + i]); }); } catch (e) { /* pools stay unknown this round */ } }
      if (ADDR.engine) { try { credit = big(words(await call(ADDR.engine, enc(SEL.credit, wa(who))))[0]); } catch (e) { /* keep */ } }
      if (ADDR.token) { try { bal = big(words(await call(ADDR.token, enc(SEL.balanceOf, wa(who))))[0]); } catch (e) { /* keep */ } }
      lastLoad = Date.now(); render();
    } catch (e) { say('bad', 'Could not read the chain: ' + reason(e)); }
    finally { busy = false; $('myLoading').hidden = true; }
  }
  // ---- render
  function render() {
    const grid = $('myGrid'); grid.textContent = ''; grid.hidden = false;
    const awake = mine.filter((c) => c.awake).length, owed = mine.reduce((a, c) => a + (pools[c.id] || 0n), 0n);
    $('sCrabs').textContent = String(mine.length); $('sAwake').textContent = String(awake); $('sPool').textContent = fmtPay(owed); $('sBal').textContent = ADDR.token ? fmtCrab(bal) : '—';
    $('claimAll').hidden = owed === 0n; $('withdraw').hidden = credit === 0n; $('sCredit').textContent = fmtPay(credit); $('sCreditRow').hidden = credit === 0n;
    if (!mine.length) { $('myEmpty').hidden = false; return; }
    mine.forEach((c) => {
      const row = rows && rows[c.id - 1], traits = row && typeof decodePiece === 'function' ? decodePiece(row) : SH.traitsOf(c.id);
      const cv = el('canvas', { class: 'px', width: 32, height: 32, role: 'img', 'aria-label': 'Crab #' + c.id }); paintPiece(cv.getContext('2d'), traits, { level: c.awake ? c.level : 0, seed: c.id, frame: 6 });
      const pool = pools[c.id] || 0n, legend = LEGENDS.includes(c.id) || (traits && traits.legend);
      const line = !c.awake ? (c.level ? 'Asleep. Level ' + c.level + ' kept: wake it and it earns again.' : 'Asleep, never woken. It earns nothing until you wake it.') : 'Awake, level ' + c.level + ', share ' + (c.power / 100) + 'x' + (c.immune ? ', un-raidable' : '') + '.';
      const btns = el('div', { class: 'row my-acts' });
      // wake
      if (!c.awake) btns.append(button('Wake · ' + fmtCrab(WAKE) + ' ' + sym, () => burnThen('Wake crab #' + c.id, WAKE, ADDR.crabs, enc(SEL.wake, w(c.id)))));
      // level up: the ladder is cumulative, so a climb costs the difference
      if (c.level > 0 && c.level < 5) { const sel = el('select', { class: 'my-sel', 'aria-label': 'Level for crab #' + c.id }); for (let L = c.level + 1; L <= 5; L++) sel.append(el('option', { value: String(L), text: 'Level ' + L + ' · ' + fmtCrab(LADDER[L - 1] - LADDER[c.level - 1]) + ' · ' + (POWER[L - 1] / 100) + 'x' }));
        btns.append(sel, button('Level up', () => { const L = Number(sel.value); burnThen('Level crab #' + c.id + ' up to ' + L, LADDER[L - 1] - LADDER[c.level - 1], ADDR.crabs, enc(SEL.levelUp, w(c.id), w(L))); })); }
      if (pool > 0n) btns.append(button('Claim ' + fmtPay(pool), () => send('Claim crab #' + c.id, ADDR.engine, enc(SEL.claim, encArr([c.id])))));
      const card = el('article', { class: 'card my-card' + (c.awake ? ' awake' : '') }, [cv, el('span', { class: 'n', text: legend ? 'Legend' : 'Crab' }), el('h3', { text: 'Crab #' + c.id }), el('p', { text: line }), el('p', { class: 'my-pool', text: 'Tide pool: ' + fmtPay(pool) + (pool > 0n ? ', waiting for you.' : '.') }), btns]);
      grid.append(card);
    });
    if (!ADDR.token) grid.querySelectorAll('.my-acts button').forEach((b) => { if (!/^Claim/.test(b.textContent)) { b.disabled = true; b.title = sym + ' is not live yet'; } });
  }
  function button(text, fn) { const b = el('button', { class: 'btn sm burn', type: 'button', text }); b.addEventListener('click', () => { if (!busyTx) fn(); }); return b; }
  // ---- writes
  let busyTx = false;
  async function ready() {
    if (!eth || !me) { say('bad', 'Connect a wallet first.'); return false; }
    try { chain = await eth.request({ method: 'eth_chainId' }); } catch (e) { /* keep */ }
    if (chain !== HEX_ID) { say('bad', 'Switch the wallet to ' + NET.name + ' first.'); paintState(); await switchChain(); if (chain !== HEX_ID) return false; }
    return true;
  }
  async function wait(hash) { for (let i = 0; i < 180; i++) { const r = await rpc('eth_getTransactionReceipt', [hash]).catch(() => null); if (r) return r; await new Promise((res) => setTimeout(res, 1000)); } throw new Error('Still pending after three minutes. Check the explorer.'); }
  async function send(label, to, data) {
    if (!(await ready())) return false; busyTx = true; document.body.classList.add('my-busy');
    try {
      try { await call(to, data, me); } catch (e) { say('bad', label + ': ' + reason(e)); return false; }   // rehearse first: a revert costs nothing here
      const hash = await eth.request({ method: 'eth_sendTransaction', params: [{ from: me, to, data }] });
      say('wait', label + ': sent, waiting for the chain.', txLink(hash));
      const rc = await wait(hash);
      if (rc.status === '0x1') { say('ok', label + ': done.', txLink(hash)); return true; }
      say('bad', label + ': the transaction failed on chain.', txLink(hash)); return false;
    } catch (e) { say('bad', label + ': ' + reason(e)); return false; }
    finally { busyTx = false; document.body.classList.remove('my-busy'); load(); }
  }
  // a burn: approve exactly this amount on the token (unless already allowed), then the action
  async function burnThen(label, amount, to, data) {
    if (!ADDR.token) { say('bad', sym + ' is not live yet.'); return; }
    if (!(await ready())) return;
    let allowed = 0n; try { allowed = big(words(await call(ADDR.token, enc(SEL.allowance, wa(me), wa(ADDR.crabs))))[0]); } catch (e) { /* treat as 0 */ }
    if (bal < amount) { try { bal = big(words(await call(ADDR.token, enc(SEL.balanceOf, wa(me))))[0]); } catch (e) { /* keep */ } if (bal < amount) { say('bad', label + ': you hold ' + fmtCrab(bal) + ' ' + sym + ' and this burns ' + fmtCrab(amount) + '.'); return; } }
    if (allowed < amount) { const ok = await send('Approve ' + fmtCrab(amount) + ' ' + sym + ' for the burn', ADDR.token, enc(SEL.approve, wa(ADDR.crabs), w(amount))); if (!ok) return; }
    await send(label, to, data);
  }
  // ---- wiring
  $('connect').addEventListener('click', () => connect(false));
  $('switch').addEventListener('click', switchChain);
  $('refresh').addEventListener('click', () => load());
  $('claimAll').addEventListener('click', () => { const ids = mine.filter((c) => (pools[c.id] || 0n) > 0n).map((c) => c.id); if (ids.length) send('Claim ' + ids.length + ' tide pool' + (ids.length > 1 ? 's' : ''), ADDR.engine, enc(SEL.claim, encArr(ids))); });
  $('withdraw').addEventListener('click', () => send('Withdraw banked pay', ADDR.engine, enc(SEL.withdraw)));
  if (eth && eth.on) { eth.on('accountsChanged', () => connect(true)); eth.on('chainChanged', () => connect(true)); }
  paintState();
  let auto = false; try { auto = !!localStorage.getItem('crabWallet'); } catch (e) { /* private window */ }
  if (eth && auto) connect(true);
  document.addEventListener('crabstage', paintState);
  if (!still && !DEV) setInterval(() => { if (me && !busy && !busyTx && document.visibilityState === 'visible' && Date.now() - lastLoad > 55000) load(); }, 60000);   // the tide lands once an hour; a minute is plenty
})();
