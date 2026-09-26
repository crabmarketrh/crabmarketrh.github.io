// The $CRAB page: the loop, the burn ladder, the pay simulator and the "where to buy" box.
// Reads only SHELL_CONFIG. Optional keys it understands once the team sets them:
//   token.levelCosts   ['','','','']    burn to reach levels 2..5 (wakeCost is the burn to reach level 1)
//   token.levelWeights ['','','','','']  share weight of levels 1..5
//   links.buy          ''                where the buy button points once contracts.token is set
(function () {
  const { C, el, still, piece, paintPiece, traitsOf } = SH;
  SH.mount(); buildProps();
  const $ = (id) => document.getElementById(id), T = C.token, LV = T.levels || 5, sym = T.symbol;
  const num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return isFinite(n) && n >= 0 ? n : 0; };
  const listed = (a, i) => (Array.isArray(a) && a[i] !== '' && a[i] != null ? String(a[i]) : '');
  const LEGENDS = num(C.collection.legendaries) || 0, LEGEND_X = num(T.legendBonus) || 1;
  const x = (v) => +v.toFixed(2) + 'x';

  // set text, and blink the element if the value really changed (the CSS animation is off under reduced motion)
  const put = (node, text) => { if (node.textContent === text) return; node.textContent = text; node.classList.remove('tk-flash'); void node.offsetWidth; node.classList.add('tk-flash'); };

  // ---- jump strip: mark the section being read
  (function jump() {
    const links = [...document.querySelectorAll('#tkJump a')], byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a])); if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; links.forEach((a) => a.removeAttribute('aria-current')); const a = byId.get(e.target.id); a.setAttribute('aria-current', 'true'); const box = a.parentNode; box.scrollLeft = a.offsetLeft - box.offsetLeft - 16; }), { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const sec = document.getElementById(id); if (sec) io.observe(sec); });
  })();

  // ---- hero: a top-level island with the project's crab on it
  const me = { gx: GC, gy: GC, tier: 5, traits: SH.hero(), seed: 88 };
  const sea = makeSea($('tkSea'), [me], { follow: true });
  if (still) sea.draw(3000, true);
  else { let seen = true; if ('IntersectionObserver' in window) new IntersectionObserver((es) => { seen = es[0].isIntersecting; }).observe($('tkSea')); let artAt = 0; (function loop(now) { if (seen && !document.hidden && now - artAt > 110) { artAt = now; sea.draw(now, false); } requestAnimationFrame(loop); })(0); }

  // ---- copy that depends on numbers the team has (or has not) fixed yet
  // The exact trade fee and its split are deliberately not published. The loop nodes and the FAQ keep the
  // plain-language lines written into the HTML: a fee is taken, a fixed share of it fills the hourly pot.
  const KEPT = { yes: 'It keeps its shell level, so the new owner only pays the wake again.', no: 'It also drops back to level 0, so levels do not survive a sale.' };
  if (KEPT[T.levelKeptOnSale]) $('tkKept').textContent = KEPT[T.levelKeptOnSale];
  if (T.noPresale === true) { $('tkNoPresale').hidden = false; if (T.teamFirstBuy) $('tkFirstBuy').textContent = 'Its size: ' + T.teamFirstBuy + '.'; }
  paintPiece($('tkBurn').getContext('2d'), { ...SH.hero(), eyes: 'happy' }, { level: 5, seed: 3, frame: 10 });

  // ---- burn ladder: asleep, then one card per level. Numbers only if the config has them.
  const demo = { ...traitsOf(58), extra: 'none' };
  // wakeCost reaches level 1; levelCosts are the EXTRA burn for each step up. TOTAL[L] = everything burned to stand at level L (0 if a step is not set yet).
  const STEP = [0]; for (let L = 1; L <= LV; L++) STEP.push(num(L === 1 ? T.wakeCost : listed(T.levelCosts, L - 2)));
  const TOTAL = STEP.map((_, L) => (STEP.slice(1, L + 1).every(Boolean) ? STEP.slice(0, L + 1).reduce((a, b) => a + b, 0) : 0)), full = (n) => Math.round(n).toLocaleString('en-US');
  let anyNumber = false;
  for (let L = 0; L <= LV; L++) {
    const w = L ? listed(T.levelWeights, L - 1) : ''; if (STEP[L] || w) anyNumber = true;
    const v = (t) => el('span', { class: 'v', text: t });
    const lines = L === 0 ? [el('span', { text: 'How every crab arrives. Earns nothing.' })]
      : [el('span', {}, [L === 1 ? 'Wake it: burn ' : 'Extra burn: ', v(STEP[L] ? full(STEP[L]) + ' ' + sym : 'set before launch')]), L > 1 && TOTAL[L] ? el('span', {}, ['Total so far: ', v(full(TOTAL[L]))]) : null, el('span', {}, ['Share weight: ', v(w || 'set before launch')])];
    $('tkLadder').append(el('figure', {}, [piece(L ? demo : { ...demo, eyes: 'closed' }, { level: L, seed: 3, frame: 10, label: L ? 'A crab at level ' + L : 'A sleeping crab' }), el('figcaption', {}, [el('b', { text: L === 0 ? 'Asleep' : 'Level ' + L })].concat(lines))]));
  }
  if (TOTAL[LV]) $('tkLadderTop').textContent = ' From asleep to the top: ' + full(TOTAL[LV]) + ' ' + sym + ' burned, in ' + (LV + 0) + ' steps.';
  if (anyNumber) {
    const note = $('tkLadderNote'); note.textContent = ''; note.append(el('b', { text: 'Burns are final. ' }), 'A burned token cannot be refunded. A share weight of 2x means twice the pay of a 1x crab from the same pot.' + (T.levelKeptOnSale === 'yes' ? ' Levels are permanent: a sold crab goes back to sleep but keeps its level, so levelling is not wasted if you sell.' : '') + (T.legendBonus ? ' The ' + C.collection.legendaries + ' legends earn ' + (LEGEND_X === 2 ? 'double' : T.legendBonus) + ' their level\'s share, so a legend at level 5 is worth ' + x(num((T.levelWeights || [])[LV - 1]) * LEGEND_X) + '.' : ''));
  }

  // ---- simulator
  const EX = { awake: [400, 300, 200, 100, 50], weights: [1, 2, 3, 4, 5], presets: [10000, 100000, 1000000] };
  const usd = (v) => (v <= 0 ? '$0.00' : v < 0.01 ? 'under $0.01' : v < 1000 ? '$' + v.toFixed(2) : '$' + Math.round(v).toLocaleString('en-US'));
  const SUPPLY = num(T.supply);
  const about = (v) => (v >= 100 ? '$' + Math.round(v).toLocaleString('en-US') : usd(v)); // weekly figure: whole dollars once it is big enough
  const real = (chip, ...ins) => { chip.textContent = 'fixed by the team'; chip.classList.add('real'); ins.forEach((i) => { i.readOnly = true; }); };
  if (T.tradeFeePct) { $('fee').value = num(T.tradeFeePct); real($('feeChip'), $('fee')); }
  if (T.potSharePct) { $('pot').value = num(T.potSharePct); real($('potChip'), $('pot')); }
  const realW = Array.from({ length: LV }, (_, i) => listed(T.levelWeights, i));
  const cell = (host, i, val, name) => { const inp = el('input', { type: 'number', inputmode: 'decimal', min: '0', step: name === 'w' ? '0.5' : '1', value: val, id: name + (i + 1) }); host.append(el('label', {}, ['Level ' + (i + 1), inp])); return inp; };
  const awakeIn = [], weightIn = [];
  for (let i = 0; i < LV; i++) { awakeIn.push(cell($('tkAwake'), i, EX.awake[i] != null ? EX.awake[i] : 0, 'n')); weightIn.push(cell($('tkWeights'), i, realW[i] ? num(realW[i]) : (EX.weights[i] != null ? EX.weights[i] : i + 1), 'w')); }

  if (realW.every(Boolean)) real($('wChip'), ...weightIn);

  // example crowds: the same pot split between few crabs (launch hour) or many (everyone awake)
  const NC = C.collection.supply, crowd = (f) => [0.38, 0.28, 0.19, 0.10, 0.05].map((x) => Math.round(NC * f * x));
  [['First hour: 25 awake', [25]], ['Half the crabs awake', crowd(0.5)], ['Every crab awake', crowd(1)]].forEach(([t, arr]) => $('tkAwakePresets').append(el('button', { class: 'btn sm', type: 'button', text: t, onclick: () => { awakeIn.forEach((inp, i) => { inp.value = arr[i] || 0; }); calc(); } })));

  // volume: the slider is a log scale from $1,000 to $10,000,000 a day; far left is zero
  const vol = $('vol'), range = $('volRange');
  const fromRange = (s) => { if (s <= 0) return 0; const v = Math.pow(10, 3 + (s / 100) * 4), m = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(v / m) * m; };
  const toRange = (v) => (v < 1000 ? 0 : Math.max(1, Math.min(100, Math.round(((Math.log10(v) - 3) / 4) * 100))));
  const presetBtns = EX.presets.map((p) => { const b = el('button', { class: 'btn sm', type: 'button', text: '$' + (p >= 1e6 ? p / 1e6 + 'M' : p / 1e3 + 'k'), 'aria-pressed': 'false', onclick: () => { vol.value = p; range.value = toRange(p); calc(); } }); $('tkPresets').append(b); return b; });
  range.addEventListener('input', () => { vol.value = fromRange(+range.value); calc(); });
  const sayVol = () => range.setAttribute('aria-valuetext', usd(num(vol.value)).replace(/\.00$/, '') + ' a day');
  vol.addEventListener('input', () => { range.value = toRange(num(vol.value)); calc(); });
  $('tkForm').addEventListener('input', (e) => { if (e.target !== vol && e.target !== range) calc(); });
  $('tkLegend').addEventListener('change', calc);
  $('tkZero').addEventListener('click', () => { vol.value = 0; range.value = 0; calc(); });

  let mine = Math.min(3, LV);
  const lvBtns = []; for (let L = 1; L <= LV; L++) { const b = el('button', { type: 'button', text: String(L), 'aria-label': 'Level ' + L, onclick: () => { mine = L; calc(); } }); $('tkLv').append(b); lvBtns.push(b); }
  const bars = []; for (let L = 1; L <= LV; L++) { const bar = el('i'), val = el('em'), row = el('div', { class: 'tk-bar' }, [el('span', { text: 'Lvl ' + L }), el('div', {}, [bar]), val]); $('tkBars').append(row); bars.push({ row, bar, val }); }
  const crabCtx = $('tkCrab').getContext('2d'), mineCrab = { ...SH.hero() };

  function calc() {
    const v = num(vol.value), fee = Math.min(100, num($('fee').value)), pot = Math.min(100, num($('pot').value));
    const n = awakeIn.map((i) => Math.floor(num(i.value))), w = weightIn.map((i) => num(i.value));
    const feesDay = v * fee / 100, potDay = feesDay * pot / 100, potHour = potDay / 24;
    // your own crab always counts as awake at its level, even if that level's box says 0
    // items: every other crab carries the average bonus, your crab carries its own. Both are capped by the contract at capPct of the level weight.
    const capPct = num((C.items || {}).capPct) || 100, ibMine = Math.min(capPct, num($('ibMine').value)) / 100, ibOthers = Math.min(capPct, num($('ibOthers').value)) / 100;
    $('ibMineOut').textContent = '+' + Math.round(ibMine * 100) + '%'; $('ibOthersOut').textContent = '+' + Math.round(ibOthers * 100) + '%';
    const counted = n.map((c, i) => (i === mine - 1 ? Math.max(1, c) : c)), awake = counted.reduce((a, b) => a + b, 0), wm = w[mine - 1];
    let weight = counted.reduce((a, c, i) => a + c * w[i] * (1 + ibOthers), 0) - wm * (1 + ibOthers) + wm * (1 + ibMine);
    // The legends are in the collection whether or not this toy mentions them, and they earn double, so leaving
    // them out overstates everyone else's pay. Assume they are spread evenly through whoever is awake.
    const legendsAwake = awake > 0 ? LEGENDS * Math.min(1, awake / C.collection.supply) : 0;
    if (legendsAwake > 0 && awake > 0) weight += weight * (LEGEND_X - 1) * (legendsAwake / awake);
    // the bars show an ordinary crab at each level (average items); the headline shows your crab with its own items
    const perHour = w.map((wi) => (weight > 0 ? potHour * wi * (1 + ibOthers) / weight : 0)), top = Math.max(...perHour, 0), myMult = $('tkLegend').checked ? LEGEND_X : 1,
      myHour = weight > 0 ? potHour * wm * (1 + ibMine) * myMult / weight : 0;
    $('oFees').textContent = usd(feesDay); $('oPotDay').textContent = usd(potDay); $('oPotHour').textContent = usd(potHour); $('oLegends').textContent = legendsAwake >= 1 ? Math.round(legendsAwake).toLocaleString('en-US') + ' of them earning ' + LEGEND_X + 'x' : 'none awake at this size';
    $('oAwake').textContent = awake.toLocaleString('en-US') + ' of ' + C.collection.supply.toLocaleString('en-US');
    const day = myHour * 24; put($('oDay'), usd(day)); $('oWeek').textContent = about(day * 7); $('oVol').textContent = usd(v).replace(/\.00$/, '');
    bars.forEach((b, i) => { b.bar.style.width = (top > 0 ? Math.max(1, perHour[i] / top * 100) : 0) + '%'; b.val.textContent = usd(perHour[i] * 24) + ' a day'; b.row.classList.toggle('on', i === mine - 1 && ibMine === ibOthers); });
    lvBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === mine - 1)));
    presetBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(v === EX.presets[i])));
    paintPiece(crabCtx, { ...mineCrab, eyes: v > 0 ? 'money' : 'plain', held: v > 0 ? 'coin' : 'nothing' }, { level: mine, seed: 3, frame: 10 });
    // What this level cost, against what the extra share now earns. The burn is in tokens and the pay is in
    // dollars, so it needs a price: the market cap input supplies one. Volume cancels out of the ratio, which
    // is why a bigger market at the same market cap does not pay a level off any faster.
    const fdv = num($('fdv').value), price = fdv > 0 && SUPPLY > 0 ? fdv / SUPPLY : 0;
    const spent = TOTAL[mine] * price, gainPerDay = weight > 0 ? potDay * (wm * (1 + ibMine) - (mine > 1 ? w[mine - 2] * (1 + ibMine) : 0)) / weight : 0;
    const wholeGain = weight > 0 ? potDay * wm * (1 + ibMine) * myMult / weight : 0;
    $('oBack').textContent = !price || !TOTAL[mine] ? 'set a market cap to see it'
      : wholeGain <= 0 ? 'never at this volume'
      : (spent / wholeGain < 1 ? 'under a day' : (spent / wholeGain < 2 ? 'about a day' : Math.round(spent / wholeGain).toLocaleString('en-US') + ' days'));
    $('oBackNote').textContent = !price || !TOTAL[mine] || wholeGain <= 0 ? ''
      : 'Burning ' + full(TOTAL[mine]) + ' ' + sym + ' costs ' + usd(spent) + ' at that market cap. Fewer crabs awake pays it back faster.';
    sayVol();
    last = { v, fee, pot, awake, level: mine, hour: myHour, n, w, ibMine: Math.round(ibMine * 100), ibOthers: Math.round(ibOthers * 100), legend: myMult > 1 }; $('tkMsg').textContent = '';
    $('tkAwakeMsg').textContent = awake > C.collection.supply ? 'That is more awake crabs than exist. There are only ' + C.collection.supply.toLocaleString('en-US') + '.' : v === 0 ? 'No trading means no fee, so the pot is empty and every crab gets nothing that hour.' : '';
  }
  // a shared link carries the inputs, so whoever opens it sees the same result: ?v=volume&f=fee&p=pot&n=awake,..&w=weights,..&l=level
  const Q = new URLSearchParams(location.search), qn = (k) => (Q.has(k) && isFinite(parseFloat(Q.get(k))) ? Math.max(0, parseFloat(Q.get(k))) : null), ql = (k, ins) => { if (Q.has(k)) Q.get(k).split(',').slice(0, LV).forEach((x, i) => { if (isFinite(parseFloat(x))) ins[i].value = Math.max(0, parseFloat(x)); }); };
  if (qn('v') != null) { vol.value = qn('v'); range.value = toRange(qn('v')); }
  if (qn('f') != null && !T.tradeFeePct) $('fee').value = Math.min(100, qn('f'));
  if (qn('p') != null && !T.potSharePct) $('pot').value = Math.min(100, qn('p'));
  ql('n', awakeIn); if (!realW.every(Boolean)) ql('w', weightIn);
  if (qn('ib') != null) $('ibMine').value = Math.min(100, qn('ib')); if (qn('ob') != null) $('ibOthers').value = Math.min(100, qn('ob'));
  if (Q.get('lg') === '1') $('tkLegend').checked = true;
  if (qn('l') != null) mine = Math.max(1, Math.min(LV, Math.round(qn('l'))));
  let last = null;
  calc();

  // ---- share: a link that reopens this exact result, and a 1200x675 picture of it (the warning is printed on the picture)
  $('tkCopy').addEventListener('click', async () => {
    const url = location.origin + location.pathname + '?v=' + last.v + '&f=' + last.fee + '&p=' + last.pot + '&n=' + last.n.join(',') + '&w=' + last.w.join(',') + '&l=' + last.level + (last.legend ? '&lg=1' : '') + (last.ibMine || last.ibOthers ? '&ib=' + last.ibMine + '&ob=' + last.ibOthers : '') + '#sim';
    try { await navigator.clipboard.writeText(url); $('tkMsg').textContent = 'Link copied. It opens the simulator with these numbers.'; } catch (e) { $('tkMsg').textContent = url; }
  });
  $('tkSave').addEventListener('click', async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const c = el('canvas', { width: 1200, height: 675 }), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#12222f'; x.fillRect(0, 0, 1200, 675); x.fillStyle = '#ffe58f'; x.fillRect(14, 14, 1172, 647);
    x.fillStyle = '#12222f'; x.fillRect(62, 70, 376, 376); x.drawImage($('tkCrab'), 70, 78, 360, 360);
    x.font = '26px Silkscreen, monospace'; x.fillText('LEVEL ' + last.level + ' CRAB', 62, 492);
    x.font = '30px Silkscreen, monospace'; x.fillText('IF ' + sym + ' TRADES', 490, 112); x.font = '54px Silkscreen, monospace'; x.fillText(usd(last.v).replace(/\.00$/, '') + ' A DAY', 490, 176);
    x.font = '700 30px Nunito, sans-serif'; x.fillStyle = '#41586a'; x.fillText('one ' + (last.legend ? 'LEGEND at level ' : 'level ') + last.level + ' crab would get about, in ' + ((C.payouts && C.payouts.symbol) || 'USDG'), 490, 240);
    x.fillStyle = '#12222f'; x.fillRect(490, 264, 648, 120); x.fillStyle = '#ffe58f'; x.font = '64px Silkscreen, monospace'; x.fillText(usd(last.hour * 24), 514, 348); const bigW = x.measureText(usd(last.hour * 24)).width; x.font = '26px Silkscreen, monospace'; x.fillText('A DAY', 514 + bigW + 22, 322); x.font = '20px Silkscreen, monospace'; x.fillText('ABOUT ' + about(last.hour * 24 * 7) + ' A WEEK', 514 + bigW + 22, 354);
    x.fillStyle = '#41586a'; x.font = '700 26px Nunito, sans-serif'; x.fillText('Inputs: ' + last.awake.toLocaleString('en-US') + ' crabs awake.', 490, 430); if (last.ibMine || last.ibOthers) x.fillText('Items: +' + last.ibMine + '% on this crab, +' + last.ibOthers + '% on the others.', 490, 466);
    x.fillStyle = '#ff6b57'; x.fillRect(62, 512, 1076, 104); x.fillStyle = '#12222f'; x.font = '800 27px Nunito, sans-serif'; x.fillText('An illustration with made-up inputs, not a forecast. No trading means no pay.', 84, 552);
    x.font = '800 24px Nunito, sans-serif'; x.fillText('Earned, not kept: unclaimed pay sits in the pool, where a raid can take half.', 84, 590);
    x.fillStyle = '#12222f'; x.font = '24px Silkscreen, monospace'; const label = C.name.toUpperCase() + (C.url ? ' · ' + C.url.replace(/^https?:\/\//, '') : ''); x.fillText(label, 1138 - x.measureText(label).width, 646);
    c.toBlob((b) => { const a = el('a', { href: URL.createObjectURL(b), download: 'crab-pay-example.png' }); document.body.append(a); a.click(); a.remove(); $('tkMsg').textContent = 'Picture saved. The warning is printed on it, please leave it there.'; });
  });

  // ---- supply sink: how much of the fixed supply the crabs destroy, from the ladder alone
  (function sink() {
    const SUP = SUPPLY, N = C.collection.supply, host = $('tkSliders');
    if (!SUP || !TOTAL[LV]) { $('sink').hidden = true; return; }
    const cells = []; for (let i = 0; i < 100; i++) { const c = el('i'); $('tkCells').append(c); cells.push(c); }
    const rows = [], burnedBy = (skip) => rows.reduce((a, r, i) => a + (r === skip ? 0 : +r.inp.value * TOTAL[i + 1]), 0);
    // two limits on every slider: there are only N crabs, and there is only SUP $CRAB to burn
    for (let L = 1; L <= LV; L++) { const out = el('output', { for: 's' + L }), inp = el('input', { type: 'range', min: '0', max: String(N), step: '1', value: '0', id: 's' + L }), row = { inp, out };
      inp.addEventListener('input', () => { const others = rows.reduce((a, r) => a + (r === row ? 0 : +r.inp.value), 0), byCrabs = N - others, bySupply = Math.floor((SUP - burnedBy(row)) / TOTAL[L]); const want = +inp.value, max = Math.max(0, Math.min(byCrabs, bySupply)); if (want > max) inp.value = max; draw(want > max && bySupply < byCrabs ? L : 0); });
      host.append(el('div', { class: 'tk-slider' }, [el('label', { for: 's' + L, text: 'Crabs at level ' + L }), out, inp, el('small', { text: full(TOTAL[L]) + ' ' + sym + ' burned by each one' })])); rows.push(row); }
    const set = (arr) => { rows.forEach((r, i) => { r.inp.value = arr[i] || 0; }); draw(0); };
    const topMax = Math.min(N, Math.floor(SUP / TOTAL[LV])), enough = topMax >= N, mixed = [0.30, 0.22, 0.15, 0.08, 0.05].map((f) => Math.round(N * f));
    const mixedFits = mixed.reduce((a, c, i) => a + c * TOTAL[i + 1], 0) <= SUP;
    [['Every crab awake', [Math.min(N, Math.floor(SUP / TOTAL[1]))]], mixedFits ? ['A mixed sea (example)', mixed] : null, [enough ? 'Every crab at level ' + LV : 'As many level ' + LV + ' crabs as the supply allows', Array.from({ length: LV }, (_, i) => (i === LV - 1 ? topMax : 0))], ['Nobody wakes', []]].filter(Boolean).forEach(([t, arr]) => $('tkSinkPresets').append(el('button', { class: 'btn sm', type: 'button', text: t, onclick: () => set(arr) })));
    if (!enough) $('sinkFact').textContent = 'There is not enough ' + sym + ' for everyone to reach the top. Even if every token that will ever exist were burned, only ' + (SUP % TOTAL[LV] ? 'about ' : '') + full(topMax) + ' of the ' + full(N) + ' crabs could reach level ' + LV + '.';
    function draw(hitSupplyAt) {
      let burned = 0, used = 0; rows.forEach((r, i) => { const n = +r.inp.value; used += n; burned += n * TOTAL[i + 1]; r.out.textContent = n.toLocaleString('en-US'); r.inp.setAttribute('aria-valuetext', n.toLocaleString('en-US') + ' crabs'); });
      const pct = Math.min(100, burned / SUP * 100); put($('sBurn'), full(burned)); $('sPct').textContent = (pct > 0 && pct < 0.1 ? 'under 0.1' : pct.toFixed(1)) + '%';
      cells.forEach((c, i) => { const k = pct >= i + 1 ? 'b' : pct >= i + 0.5 ? 'h' : ''; if (c.className !== k) c.className = k; });
      $('tkSinkMsg').textContent = (hitSupplyAt ? 'Not possible. There is not enough ' + sym + ' left for one more level ' + hitSupplyAt + ' crab. ' : '') + (N - used).toLocaleString('en-US') + ' of ' + N.toLocaleString('en-US') + ' crabs still asleep.' + (pct >= 99.95 ? ' Every token is gone: nothing left to trade, so no pot either. This corner of the toy cannot happen in real life.' : '');
    }
    set(mixedFits ? mixed : []);
  })();

  // ---- the loop, played: one coin goes round the ring, each stop lights up and the caption says what happened
  (function player() {
    const loop = $('tkLoop'), coin = $('tkCoin'), cap = $('tkCap'), btn = $('tkPlay'), at = (k) => loop.querySelector('[data-step="' + k + '"]');
    const fee = 'a fee', pot = 'a fixed share of the fee';
    const STEPS = [['a', 'Someone buys or sells ' + sym + '.'], ['ab', 'The trade pays ' + fee + '.'], ['b', pot + ' drops into the hourly pot.'], ['bc', 'The clock hits :00.'], ['c', 'The pot buys ' + C.payouts.assets + '.'], ['cd', 'It is split by shell level.'], ['d', 'Every awake crab finds its share waiting in its tide pool.'], ['da', 'An owner wants a bigger share, or wants to raid a pool, so they buy ' + sym + '. That is another trade.'], ['mid', (T.wakeCost ? T.wakeCost + ' ' + sym : sym) + ' burned to wake a crab. Levels, items and raids burn it too. Gone for good, and round it goes.']];
    let timer = 0, i = -1;
    const stop = (msg) => { clearTimeout(timer); i = -1; loop.classList.remove('playing'); loop.querySelectorAll('.lit').forEach((n) => n.classList.remove('lit')); coin.className = 'tk-coin'; btn.textContent = 'Play the loop'; if (msg) cap.textContent = msg; };
    function step() {
      i++; if (i >= STEPS.length) return stop('That is the whole loop. No trade at the start means nothing moves.');
      const [k, text] = STEPS[i], n = at(k), r = n.getBoundingClientRect(), R = loop.getBoundingClientRect();
      loop.querySelectorAll('.lit').forEach((x) => x.classList.remove('lit')); n.classList.add('lit'); cap.textContent = (i + 1) + '/' + STEPS.length + '  ' + text[0].toUpperCase() + text.slice(1);
      const node = n.classList.contains('tk-node'); coin.style.transform = 'translate(' + Math.round(r.left - R.left + (node ? r.width - 30 : r.width / 2)) + 'px,' + Math.round(r.top - R.top + (node ? 30 : k === 'mid' ? 60 : r.height / 2)) + 'px)'; coin.className = 'tk-coin on' + (k === 'mid' ? ' burnt' : '');
      if (r.top < 70 || r.bottom > innerHeight - 10) n.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
      timer = setTimeout(step, still ? 2200 : 1700);
    }
    btn.setAttribute('aria-controls', 'tkLoop');
    btn.addEventListener('click', () => { if (i >= 0) return stop('Stopped. Press play to start again.'); loop.classList.add('playing'); btn.textContent = 'Stop'; step(); });
  })();

  // ---- where to buy: a loud "not live" until the token address is in the config
  const addr = C.contracts.token;
  if (addr) {
    $('factLive').textContent = 'Status: live';
    $('readyNote').hidden = false; $('readyNote').textContent = 'The token is live. The only real address is the one in the box above. Anything else using this name is fake.';
    $('buyTitle').textContent = sym + ' is live on ' + T.launchpad + '.';
    const box = $('tkBuy'); box.classList.remove('off'); box.textContent = '';
    const msg = el('p', { class: 'small dim', role: 'status' });
    box.append(
      el('p', { class: 'tk-shout', text: 'This is the only real ' + sym + '. Check the address letter by letter before you buy.' }),
      el('div', { class: 'tk-addr', text: addr }),
      el('div', { class: 'row' }, [
        C.links.buy ? el('a', { class: 'btn go', href: C.links.buy, rel: 'noopener', target: '_blank', text: 'Buy ' + sym }) : null,
        el('button', { class: 'btn', type: 'button', text: 'Copy the address', onclick: async () => { try { await navigator.clipboard.writeText(addr); msg.textContent = 'Address copied.'; } catch (e) { msg.textContent = 'Select the address above and copy it by hand.'; } } }),
        el('a', { class: 'btn', href: C.links.docs || '/docs/', text: 'Read the docs' }),
      ]),
      el('p', { text: 'Every trade pays a fee. The price can fall, and it can go to zero. Holding ' + sym + ' pays nothing by itself: only awake crabs get paid.' }),
      msg,
    );
  }
})();
