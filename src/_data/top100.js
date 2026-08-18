/**
 * The combined ranking: anime and PC games are two separate lists everywhere
 * else in the site (different filters, different decade eras), but rating is
 * a number either way, so nothing stops sorting them together.
 */
import catalogue from './catalogue.js';

const byRatingThenYear = (a, b) => b.rating - a.rating || a.year - b.year;

export default [...catalogue.entries].sort(byRatingThenYear).slice(0, 100);
