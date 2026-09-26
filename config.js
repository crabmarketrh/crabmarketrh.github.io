window.SHELL_CONFIG = {
  name: 'Crab Market',
  short: 'Crab Market',
  tagline: 'Hermit crabs that get paid every hour.',
  url: 'https://crabmarket.io',

  collection: {
    supply: 2222,
    legendaries: 10,
    legendIds: [228, 386, 670, 745, 1049, 1328, 1476, 1682, 1859, 2119],
    shells: 33,
    mintPrice: 'free',
    chainName: 'Robinhood Chain',
    royaltyPct: '5',
    perWallet: 2,
    teamMint: 50,
    sealHours: 24,
  },

  token: {
    symbol: '$CRAB',
    launchpad: 'Pons',
    supply: '1,000,000,000',
    tradeFeePct: '3',
    potSharePct: '45',
    wakeCost: '30,000',
    levelCosts: ['60,000', '120,000', '240,000', '550,000'],
    levelWeights: ['1x', '1.5x', '2.2x', '3.2x', '5x'],
    legendBonus: '2x',
    levelKeptOnSale: 'yes',
    noPresale: true,
    teamFirstBuy: 'about 0.1 ETH',
    ownerRedirectDelay: 'three-day',
    launchGap: 'within hours of the reveal',
    potCarriesOver: true,
    launchesAfterMint: true,
    levels: 5,
  },

  payouts: { every: 'hour', assets: 'USDG (digital dollars)', symbol: 'USDG' },

  mint: { opensAt: '2026-09-26T16:00:00Z', url: 'https://opensea.io/collection/crabmarketio', closed: true, publicAt: '2026-09-26T17:00:00Z' },
  contracts: { crabs: '0x273d6E6F6E0cA91fD6dab44dca092147251fAADD', token: '0x0F2400B119d9eda80FF375Bd1a86162affDd1247', engine: '0x48eA6D00C8587eB521C6e6D26EDf1f52Cdca0452', vault: '' },

  list: { url: 'https://crab-list.crabmarket.workers.dev', open: false, closed: true, xHandle: 'crabmarketio', countFile: '/list/count.json' },

  links: { x: 'https://x.com/crabmarketio', discord: 'https://discord.gg/Z7fwqT66jj', telegram: 'https://t.me/crabmarketio', opensea: 'https://opensea.io/collection/crabmarketio', buy: 'https://www.ponsfamily.com/launchpad/0x0F2400B119d9eda80FF375Bd1a86162affDd1247', docs: '/docs/', explorerTx: '', explorerAddress: '' },

  items: { capPct: 100, slots: 'level', immuneLimit: 10, list: [
    { id: 'disco', name: 'Disco ball', bonus: '0.05x', price: '16,000', limit: 0, left: null, blurb: 'Every beach needs a dance floor.' },
    { id: 'goldflamingo', name: 'Gold flamingo', bonus: '0.05x', price: '16,000', limit: 0, left: null, blurb: 'Like the pink one, but it cost more.' },
    { id: 'hottub', name: 'Hot tub', bonus: '0.1x', price: '32,000', limit: 0, left: null, blurb: 'Warm water, cold drinks.' },
    { id: 'jukebox', name: 'Jukebox', bonus: '0.1x', price: '32,000', limit: 0, left: null, blurb: 'Plays the same three songs. Nobody minds.' },
    { id: 'icecream', name: 'Ice cream cart', bonus: '0.15x', price: '48,000', limit: 0, left: null, blurb: 'Two flavours. Both are good.' },
    { id: 'arcade', name: 'Arcade machine', bonus: '0.2x', price: '64,000', limit: 0, left: null, blurb: 'High score: still the crab.' },
    { id: 'observatory', name: 'Observatory', bonus: '0.25x', price: '85,000', limit: 0, left: null, guard: 5, blurb: 'You see them coming. A raid on this crab takes 5 points less.' },
    { id: 'waterslide', name: 'Water slide', bonus: '0.35x', price: '120,000', limit: 0, left: null, blurb: 'Straight into the lagoon.' },
    { id: 'heli', name: 'Helipad', bonus: '0.5x', price: '180,000', limit: 0, left: null, blurb: 'The crab does not fly it. The crab owns it.' },
    { id: 'goldanchor', name: 'Golden anchor', bonus: '0.5x', price: '220,000', limit: 222, left: null, guard: 8, blurb: 'Only 222 will ever exist. Holds fast: a raid takes 8 points less.' },
    { id: 'goldcrab', name: 'Golden crab statue', bonus: '0.7x', price: '320,000', limit: 100, left: null, blurb: 'Only 100 will ever exist.' },
    { id: 'kraken', name: 'The kraken', bonus: '1x', price: '500,000', limit: 22, left: null, guard: 15, blurb: 'Only 22 will ever exist. It guards your water: a raid takes 15 points less.' },
    { id: 'seafort', name: 'The sea fort', bonus: '1x', price: '1,000,000', limit: 10, left: null, immune: true, blurb: 'Only 10 will ever exist. Nothing gets in: a crab holding it can never be raided.' },
  ] },

  raid: {
    live: false,
    startsText: 'a couple of days after launch',
    takePct: 50,
    fee: '10,000',
    cooldownHours: 12,
    guardCapPct: 25,
    minPool: '5',
    feed: '/raids/feed.json',
  },

  tides: { feed: '/tides/feed.json' },
  sea: { feed: '/sea/feed.json' },

  analyticsToken: '',
};
