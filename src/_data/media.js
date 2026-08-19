/**
 * Build-time medium registry — the Eleventy-layer mirror of app.js's client-side
 * `SECTIONS` object. Two separate, hand-written config objects rather than one
 * shared file: data.js/app.js run as plain browser scripts (no bundler, by
 * design) while src/_data/*.js runs at build time in Node/ESM — genuinely
 * different runtimes with no practical way to share a module between them
 * without introducing a bundler, which this project deliberately avoids.
 *
 * `Object.keys(media)` is the canonical list of mediums for every build-time
 * loop (hub generation, catalogue assembly) that used to hardcode
 * ['anime', 'games'].
 */
export default {
  anime: { noun: 'Anime', nounLower: 'anime', verb: 'watch', trailerQuery: 'anime trailer',
           schemaType: 'TVSeries', schemaPublisherKey: 'productionCompany' },
  games: { noun: 'PC Games', nounLower: 'PC games', verb: 'play', trailerQuery: 'gameplay trailer',
           schemaType: 'VideoGame', schemaPublisherKey: 'publisher' },
};
