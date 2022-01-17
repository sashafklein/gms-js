module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 13,
    sourceType: "module",
  },
  rules: {},
  globals: {
    module: "readonly",
    gms: "writeable",
    require: "readonly",
    __dirname: "readonly",

    // Jest
    test: "readonly",
    it: "readonly",
    describe: "readonly",
    xit: "readonly",
    xdescribe: "readonly",
    beforeEach: "readonly",
    afterEach: "readonly",
    expect: "readonly",
    jest: "readonly",
    process: "readonly",
  },
};
