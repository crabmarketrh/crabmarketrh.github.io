// The legend hunt: the 10 one-of-a-kind crabs hide around the site, one per marked spot. Find all 10 and the list card gets a gold LEGEND HUNTER plate.
// The plate is for show only. Nothing here may say or imply that it affects the mint or a list spot.
// A page opts in with <span data-hunt="home"></span> (any slot name below) and one script tag after ui.js. Nothing here touches the page's own code.
//   CrabHunt.mount()  put a hidden legend in every [data-hunt] on the page, and the counter in the footer
//   CrabHunt.found()  how many of the 10 this visitor has found (a number)
(function () {
  if (typeof LEGENDARY === 'undefined' || !window.SH) return;
  const { el, piece, still } = SH, KEY = 'crab-hunt-v1', TOTAL = LEGENDARY.length;
  // slot name -> which legend hides there. Ten slots, ten legends, each legend exactly once.
  const SLOTS = { home: 0, home2: 1, token: 2, token2: 3, meet: 4, list: 5, docs: 6, docs2: 7, sea: 8, tides: 9 };
  const load = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]').filter((n) => LEGENDARY.includes(n))); } catch (e) { return new Set(); } };
  const save = (set) => { try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch (e) { /* private window: the hunt still works for this visit */ } };
  let got = load(), counter = null, toast = null, toastTimer = 0;

  const CSS = '.hunt{all:unset;box-sizing:border-box;display:inline-block;vertical-align:middle;width:40px;height:40px;cursor:pointer;border:2px dashed transparent;opacity:.28;filter:grayscale(1);transition:opacity .2s,filter .2s,transform .2s;line-height:0}' +
    '.hunt canvas{width:100%;height:100%}.hunt:hover,.hunt:focus-visible{opacity:1;filter:none;border-color:currentColor;background:#fffaf0}.hunt:focus-visible{outline:3px solid #ff6b57;outline-offset:3px}' +
    '.hunt.got{opacity:1;filter:none;border:2px solid #12222f;box-shadow:3px 3px 0 #12222f;cursor:default}.hunt.pop{transform:scale(1.35) rotate(-6deg)}' +
    '.hunt-count{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:16px;font:400 12.5px/1.4 "Silkscreen",monospace;color:#fff}.hunt-count i{display:block;width:12px;height:12px;border:2px solid #a9bccb}.hunt-count i.on{background:#ffe58f;border-color:#ffe58f}.hunt-count span{flex-basis:100%;font:400 14.5px/1.5 "Nunito",sans-serif;color:#a9bccb}' +
    '.hunt-toast{position:fixed;left:50%;bottom:84px;transform:translate(-50%,20px);z-index:60;display:flex;gap:12px;align-items:center;width:max-content;max-width:min(92vw,440px);background:#12222f;color:#fffaf0;border:3px solid #ffe58f;box-shadow:6px 6px 0 rgba(18,34,47,.35);padding:10px 14px;font:700 15px/1.35 "Nunito",sans-serif;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}' +
    '.hunt-toast.on{opacity:1;transform:translate(-50%,0)}.hunt-toast canvas{width:48px;height:48px;flex:none;border:2px solid #fffaf0}' +
    '@media (prefers-reduced-motion:reduce){.hunt,.hunt-toast{transition:none}.hunt.pop{transform:none}}';

  function say(name) {
    if (!toast) { toast = el('div', { class: 'hunt-toast', role: 'status' }); document.body.append(toast); }
    const n = got.size, all = n >= TOTAL;
    toast.textContent = ''; toast.append(piece(legendTraits(name), { seed: 200 + LEGENDARY.indexOf(name), label: '' }), el('span', { text: 'You found ' + SHELL_NAMES[name] + '. ' + (all ? 'That is all ' + TOTAL + ' legends. Your list card now carries a gold LEGEND HUNTER plate.' : n + ' of ' + TOTAL + ' found. Find all ' + TOTAL + ' for a gold plate on your list card.') }));
    toast.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('on'), all ? 7000 : 4200);
  }
  function drawCounter() {
    if (!counter) return; counter.textContent = ''; counter.append('Legends found ' + got.size + '/' + TOTAL + ' ');
    for (let i = 0; i < TOTAL; i++) counter.append(el('i', { class: got.has(LEGENDARY[i]) ? 'on' : null }));
    const link = () => el('a', { href: '/list/', text: 'list card', style: 'display:inline;padding:0;text-decoration:underline;color:inherit' });
    counter.append(got.size >= TOTAL ? el('span', {}, ['All found. Make your ', link(), ' to see the gold plate. It is for show only: it does not change your spot or the mint.'])
      : el('span', {}, ['The ' + TOTAL + ' one-of-a-kind crabs hide around this site. Find all ' + TOTAL + ' and your ', link(), ' gets a gold LEGEND HUNTER plate. It is for show only: it does not change your spot or the mint.']));
  }
  function mount() {
    if (!document.getElementById('huntCss')) document.head.append(el('style', { id: 'huntCss', text: CSS }));
    document.querySelectorAll('[data-hunt]').forEach((spot) => {
      const i = SLOTS[spot.dataset.hunt]; if (i == null || spot.firstChild) return;
      const name = LEGENDARY[i], c = piece(legendTraits(name), { seed: 200 + i, label: '' }); c.setAttribute('aria-hidden', 'true');
      const b = el('button', { class: 'hunt' + (got.has(name) ? ' got' : ''), type: 'button', 'aria-label': got.has(name) ? 'Found: ' + SHELL_NAMES[name] : 'Something is hiding here' }, [c]);
      b.addEventListener('click', () => { if (got.has(name)) return; got = load(); got.add(name); save(got); b.classList.add('got'); b.setAttribute('aria-label', 'Found: ' + SHELL_NAMES[name]); if (!still) { b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 260); } drawCounter(); say(name); document.dispatchEvent(new CustomEvent('crabhunt', { detail: { found: got.size, total: TOTAL } })); });
      spot.append(b);
    });
    const foot = document.querySelector('#foot .wrap > div');
    if (foot && !counter) { counter = el('div', { class: 'hunt-count', 'aria-live': 'polite' }); foot.append(counter); }
    drawCounter();
  }
  window.CrabHunt = { mount, found: () => load().size, total: TOTAL, slots: Object.keys(SLOTS) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
