// Cascade-layer order pin, the postcss port of the old md3:layer-order vite
// plugin. The first layer declaration the browser parses fixes the order, and
// stylesheet parse order in <head> is not guaranteed across chunks; prepending
// the statement to every emitted stylesheet makes every parse order correct —
// repeats are no-ops once the order exists. (@layer statements are valid
// before @import per CSS Cascade 5, so import-only files stay correct.)
module.exports = () => ({
  postcssPlugin: "md3-layer-order",
  Once(root, { AtRule }) {
    root.prepend(new AtRule({ name: "layer", params: "theme, base, components, utilities" }));
  },
});
module.exports.postcss = true;
