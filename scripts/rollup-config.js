const babel = require("@rollup/plugin-babel").babel;
const nodeResolve = require("@rollup/plugin-node-resolve").nodeResolve;
const dependencies = require("../package.json").dependencies;

module.exports = {
  input: "./index.js",
  output: {
    file: "./build/index.js",
    format: "iife",
    name: "GMS",
    globals: { axios: "axios" },
  },
  external: Object.keys(dependencies),
  plugins: [nodeResolve(), babel()],
};
