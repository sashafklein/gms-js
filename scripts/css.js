const sass = require("sass");
const fs = require("fs");

const build = async () => {
  const result = sass.compile("./scss/index.scss");
  return await fs.writeFileSync("./build/index.css", result.css);
};

module.exports = build;
