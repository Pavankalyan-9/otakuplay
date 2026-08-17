/**
 * OtakuPlay build.
 *
 * The catalogue itself (data.js, app.js, style.css, sw.js, icons) is plain static
 * output — Eleventy only assembles the pages around it, so the shell lives in one
 * place instead of being copy-pasted into five files.
 *
 * Links and asset paths are relative and depth-aware (`root`), so the same build
 * works at a domain root, under /otakuplay/ on GitHub Pages, and from a local
 * static server, with no pathPrefix juggling.
 */
export default function (eleventyConfig) {
  ['app.js', 'data.js', 'style.css', 'sw.js', 'manifest.json', 'icons'].forEach(file =>
    eleventyConfig.addPassthroughCopy({ [file]: file }));

  // "" for the root page, "../" one level down, and so on.
  eleventyConfig.addGlobalData('eleventyComputed', {
    root: data => {
      const depth = (data.page.url.match(/\//g) || []).length - 1;
      return depth > 0 ? '../'.repeat(depth) : '';
    },
  });

  eleventyConfig.addFilter('absoluteUrl', (path, base) =>
    new URL(path.replace(/^\//, ''), base.endsWith('/') ? base : `${base}/`).href);

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
}
