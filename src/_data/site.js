export default {
  name: 'OtakuPlay',
  url: 'https://pavankalyan-9.github.io/otakuplay/',
  repo: 'https://github.com/Pavankalyan-9/otakuplay',
  tagline: 'Best Anime & PC Games, Ranked by Era',
  description:
    'A ranked, decade-by-decade collection of the best anime (1963–2025) and best PC games (1993–2025) — 219 curated titles with genres, studios, ratings and personal tracking.',
  firstYear: 1963,
  lastYear: 2025,

  /* Cookieless page counts. Leave `code` empty and no script is emitted at all —
     the site ships zero analytics by default, which is what /about/ promises.
     To turn it on, register the domain at https://www.goatcounter.com and put
     your site code here (the "xxx" in xxx.goatcounter.com). It sets no cookies,
     stores no personal data and needs no consent banner. */
  analytics: {
    code: '',
    endpoint: 'https://gc.zgo.at/count.js',
  },
  nav: [
    { label: 'Anime',    url: 'anime/',    key: 'anime' },
    { label: 'PC Games', url: 'games/',    key: 'games' },
    { label: 'Insights', url: 'insights/', key: 'insights' },
    { label: 'About',    url: 'about/',    key: 'about' },
  ],
};
