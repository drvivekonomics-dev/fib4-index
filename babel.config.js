const path = require("path");

function expoBabelPreset() {
  const expoRoot = path.dirname(require.resolve("expo/package.json"));
  return require.resolve("babel-preset-expo", { paths: [expoRoot] });
}

module.exports = function (api) {
  api.cache(true);
  return { presets: [expoBabelPreset()] };
};
